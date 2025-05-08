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
import { Gender } from '../enums/gender.enum';
import { Food } from '../../foods/entities/food.entity';

@Injectable()
export class SamplePatientService {
  private readonly logger = new Logger(SamplePatientService.name);

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
  ) {}

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
      gender: Gender.FEMALE,
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
      fatFreeMass: undefined,
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
      fatFreeMass: undefined,
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
      fatFreeMass: undefined,
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
      fatFreeMass: undefined,
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
      fatFreeMass: undefined,
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
      fatFreeMass: undefined,
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
      fatFreeMass: undefined,
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
      fatFreeMass: undefined,
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
      fatFreeMass: undefined,
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

    await this.addFoodToMeal(savedBreakfast, foods[0], 200, 'g');
    await this.addFoodToMeal(savedBreakfast, foods[1], 30, 'g');
    await this.addFoodToMeal(savedBreakfast, foods[2], 1, 'unidade');

    const lunch = this.mealRepository.create({
      name: 'Almoço',
      time: '12:00',
      description: 'Almoço balanceado',
      mealPlan: savedMealPlan,
    });

    const savedLunch = await this.mealRepository.save(lunch);

    await this.addFoodToMeal(savedLunch, foods[3], 120, 'g');
    await this.addFoodToMeal(savedLunch, foods[4], 150, 'g');
    await this.addFoodToMeal(savedLunch, foods[5], 2, 'colher');

    const snack = this.mealRepository.create({
      name: 'Lanche da tarde',
      time: '16:00',
      description: 'Lanche leve',
      mealPlan: savedMealPlan,
    });

    const savedSnack = await this.mealRepository.save(snack);

    await this.addFoodToMeal(savedSnack, foods[6], 1, 'unidade');
    await this.addFoodToMeal(savedSnack, foods[7], 20, 'g');

    const dinner = this.mealRepository.create({
      name: 'Jantar',
      time: '19:00',
      description: 'Jantar leve',
      mealPlan: savedMealPlan,
    });

    const savedDinner = await this.mealRepository.save(dinner);

    await this.addFoodToMeal(savedDinner, foods[8], 100, 'g');
    await this.addFoodToMeal(savedDinner, foods[9], 50, 'g');
    await this.addFoodToMeal(savedDinner, foods[5], 1, 'colher');

    // Update meal plan totals
    await this.updateMealPlanTotals(savedMealPlan.id);
  }

  /**
   * Ensures that sample foods exist in the database
   * @returns Array of foods
   */
  private async ensureSampleFoodsExist(): Promise<Food[]> {
    const sampleFoods = [
      {
        name: 'Iogurte Natural Desnatado',
        servingSize: 100,
        servingUnit: 'g',
        calories: 50,
        protein: 5.3,
        carbohydrates: 7.2,
        fat: 0.4,
        categories: ['Laticínios'],
        isVerified: true,
        source: 'TACO',
      },
      {
        name: 'Granola Tradicional',
        servingSize: 30,
        servingUnit: 'g',
        calories: 120,
        protein: 3.5,
        carbohydrates: 20.5,
        fat: 4.2,
        categories: ['Cereais'],
        isVerified: true,
        source: 'TACO',
      },
      {
        name: 'Banana',
        servingSize: 100,
        servingUnit: 'g',
        calories: 89,
        protein: 1.1,
        carbohydrates: 22.8,
        fat: 0.3,
        categories: ['Frutas'],
        isVerified: true,
        source: 'TACO',
      },
      {
        name: 'Peito de Frango Grelhado',
        servingSize: 100,
        servingUnit: 'g',
        calories: 165,
        protein: 31,
        carbohydrates: 0,
        fat: 3.6,
        categories: ['Carnes', 'Aves'],
        isVerified: true,
        source: 'TACO',
      },
      {
        name: 'Arroz Integral Cozido',
        servingSize: 100,
        servingUnit: 'g',
        calories: 124,
        protein: 2.6,
        carbohydrates: 25.8,
        fat: 1,
        categories: ['Cereais'],
        isVerified: true,
        source: 'TACO',
      },
      {
        name: 'Azeite de Oliva Extra Virgem',
        servingSize: 10,
        servingUnit: 'ml',
        calories: 90,
        protein: 0,
        carbohydrates: 0,
        fat: 10,
        categories: ['Óleos e Gorduras'],
        isVerified: true,
        source: 'TACO',
      },
      {
        name: 'Maçã',
        servingSize: 100,
        servingUnit: 'g',
        calories: 52,
        protein: 0.3,
        carbohydrates: 13.8,
        fat: 0.2,
        categories: ['Frutas'],
        isVerified: true,
        source: 'TACO',
      },
      {
        name: 'Castanha do Pará',
        servingSize: 20,
        servingUnit: 'g',
        calories: 132,
        protein: 2.8,
        carbohydrates: 2.6,
        fat: 13.2,
        categories: ['Oleaginosas'],
        isVerified: true,
        source: 'TACO',
      },
      {
        name: 'Salmão Grelhado',
        servingSize: 100,
        servingUnit: 'g',
        calories: 208,
        protein: 22.1,
        carbohydrates: 0,
        fat: 13.4,
        categories: ['Peixes'],
        isVerified: true,
        source: 'TACO',
      },
      {
        name: 'Brócolis Cozido',
        servingSize: 100,
        servingUnit: 'g',
        calories: 35,
        protein: 3.6,
        carbohydrates: 4.3,
        fat: 0.3,
        categories: ['Vegetais'],
        isVerified: true,
        source: 'TACO',
      },
    ];

    const foods: Food[] = [];

    for (const foodData of sampleFoods) {
      // Check if food already exists
      let food = await this.foodRepository.findOne({
        where: { name: foodData.name },
      });

      if (!food) {
        // Create food if it doesn't exist
        food = this.foodRepository.create(foodData);
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
      foodId: food.id,
      source: food.source,
      meal: { id: meal.id },
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

      // Se necessário, buscar dados do alimento manualmente aqui usando mealFood.foodId/source
      // Exemplo: buscar na tabela de alimentos pelo foodId/source
      // Por ora, ignorar cálculo se não for possível

      // Update meal totals
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

    // Calculate daily averages
    const days = Math.max(
      1,
      Math.ceil(
        (mealPlan.endDate.getTime() - mealPlan.startDate.getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    );

    // Update meal plan totals
    await this.mealPlanRepository.update(mealPlanId, {
      dailyCalories: totalCalories / days,
      dailyProtein: totalProtein / days,
      dailyCarbs: totalCarbs / days,
      dailyFat: totalFat / days,
    });
  }
}
