import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import {
  Patient,
  PatientStatus,
  MonitoringStatus,
  ConsultationFrequency,
} from '../entities/patient.entity';
import { Measurement } from '../entities/measurement.entity';
import {
  Consultation,
  ConsultationStatus,
  ConsultationType,
} from '../entities/consultation.entity';
import { MealPlan } from '../../meal-plan/entities/meal-plan.entity';
import { Meal } from '../../meal-plan/entities/meal.entity';
import { MealFood } from '../../meal-plan/entities/meal-food.entity';
import { Gender as PatientGender } from '../enums/gender.enum';
import { Food } from '../../foods/entities/food.entity';
import { PhotosService } from '../../photos/photos.service';
import { PhotoType } from '../../photos/entities/photo.entity';
import * as fs from 'fs';
import * as path from 'path';
import { EnergyPlanService } from '../../energy-plan/energy-plan.service';
import { EnergyFormula } from '../../energy-plan/enums/energy-formulas.enum';
import { ActivityFactor } from '../../energy-plan/enums/activity-factors.enum';
import { InjuryFactor } from '../../energy-plan/enums/injury-factors.enum';
import { Gender as EnergyPlanGender } from '../../energy-plan/enums/gender.enum';

@Injectable()
export class SamplePatientService {
  private readonly logger = new Logger(SamplePatientService.name);
  private foodsData: any[] = [];

  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Measurement)
    private readonly measurementRepository: Repository<Measurement>,
    @InjectRepository(Consultation)
    private readonly consultationRepository: Repository<Consultation>,
    @InjectRepository(MealPlan)
    private readonly mealPlanRepository: Repository<MealPlan>,
    @InjectRepository(Meal)
    private readonly mealRepository: Repository<Meal>,
    @InjectRepository(MealFood)
    private readonly mealFoodRepository: Repository<MealFood>,
    @InjectRepository(Food)
    private readonly foodRepository: Repository<Food>,
    private readonly photosService: PhotosService,
    private readonly energyPlanService: EnergyPlanService,
  ) {
    this.loadFoodsData();
  }

  /**
   * Loads foods data from JSON file
   */
  private loadFoodsData(): void {
    try {
      const filePath = path.join(
        process.cwd(),
        'src',
        'food-db',
        'alimentos.json',
      );
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(fileContent);
      if (Array.isArray(parsed)) {
        this.foodsData = parsed;
      } else if (parsed && Array.isArray(parsed.alimentos)) {
        this.foodsData = parsed.alimentos;
      } else if (parsed && typeof parsed === 'object') {
        // Caso seja um objeto de alimentos (chave = id)
        this.foodsData = Object.values(parsed);
      } else {
        this.logger.error('Formato inesperado em alimentos.json');
        this.foodsData = [];
      }
      this.logger.log(
        `Foods data loaded: ${Array.isArray(this.foodsData) ? this.foodsData.length : 'N/A'} alimentos`,
      );
    } catch (error) {
      this.logger.error('Error loading foods data:', error);
      this.foodsData = [];
    }
  }

  // Função utilitária para normalizar strings (remove acentos, minúsculas, etc)
  private normalize(str: string): string {
    return str
      ? str
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // CORRETO: remove apenas acentos
          .toLowerCase()
          .replace(/\s+/g, ' ')
          .trim()
      : '';
  }

  /**
   * Finds a food in the JSON data by name (busca flexível, ignora acentos e caixa)
   * @param name The name of the food to find
   * @returns The food data or null if not found
   */
  private findFoodInJson(name: string): any {
    if (!Array.isArray(this.foodsData)) {
      this.logger.error('foodsData não é um array!');
      return null;
    }
    const normalizedName = this.normalize(name);
    this.logger.log(`Buscando: "${normalizedName}"`);
    for (const food of this.foodsData) {
      const normFoodName = this.normalize(food.nome || '');
      this.logger.log(`Comparando com: "${normFoodName}"`);
      if (normFoodName.includes(normalizedName)) {
        this.logger.log(`Encontrado: "${food.nome}"`);
        return food;
      }
    }
    return null;
  }

  /**
   * Creates a sample patient for a nutritionist
   * @param nutritionistId The ID of the nutritionist
   * @returns The created sample patient
   */
  async createSamplePatient(nutritionistId: string): Promise<Patient> {
    this.logger.log(
      `Creating sample patient for nutritionist ${nutritionistId}`,
    );

    try {
      // Create sample patient
      const patient = await this.createPatient(nutritionistId);

      // Create sample measurements
      await this.createMeasurements(patient);

      // Create sample consultations
      await this.createConsultations(patient);

      // Create sample meal plan
      await this.createMealPlan(patient);

      // Create sample energy plan
      await this.createEnergyPlan(patient);

      this.logger.log(
        `Sample patient created successfully for nutritionist ${nutritionistId}`,
      );

      return patient;
    } catch (error) {
      this.logger.error(
        `Error creating sample patient: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Recreates the sample patient for a nutritionist
   * @param nutritionistId The ID of the nutritionist
   * @returns The newly created sample patient
   */
  async recreateSamplePatient(nutritionistId: string): Promise<Patient> {
    this.logger.log(
      `Recreating sample patient for nutritionist ${nutritionistId}`,
    );

    try {
      // Find existing sample patient
      const existingSamplePatient = await this.patientRepository.findOne({
        where: { nutritionistId, isSample: true },
      });

      if (existingSamplePatient) {
        // Delete related meal plans first
        await this.mealPlanRepository.delete({
          patientId: existingSamplePatient.id,
        });

        // Delete related measurements
        await this.measurementRepository.delete({
          patientId: existingSamplePatient.id,
        });

        // Delete related consultations
        await this.consultationRepository.delete({
          patientId: existingSamplePatient.id,
        });

        // Now delete the patient
        await this.patientRepository.remove(existingSamplePatient);
        this.logger.log(
          `Deleted existing sample patient for nutritionist ${nutritionistId}`,
        );
      }

      // Create new sample patient
      const newSamplePatient = await this.createSamplePatient(nutritionistId);
      this.logger.log(
        `New sample patient created successfully for nutritionist ${nutritionistId}`,
      );

      return newSamplePatient;
    } catch (error) {
      this.logger.error(
        `Error recreating sample patient: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Creates a sample patient with realistic data
   * @param nutritionistId The ID of the nutritionist
   * @returns The created patient
   */
  private async createPatient(nutritionistId: string): Promise<Patient> {
    const patient = this.patientRepository.create({
      name: 'Maria Silva (Exemplo)',
      email: `${Date.now()}@exemplo.com`,
      cpf: undefined, // Not setting a CPF to avoid conflicts
      phone: '(11) 98765-4321',
      address: 'Av. Paulista, 1000, São Paulo - SP',
      birthDate: '1990-05-15',
      gender: PatientGender.FEMALE,
      instagram: '@maria.exemplo',
      status: PatientStatus.ACTIVE,
      height: 165,
      weight: 68.5,
      goals: ['Perda de peso', 'Alimentação saudável', 'Mais energia'],
      allergies: ['Amendoim'],
      healthConditions: ['Hipotireoidismo'],
      medications: ['Levotiroxina 50mcg'],
      observations:
        'Paciente exemplo criado automaticamente para demonstração do sistema.',
      nutritionistId,
      monitoringStatus: MonitoringStatus.IN_PROGRESS,
      consultationFrequency: ConsultationFrequency.MONTHLY,
      isSample: true, // Mark as sample patient
    });

    return this.patientRepository.save(patient);
  }

  /**
   * Uploads photos for a measurement
   * @param measurement The measurement to upload photos for
   * @param isRecent Whether this is the most recent measurement
   */
  private async uploadPhotosForMeasurement(
    measurement: Measurement,
    isRecent: boolean,
  ): Promise<void> {
    const photosDir = path.join(process.cwd(), 'src', 'photos');
    let prefix: string;

    // Determine prefix based on measurement date
    const measurementDate = new Date(measurement.date);
    const now = new Date();
    const monthsDiff =
      (now.getFullYear() - measurementDate.getFullYear()) * 12 +
      (now.getMonth() - measurementDate.getMonth());

    if (isRecent) {
      prefix = 'atual';
    } else if (monthsDiff === 6) {
      prefix = '6meses';
    } else if (monthsDiff === 3) {
      prefix = '3meses';
    } else {
      this.logger.warn(
        `No photos available for measurement ${monthsDiff} months ago`,
      );
      return;
    }

    try {
      // Upload front photo
      const frontPhotoPath = path.join(photosDir, `${prefix}frente.png`);
      if (fs.existsSync(frontPhotoPath)) {
        const frontPhotoBuffer = fs.readFileSync(frontPhotoPath);
        await this.photosService.uploadPhoto({
          file: {
            buffer: frontPhotoBuffer,
            originalname: `${prefix}frente.png`,
            mimetype: 'image/png',
          },
          patientId: measurement.patientId,
          assessmentId: measurement.id,
          type: PhotoType.FRONT,
        });
      }

      // Upload back photo
      const backPhotoPath = path.join(photosDir, `${prefix}costas.png`);
      if (fs.existsSync(backPhotoPath)) {
        const backPhotoBuffer = fs.readFileSync(backPhotoPath);
        await this.photosService.uploadPhoto({
          file: {
            buffer: backPhotoBuffer,
            originalname: `${prefix}costas.png`,
            mimetype: 'image/png',
          },
          patientId: measurement.patientId,
          assessmentId: measurement.id,
          type: PhotoType.BACK,
        });
      }

      // Upload right side photo
      const rightPhotoPath = path.join(
        photosDir,
        `${prefix}lateraldireita.png`,
      );
      if (fs.existsSync(rightPhotoPath)) {
        const rightPhotoBuffer = fs.readFileSync(rightPhotoPath);
        await this.photosService.uploadPhoto({
          file: {
            buffer: rightPhotoBuffer,
            originalname: `${prefix}lateraldireita.png`,
            mimetype: 'image/png',
          },
          patientId: measurement.patientId,
          assessmentId: measurement.id,
          type: PhotoType.RIGHT,
        });
      }
    } catch (error) {
      this.logger.error(
        `Error uploading photos for measurement ${measurement.id}:`,
        error,
      );
    }
  }

  /**
   * Creates sample measurements for a patient
   * @param patient The patient to create measurements for
   */
  private async createMeasurements(patient: Patient): Promise<void> {
    // Create old measurement (1 year ago)
    const oldDate = new Date();
    oldDate.setFullYear(oldDate.getFullYear() - 1);

    const oldMeasurement = this.measurementRepository.create({
      date: oldDate,
      weight: 77.0,
      height: 165,
      sittingHeight: undefined,
      kneeHeight: undefined,
      bodyFat: 35.2,
      fatMass: 27.1,
      muscleMassPercentage: 26.8,
      muscleMass: 20.6,
      fatFreeMass: 77.0 - 27.1,
      boneMass: undefined,
      visceralFat: 9,
      bodyWater: undefined,
      metabolicAge: undefined,
      measurements: {
        neck: 36,
        shoulder: 107,
        chest: 97,
        waist: 86,
        abdomen: 92,
        hip: 108,
        relaxedArmLeft: 32,
        relaxedArmRight: 32,
        contractedArmLeft: 34,
        contractedArmRight: 34,
        forearmLeft: 27,
        forearmRight: 27,
        proximalThighLeft: 57,
        proximalThighRight: 57,
        medialThighLeft: 54,
        medialThighRight: 54,
        distalThighLeft: 50,
        distalThighRight: 50,
        calfLeft: 39,
        calfRight: 39,
      },
      skinfolds: {
        tricipital: 30,
        bicipital: 17,
        abdominal: 38,
        subscapular: 27,
        axillaryMedian: 24,
        thigh: 40,
        thoracic: 20,
        suprailiac: 34,
        calf: 27,
        supraspinal: 30,
      },
      boneDiameters: undefined,
      skinfoldFormula: undefined,
      patient,
      patientId: patient.id,
      nutritionistId: patient.nutritionistId,
    } as DeepPartial<Measurement>);

    await this.measurementRepository.save(oldMeasurement);
    this.logger.log(
      `[Sample] Medição 1 ano atrás: weight=77.0, fatMass=27.1, fatFreeMass=${77.0 - 27.1}`,
    );

    // Create measurement 10 months ago (gained 2kg)
    const date10MonthsAgo = new Date();
    date10MonthsAgo.setMonth(date10MonthsAgo.getMonth() - 10);

    const measurement10MonthsAgo = this.measurementRepository.create({
      date: date10MonthsAgo,
      weight: 79.0,
      height: 165,
      sittingHeight: undefined,
      kneeHeight: undefined,
      bodyFat: 35.8,
      fatMass: 28.3,
      muscleMassPercentage: 26.5,
      muscleMass: 20.9,
      fatFreeMass: 79.0 - 28.3,
      boneMass: undefined,
      visceralFat: 9.2,
      bodyWater: undefined,
      metabolicAge: undefined,
      measurements: {
        neck: 36.5,
        shoulder: 108,
        chest: 98,
        waist: 87,
        abdomen: 93,
        hip: 109,
        relaxedArmLeft: 32.5,
        relaxedArmRight: 32.5,
        contractedArmLeft: 34.5,
        contractedArmRight: 34.5,
        forearmLeft: 27.2,
        forearmRight: 27.2,
        proximalThighLeft: 58,
        proximalThighRight: 58,
        medialThighLeft: 55,
        medialThighRight: 55,
        distalThighLeft: 51,
        distalThighRight: 51,
        calfLeft: 39.5,
        calfRight: 39.5,
      },
      skinfolds: {
        tricipital: 31,
        bicipital: 17.5,
        abdominal: 39,
        subscapular: 28,
        axillaryMedian: 25,
        thigh: 41,
        thoracic: 21,
        suprailiac: 35,
        calf: 28,
        supraspinal: 31,
      },
      boneDiameters: undefined,
      skinfoldFormula: undefined,
      patient,
      patientId: patient.id,
      nutritionistId: patient.nutritionistId,
    } as DeepPartial<Measurement>);

    await this.measurementRepository.save(measurement10MonthsAgo);
    this.logger.log(
      `[Sample] Medição 10 meses atrás: weight=79.0, fatMass=28.3, fatFreeMass=${79.0 - 28.3}`,
    );

    // Create measurement 8 months ago (lost 1kg)
    const date8MonthsAgo = new Date();
    date8MonthsAgo.setMonth(date8MonthsAgo.getMonth() - 8);

    const measurement8MonthsAgo = this.measurementRepository.create({
      date: date8MonthsAgo,
      weight: 78.0,
      height: 165,
      sittingHeight: undefined,
      kneeHeight: undefined,
      bodyFat: 35.5,
      fatMass: 27.7,
      muscleMassPercentage: 26.7,
      muscleMass: 20.8,
      fatFreeMass: 78.0 - 27.7,
      boneMass: undefined,
      visceralFat: 9.1,
      bodyWater: undefined,
      metabolicAge: undefined,
      measurements: {
        neck: 36.3,
        shoulder: 107.5,
        chest: 97.5,
        waist: 86.5,
        abdomen: 92.5,
        hip: 108.5,
        relaxedArmLeft: 32.3,
        relaxedArmRight: 32.3,
        contractedArmLeft: 34.3,
        contractedArmRight: 34.3,
        forearmLeft: 27.1,
        forearmRight: 27.1,
        proximalThighLeft: 57.5,
        proximalThighRight: 57.5,
        medialThighLeft: 54.5,
        medialThighRight: 54.5,
        distalThighLeft: 50.5,
        distalThighRight: 50.5,
        calfLeft: 39.3,
        calfRight: 39.3,
      },
      skinfolds: {
        tricipital: 30.5,
        bicipital: 17.3,
        abdominal: 38.5,
        subscapular: 27.5,
        axillaryMedian: 24.5,
        thigh: 40.5,
        thoracic: 20.5,
        suprailiac: 34.5,
        calf: 27.5,
        supraspinal: 30.5,
      },
      boneDiameters: undefined,
      skinfoldFormula: undefined,
      patient,
      patientId: patient.id,
      nutritionistId: patient.nutritionistId,
    } as DeepPartial<Measurement>);

    await this.measurementRepository.save(measurement8MonthsAgo);
    this.logger.log(
      `[Sample] Medição 8 meses atrás: weight=78.0, fatMass=27.7, fatFreeMass=${78.0 - 27.7}`,
    );

    // Create measurement 6 months ago (gained 0.5kg)
    const date6MonthsAgo = new Date();
    date6MonthsAgo.setMonth(date6MonthsAgo.getMonth() - 6);

    const measurement6MonthsAgo = this.measurementRepository.create({
      date: date6MonthsAgo,
      weight: 78.5,
      height: 165,
      sittingHeight: undefined,
      kneeHeight: undefined,
      bodyFat: 35.6,
      fatMass: 27.9,
      muscleMassPercentage: 26.6,
      muscleMass: 20.9,
      fatFreeMass: 78.5 - 27.9,
      boneMass: undefined,
      visceralFat: 9.1,
      bodyWater: undefined,
      metabolicAge: undefined,
      measurements: {
        neck: 36.4,
        shoulder: 107.7,
        chest: 97.7,
        waist: 86.7,
        abdomen: 92.7,
        hip: 108.7,
        relaxedArmLeft: 32.4,
        relaxedArmRight: 32.4,
        contractedArmLeft: 34.4,
        contractedArmRight: 34.4,
        forearmLeft: 27.15,
        forearmRight: 27.15,
        proximalThighLeft: 57.7,
        proximalThighRight: 57.7,
        medialThighLeft: 54.7,
        medialThighRight: 54.7,
        distalThighLeft: 50.7,
        distalThighRight: 50.7,
        calfLeft: 39.4,
        calfRight: 39.4,
      },
      skinfolds: {
        tricipital: 30.7,
        bicipital: 17.4,
        abdominal: 38.7,
        subscapular: 27.7,
        axillaryMedian: 24.7,
        thigh: 40.7,
        thoracic: 20.7,
        suprailiac: 34.7,
        calf: 27.7,
        supraspinal: 30.7,
      },
      boneDiameters: undefined,
      skinfoldFormula: undefined,
      patient,
      patientId: patient.id,
      nutritionistId: patient.nutritionistId,
    } as DeepPartial<Measurement>);

    await this.measurementRepository.save(measurement6MonthsAgo);
    this.logger.log(
      `[Sample] Medição 6 meses atrás: weight=78.5, fatMass=27.9, fatFreeMass=${78.5 - 27.9}`,
    );

    // After saving the 6-month-old measurement, upload its photos
    await this.uploadPhotosForMeasurement(measurement6MonthsAgo, false);

    // Create measurement 5 months ago (lost 1.5kg)
    const date5MonthsAgo = new Date();
    date5MonthsAgo.setMonth(date5MonthsAgo.getMonth() - 5);

    const measurement5MonthsAgo = this.measurementRepository.create({
      date: date5MonthsAgo,
      weight: 77.0,
      height: 165,
      sittingHeight: undefined,
      kneeHeight: undefined,
      bodyFat: 35.2,
      fatMass: 27.1,
      muscleMassPercentage: 26.8,
      muscleMass: 20.6,
      fatFreeMass: 77.0 - 27.1,
      boneMass: undefined,
      visceralFat: 9,
      bodyWater: undefined,
      metabolicAge: undefined,
      measurements: {
        neck: 36,
        shoulder: 107,
        chest: 97,
        waist: 86,
        abdomen: 92,
        hip: 108,
        relaxedArmLeft: 32,
        relaxedArmRight: 32,
        contractedArmLeft: 34,
        contractedArmRight: 34,
        forearmLeft: 27,
        forearmRight: 27,
        proximalThighLeft: 57,
        proximalThighRight: 57,
        medialThighLeft: 54,
        medialThighRight: 54,
        distalThighLeft: 50,
        distalThighRight: 50,
        calfLeft: 39,
        calfRight: 39,
      },
      skinfolds: {
        tricipital: 30,
        bicipital: 17,
        abdominal: 38,
        subscapular: 27,
        axillaryMedian: 24,
        thigh: 40,
        thoracic: 20,
        suprailiac: 34,
        calf: 27,
        supraspinal: 30,
      },
      boneDiameters: undefined,
      skinfoldFormula: undefined,
      patient,
      patientId: patient.id,
      nutritionistId: patient.nutritionistId,
    } as DeepPartial<Measurement>);

    await this.measurementRepository.save(measurement5MonthsAgo);
    this.logger.log(
      `[Sample] Medição 5 meses atrás: weight=77.0, fatMass=27.1, fatFreeMass=${77.0 - 27.1}`,
    );

    // Create measurement 4 months ago (gained 1kg)
    const date4MonthsAgo = new Date();
    date4MonthsAgo.setMonth(date4MonthsAgo.getMonth() - 4);

    const measurement4MonthsAgo = this.measurementRepository.create({
      date: date4MonthsAgo,
      weight: 78.0,
      height: 165,
      sittingHeight: undefined,
      kneeHeight: undefined,
      bodyFat: 35.5,
      fatMass: 27.7,
      muscleMassPercentage: 26.7,
      muscleMass: 20.8,
      fatFreeMass: 78.0 - 27.7,
      boneMass: undefined,
      visceralFat: 9.1,
      bodyWater: undefined,
      metabolicAge: undefined,
      measurements: {
        neck: 36.3,
        shoulder: 107.5,
        chest: 97.5,
        waist: 86.5,
        abdomen: 92.5,
        hip: 108.5,
        relaxedArmLeft: 32.3,
        relaxedArmRight: 32.3,
        contractedArmLeft: 34.3,
        contractedArmRight: 34.3,
        forearmLeft: 27.1,
        forearmRight: 27.1,
        proximalThighLeft: 57.5,
        proximalThighRight: 57.5,
        medialThighLeft: 54.5,
        medialThighRight: 54.5,
        distalThighLeft: 50.5,
        distalThighRight: 50.5,
        calfLeft: 39.3,
        calfRight: 39.3,
      },
      skinfolds: {
        tricipital: 30.5,
        bicipital: 17.3,
        abdominal: 38.5,
        subscapular: 27.5,
        axillaryMedian: 24.5,
        thigh: 40.5,
        thoracic: 20.5,
        suprailiac: 34.5,
        calf: 27.5,
        supraspinal: 30.5,
      },
      boneDiameters: undefined,
      skinfoldFormula: undefined,
      patient,
      patientId: patient.id,
      nutritionistId: patient.nutritionistId,
    } as DeepPartial<Measurement>);

    await this.measurementRepository.save(measurement4MonthsAgo);
    this.logger.log(
      `[Sample] Medição 4 meses atrás: weight=78.0, fatMass=27.7, fatFreeMass=${78.0 - 27.7}`,
    );

    // Create initial measurement (3 months ago)
    const initialDate = new Date();
    initialDate.setMonth(initialDate.getMonth() - 3);

    const initialMeasurement = this.measurementRepository.create({
      date: initialDate,
      weight: 72.5,
      height: 165,
      sittingHeight: undefined,
      kneeHeight: undefined,
      bodyFat: 32.5,
      fatMass: 23.6,
      muscleMassPercentage: 28.4,
      muscleMass: 20.6,
      fatFreeMass: 72.5 - 23.6,
      boneMass: undefined,
      visceralFat: 8,
      bodyWater: undefined,
      metabolicAge: undefined,
      measurements: {
        neck: 35,
        shoulder: 105,
        chest: 95,
        waist: 82,
        abdomen: 88,
        hip: 105,
        relaxedArmLeft: 31,
        relaxedArmRight: 31,
        contractedArmLeft: 33,
        contractedArmRight: 33,
        forearmLeft: 26,
        forearmRight: 26,
        proximalThighLeft: 55,
        proximalThighRight: 55,
        medialThighLeft: 52,
        medialThighRight: 52,
        distalThighLeft: 48,
        distalThighRight: 48,
        calfLeft: 38,
        calfRight: 38,
      },
      skinfolds: {
        tricipital: 28,
        bicipital: 15,
        abdominal: 35,
        subscapular: 25,
        axillaryMedian: 22,
        thigh: 38,
        thoracic: 18,
        suprailiac: 32,
        calf: 25,
        supraspinal: 28,
      },
      boneDiameters: undefined,
      skinfoldFormula: undefined,
      patient,
      patientId: patient.id,
      nutritionistId: patient.nutritionistId,
    } as DeepPartial<Measurement>);

    await this.measurementRepository.save(initialMeasurement);
    this.logger.log(
      `[Sample] Medição 3 meses atrás: weight=72.5, fatMass=23.6, fatFreeMass=${72.5 - 23.6}`,
    );

    // After saving the initial measurement (3 months ago), upload its photos
    await this.uploadPhotosForMeasurement(initialMeasurement, false);

    // Create follow-up measurement (2 months ago)
    const followUpDate = new Date();
    followUpDate.setMonth(followUpDate.getMonth() - 2);

    const followUpMeasurement = this.measurementRepository.create({
      date: new Date(followUpDate),
      weight: 70.8,
      height: 165,
      sittingHeight: undefined,
      kneeHeight: undefined,
      bodyFat: 31.2,
      fatMass: 22.1,
      muscleMassPercentage: 29.1,
      muscleMass: 20.6,
      fatFreeMass: 70.8 - 22.1,
      boneMass: undefined,
      visceralFat: 7.5,
      bodyWater: undefined,
      metabolicAge: undefined,
      measurements: {
        neck: 34,
        shoulder: 104,
        chest: 94,
        waist: 80,
        abdomen: 86,
        hip: 103,
        relaxedArmLeft: 30.5,
        relaxedArmRight: 30.5,
        contractedArmLeft: 32.5,
        contractedArmRight: 32.5,
        forearmLeft: 25.5,
        forearmRight: 25.5,
        proximalThighLeft: 54,
        proximalThighRight: 54,
        medialThighLeft: 51,
        medialThighRight: 51,
        distalThighLeft: 47,
        distalThighRight: 47,
        calfLeft: 37,
        calfRight: 37,
      },
      skinfolds: {
        tricipital: 26,
        bicipital: 14,
        abdominal: 33,
        subscapular: 23,
        axillaryMedian: 20,
        thigh: 36,
        thoracic: 17,
        suprailiac: 30,
        calf: 24,
        supraspinal: 26,
      },
      boneDiameters: undefined,
      skinfoldFormula: undefined,
      patient,
      patientId: patient.id,
      nutritionistId: patient.nutritionistId,
    } as DeepPartial<Measurement>);

    await this.measurementRepository.save(followUpMeasurement);
    this.logger.log(
      `[Sample] Medição 2 meses atrás: weight=70.8, fatMass=22.1, fatFreeMass=${70.8 - 22.1}`,
    );

    // Create recent measurement (1 month ago)
    const recentDate = new Date();
    recentDate.setMonth(recentDate.getMonth() - 1);

    const recentMeasurement = this.measurementRepository.create({
      date: new Date(recentDate),
      weight: 68.5,
      height: 165,
      sittingHeight: undefined,
      kneeHeight: undefined,
      bodyFat: 29.8,
      fatMass: 20.4,
      muscleMassPercentage: 30.2,
      muscleMass: 20.7,
      fatFreeMass: 68.5 - 20.4,
      boneMass: undefined,
      visceralFat: 7,
      bodyWater: undefined,
      metabolicAge: undefined,
      measurements: {
        neck: 33.5,
        shoulder: 103,
        chest: 93,
        waist: 78,
        abdomen: 84,
        hip: 101,
        relaxedArmLeft: 30,
        relaxedArmRight: 30,
        contractedArmLeft: 32,
        contractedArmRight: 32,
        forearmLeft: 25,
        forearmRight: 25,
        proximalThighLeft: 53,
        proximalThighRight: 53,
        medialThighLeft: 50,
        medialThighRight: 50,
        distalThighLeft: 46,
        distalThighRight: 46,
        calfLeft: 36,
        calfRight: 36,
      },
      skinfolds: {
        tricipital: 24,
        bicipital: 13,
        abdominal: 31,
        subscapular: 21,
        axillaryMedian: 19,
        thigh: 34,
        thoracic: 16,
        suprailiac: 28,
        calf: 23,
        supraspinal: 24,
      },
      boneDiameters: undefined,
      skinfoldFormula: undefined,
      patient,
      patientId: patient.id,
      nutritionistId: patient.nutritionistId,
    } as DeepPartial<Measurement>);

    await this.measurementRepository.save(recentMeasurement);
    this.logger.log(
      `[Sample] Medição 1 mês atrás: weight=68.5, fatMass=20.4, fatFreeMass=${68.5 - 20.4}`,
    );

    // After saving the most recent measurement, upload its photos
    await this.uploadPhotosForMeasurement(recentMeasurement, true);
  }

  /**
   * Creates sample consultations for a patient
   * @param patient The patient to create consultations for
   */
  private async createConsultations(patient: Patient): Promise<void> {
    // Create initial consultation (3 months ago)
    const initialDate = new Date();
    initialDate.setMonth(initialDate.getMonth() - 3);

    const initialConsultation = this.consultationRepository.create({
      date: new Date(initialDate),
      patientId: patient.id,
      nutritionistId: patient.nutritionistId,
      notes:
        'Primeira consulta. Paciente relata dificuldade para perder peso e baixa energia. Solicitados exames de sangue e iniciado plano alimentar com foco em alimentos integrais e redução de açúcares.',
      status: ConsultationStatus.COMPLETED,
      type: ConsultationType.INITIAL,
    });

    await this.consultationRepository.save(initialConsultation);

    // Create follow-up consultation (2 months ago)
    const followUpDate = new Date();
    followUpDate.setMonth(followUpDate.getMonth() - 2);

    const followUpConsultation = this.consultationRepository.create({
      date: new Date(followUpDate),
      patientId: patient.id,
      nutritionistId: patient.nutritionistId,
      notes:
        'Paciente relata melhora na energia e perda de 1.7kg. Exames mostram TSH elevado, encaminhada para endocrinologista. Ajustado plano alimentar com foco em alimentos ricos em iodo e selênio.',
      status: ConsultationStatus.COMPLETED,
      type: ConsultationType.FOLLOW_UP,
    });

    await this.consultationRepository.save(followUpConsultation);

    // Create recent consultation (1 month ago)
    const recentDate = new Date();
    recentDate.setMonth(recentDate.getMonth() - 1);

    const recentConsultation = this.consultationRepository.create({
      date: new Date(recentDate),
      patientId: patient.id,
      nutritionistId: patient.nutritionistId,
      notes:
        'Paciente iniciou tratamento para hipotireoidismo. Perda de mais 2.3kg. Relata melhora significativa na disposição e qualidade do sono. Plano alimentar ajustado para incluir mais proteínas magras.',
      status: ConsultationStatus.COMPLETED,
      type: ConsultationType.FOLLOW_UP,
    });

    await this.consultationRepository.save(recentConsultation);

    // Create next consultation (scheduled for next month)
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 1);

    const nextConsultation = this.consultationRepository.create({
      date: new Date(nextDate),
      patientId: patient.id,
      nutritionistId: patient.nutritionistId,
      notes: 'Consulta de acompanhamento mensal.',
      status: ConsultationStatus.SCHEDULED,
      type: ConsultationType.FOLLOW_UP,
    });

    await this.consultationRepository.save(nextConsultation);

    // Update patient with last and next consultation dates
    await this.patientRepository.update(patient.id, {
      lastConsultationAt: new Date(recentDate),
      nextConsultationAt: new Date(nextDate),
    });
  }

  /**
   * Creates a sample meal plan for a patient
   * @param patient The patient to create a meal plan for
   */
  private async createMealPlan(patient: Patient): Promise<void> {
    // Create basic foods if they don't exist
    const foods = await this.ensureSampleFoodsExist();

    // Create meal plan
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    const mealPlan = this.mealPlanRepository.create({
      name: 'Plano Alimentar Inicial',
      description:
        'Plano alimentar com foco em perda de peso e controle do hipotireoidismo.',
      patientId: patient.id,
      nutritionistId: patient.nutritionistId,
      startDate,
      endDate,
    });

    const savedMealPlan = await this.mealPlanRepository.save(mealPlan);

    // Create breakfast
    const breakfast = this.mealRepository.create({
      name: 'Café da manhã',
      time: '08:00',
      description: 'Café da manhã completo',
      mealPlan: savedMealPlan,
    });

    const savedBreakfast = await this.mealRepository.save(breakfast);

    await this.addFoodToMeal(savedBreakfast, foods[0], 200, 'grama(s)');
    await this.addFoodToMeal(savedBreakfast, foods[1], 30, 'grama(s)');
    await this.addFoodToMeal(savedBreakfast, foods[2], 150, 'grama(s)');

    const lunch = this.mealRepository.create({
      name: 'Almoço',
      time: '12:00',
      description: 'Almoço balanceado',
      mealPlan: savedMealPlan,
    });

    const savedLunch = await this.mealRepository.save(lunch);

    await this.addFoodToMeal(savedLunch, foods[3], 120, 'grama(s)');
    await this.addFoodToMeal(savedLunch, foods[4], 150, 'grama(s)');
    await this.addFoodToMeal(
      savedLunch,
      foods[5],
      2,
      'Colher(es) de sopa cheia(s)',
    );

    const snack = this.mealRepository.create({
      name: 'Lanche da tarde',
      time: '16:00',
      description: 'Lanche leve',
      mealPlan: savedMealPlan,
    });

    const savedSnack = await this.mealRepository.save(snack);

    await this.addFoodToMeal(savedSnack, foods[6], 150, 'grama(s)');
    await this.addFoodToMeal(savedSnack, foods[7], 20, 'grama(s)');

    const dinner = this.mealRepository.create({
      name: 'Jantar',
      time: '19:00',
      description: 'Jantar leve',
      mealPlan: savedMealPlan,
    });

    const savedDinner = await this.mealRepository.save(dinner);

    await this.addFoodToMeal(savedDinner, foods[8], 100, 'grama(s)');
    await this.addFoodToMeal(savedDinner, foods[9], 50, 'grama(s)');
    await this.addFoodToMeal(
      savedDinner,
      foods[5],
      1,
      'Colher(es) de sopa cheia(s)',
    );

    // Update meal plan totals
    await this.updateMealPlanTotals(savedMealPlan.id);
  }

  /**
   * Ensures that sample foods exist in the database
   * @returns Array of foods
   */
  private async ensureSampleFoodsExist(): Promise<Food[]> {
    // Nomes dos alimentos que queremos buscar no JSON
    const sampleFoodNames = [
      'Iogurte Natural',
      'Granola',
      'Banana',
      'Peito de Frango',
      'Arroz Integral',
      'Azeite de Oliva',
      'Maçã',
      'Castanha do Pará',
      'Salmão Grelhado',
      'Brócolis Cozido',
    ];

    const foods: Food[] = [];

    for (const foodName of sampleFoodNames) {
      // Busca no JSON
      const jsonFood = this.findFoodInJson(foodName);
      if (!jsonFood) {
        this.logger.warn(
          `Alimento de exemplo não encontrado no JSON: ${foodName}`,
        );
        continue;
      }
      // Padroniza o source para minúsculo
      const normalizedSource = (jsonFood.origem || 'taco').toLowerCase();
      // Verifica se já existe no banco pelo sourceId e source do JSON
      let food = await this.foodRepository.findOne({
        where: { sourceId: String(jsonFood.id), source: normalizedSource },
      });
      if (!food) {
        food = this.foodRepository.create({
          name: jsonFood.nome,
          servingSize:
            jsonFood.porcao ||
            jsonFood.medida_caseira ||
            jsonFood.quantidade ||
            100,
          servingUnit:
            jsonFood.unidade || jsonFood.unidade_medida || 'grama(s)',
          calories: jsonFood.kcal || jsonFood.energia_kcal || 0,
          protein: jsonFood.ptn || jsonFood.proteina_g || 0,
          carbohydrates: jsonFood.cho || jsonFood.carboidrato_g || 0,
          fat: jsonFood.lip || jsonFood.lipideos_g || 0,
          fiber: jsonFood.fibras || jsonFood.fibra_g || 0,
          sugar: jsonFood.acucar_g || jsonFood.acucares || 0,
          sodium: jsonFood.na || jsonFood.sodio || jsonFood.sodio_mg || 0,
          categories: [jsonFood.categoria || jsonFood.grupo || 'Outro'],
          isVerified: true,
          source: normalizedSource,
          sourceId: String(jsonFood.id),
          additionalNutrients: {
            ...('vitamina_c_mg' in jsonFood
              ? { vitamina_c: jsonFood.vitamina_c_mg }
              : {}),
            ...('potassio_mg' in jsonFood
              ? { potassio: jsonFood.potassio_mg }
              : {}),
            ...('ca' in jsonFood ? { calcio: jsonFood.ca } : {}),
            ...('mg' in jsonFood ? { magnesio: jsonFood.mg } : {}),
            ...('p' in jsonFood ? { fosforo: jsonFood.p } : {}),
            ...('fe' in jsonFood ? { ferro: jsonFood.fe } : {}),
            ...('zn' in jsonFood ? { zinco: jsonFood.zn } : {}),
            ...('se' in jsonFood ? { selenio: jsonFood.se } : {}),
            ...('vitb12' in jsonFood ? { vitb12: jsonFood.vitb12 } : {}),
            ...('vitb9' in jsonFood ? { vitb9: jsonFood.vitb9 } : {}),
            ...('vite' in jsonFood ? { vite: jsonFood.vite } : {}),
            ...('vitd' in jsonFood ? { vitd: jsonFood.vitd } : {}),
            ...('gorduramono' in jsonFood
              ? { gorduramono: jsonFood.gorduramono }
              : {}),
            ...('gordurapoli' in jsonFood
              ? { gordurapoli: jsonFood.gordurapoli }
              : {}),
            ...('gordurasat' in jsonFood
              ? { gordurasat: jsonFood.gordurasat }
              : {}),
            ...('gorduratrans' in jsonFood
              ? { gorduratrans: jsonFood.gorduratrans }
              : {}),
            ...('colesterol' in jsonFood
              ? { colesterol: jsonFood.colesterol }
              : {}),
            ...('alcool' in jsonFood ? { alcool: jsonFood.alcool } : {}),
            // Adicione outros micronutrientes relevantes conforme o JSON
          },
          ...(jsonFood.mc ? { mc: jsonFood.mc } : {}),
        });
        food = await this.foodRepository.save(food);
      }
      foods.push(food);
    }
    return foods;
  }

  /**
   * Adds a food to a meal
   * @param meal The meal to add the food to
   * @param food The food to add
   * @param amount The amount of food
   * @param unit The unit of measurement
   */
  private async addFoodToMeal(
    meal: Meal,
    food: Food,
    amount: number,
    unit: string,
  ): Promise<void> {
    const mealFood = this.mealFoodRepository.create({
      amount: amount,
      unit: unit,
      foodId: food.sourceId,
      source: food.source,
      meal: { id: meal.id },
      substitutes: [], // Inicializa array vazio de substitutos
    });
    await this.mealFoodRepository.save(mealFood);
  }

  /**
   * Updates the nutritional totals for a meal plan
   * @param mealPlanId The ID of the meal plan to update
   */
  private async updateMealPlanTotals(mealPlanId: string): Promise<void> {
    const mealPlan = await this.mealPlanRepository.findOne({
      where: { id: mealPlanId },
      relations: ['meals', 'meals.mealFoods'],
    });

    if (!mealPlan) {
      return;
    }

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    for (const meal of mealPlan.meals) {
      let mealCalories = 0;
      let mealProtein = 0;
      let mealCarbs = 0;
      let mealFat = 0;

      // Buscar todos os alimentos da refeição
      for (const mealFood of meal.mealFoods) {
        // Buscar o alimento no banco pelo sourceId e source
        const food = await this.foodRepository.findOne({
          where: { sourceId: String(mealFood.foodId), source: mealFood.source },
        });
        if (!food) continue;

        // Calcular fator de proporção
        let factor = 1;
        if (food.servingUnit === mealFood.unit) {
          factor = Number(mealFood.amount) / Number(food.servingSize);
        } else {
          // Se unidade diferente, usar apenas a quantidade (pode ser ajustado conforme regras de conversão)
          factor = Number(mealFood.amount);
        }

        mealCalories += Number(food.calories) * factor;
        mealProtein += Number(food.protein) * factor;
        mealCarbs += Number(food.carbohydrates) * factor;
        mealFat += Number(food.fat) * factor;
      }

      // Atualizar totais da refeição
      await this.mealRepository.update(meal.id, {
        totalCalories: mealCalories,
        totalProtein: mealProtein,
        totalCarbs: mealCarbs,
        totalFat: mealFat,
      });

      totalCalories += mealCalories;
      totalProtein += mealProtein;
      totalCarbs += mealCarbs;
      totalFat += mealFat;
    }

    // Calcular médias diárias
    const days = Math.max(
      1,
      Math.ceil(
        ((mealPlan.endDate?.getTime() || Date.now()) - (mealPlan.startDate?.getTime() || Date.now())) /
          (1000 * 60 * 60 * 24),
      ),
    );

    // Atualizar totais do plano alimentar
    await this.mealPlanRepository.update(mealPlanId, {
      dailyCalories: totalCalories / days,
      dailyProtein: totalProtein / days,
      dailyCarbs: totalCarbs / days,
      dailyFat: totalFat / days,
    });
  }

  /**
   * Creates a sample energy plan for a patient
   * @param patient The patient to create an energy plan for
   */
  private async createEnergyPlan(patient: Patient): Promise<void> {
    const birthDate = new Date(patient.birthDate);
    const age = Math.floor(
      (new Date().getTime() - birthDate.getTime()) /
        (1000 * 60 * 60 * 24 * 365.25),
    );

    // Mapear o gênero do enum de pacientes para o enum de planos energéticos
    const genderMapping = {
      [PatientGender.MALE]: EnergyPlanGender.MALE,
      [PatientGender.FEMALE]: EnergyPlanGender.FEMALE,
      [PatientGender.OTHER]: EnergyPlanGender.OTHER,
    };

    // Criar plano energético usando a fórmula FAO/WHO 2004
    const energyPlan = await this.energyPlanService.calculateEnergyPlan({
      name: 'Plano Energético Inicial',
      patientId: patient.id,
      nutritionistId: patient.nutritionistId,
      weightAtCalculationKg: patient.weight,
      heightAtCalculationCm: patient.height,
      ageAtCalculationYears: age,
      genderAtCalculation: genderMapping[patient.gender],
      formulaKey: EnergyFormula.FAO_WHO_2004,
      activityFactorKey: ActivityFactor.MODERATE, // Moderadamente ativo (3-5 dias/semana)
      injuryFactorKey: InjuryFactor.NONE, // Sem lesão/estresse
      fatFreeMassAtCalculationKg: patient.weight * 0.7, // Estimativa de massa magra (70% do peso)
      weightGoalDetails: {
        target_weight_change_kg: -5, // Objetivo de perda de 5kg
        days_to_achieve: 90, // Em 90 dias
        calculated_kcal_adjustment: -500, // Déficit de 500kcal/dia
      },
      macronutrientDistribution: {
        proteins: 30, // 30% de proteínas
        carbs: 45, // 45% de carboidratos
        fats: 25, // 25% de gorduras
      },
      calculatedGetKcal: 0, // Será calculado pelo serviço
    });

    this.logger.log(
      `[Sample] Plano energético criado: TMB=${energyPlan.calculatedTmbKcal}, GET=${energyPlan.calculatedGetKcal}`,
    );
  }
}
