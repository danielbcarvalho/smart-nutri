import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Patient } from '../../patients/entities/patient.entity';
import { Measurement } from '../../patients/entities/measurement.entity';
import { MealPlan } from '../../meal-plan/entities/meal-plan.entity';
import { EnergyPlan } from '../../energy-plan/entities/energy-plan.entity';
import { Photo } from '../../photos/entities/photo.entity';

import { AiPatientDataDto } from '../dto/ai-patient-data.dto';

@Injectable()
export class PatientDataAggregationService {
  private readonly logger = new Logger(PatientDataAggregationService.name);

  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Measurement)
    private readonly measurementRepository: Repository<Measurement>,
    @InjectRepository(MealPlan)
    private readonly mealPlanRepository: Repository<MealPlan>,
    @InjectRepository(EnergyPlan)
    private readonly energyPlanRepository: Repository<EnergyPlan>,
    @InjectRepository(Photo)
    private readonly photoRepository: Repository<Photo>,
  ) {}

  async aggregatePatientData(patientId: string): Promise<AiPatientDataDto> {
    this.logger.log(`Aggregating data for patient: ${patientId}`);

    // Get patient basic information
    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${patientId} not found`);
    }

    // Get latest measurement
    let latestMeasurement: Measurement | null = null;
    try {
      const measurements = await this.measurementRepository.find({
        where: { patientId },
        order: { date: 'DESC' },
        take: 1,
      });
      latestMeasurement = measurements[0] || null;
    } catch (error) {
      this.logger.warn(`Failed to fetch measurements for patient ${patientId}:`, error.message);
    }

    // Get current energy plan
    let energyPlan: EnergyPlan | null = null;
    try {
      const energyPlans = await this.energyPlanRepository.find({
        where: { patientId },
        order: { createdAt: 'DESC' },
        take: 1,
      });
      energyPlan = energyPlans[0] || null;
    } catch (error) {
      this.logger.warn(`Failed to fetch energy plan for patient ${patientId}:`, error.message);
    }

    // Get previous meal plans (last 5)
    let previousMealPlans: MealPlan[] = [];
    try {
      previousMealPlans = await this.mealPlanRepository.find({
        where: { patientId },
        order: { createdAt: 'DESC' },
        take: 5,
        select: ['id', 'name', 'description', 'startDate', 'endDate', 'createdAt'],
      });
    } catch (error) {
      this.logger.warn(`Failed to fetch meal plans for patient ${patientId}:`, error.message);
    }

    // Get recent progress photos (last 20)
    let progressPhotos: Photo[] = [];
    try {
      progressPhotos = await this.photoRepository.find({
        where: { patientId },
        order: { createdAt: 'DESC' },
        take: 20,
        select: ['id', 'type', 'url', 'createdAt'],
      });
    } catch (error) {
      this.logger.warn(`Failed to fetch photos for patient ${patientId}:`, error.message);
    }

    // Format and return aggregated data
    const result: AiPatientDataDto = {
      patient: {
        id: patient.id,
        name: patient.name,
        email: patient.email,
        birthDate: patient.birthDate || '',
        gender: patient.gender,
        phone: patient.phone,
      },
      latestMeasurement: latestMeasurement ? {
        id: latestMeasurement.id,
        weight: latestMeasurement.weight,
        height: latestMeasurement.height,
        bodyFat: latestMeasurement.bodyFat,
        muscleMass: latestMeasurement.muscleMass,
        measureDate: latestMeasurement.date instanceof Date 
          ? latestMeasurement.date.toISOString().split('T')[0]
          : String(latestMeasurement.date).split('T')[0],
        measurements: latestMeasurement.measurements,
      } : undefined,
      energyPlan: energyPlan ? {
        id: energyPlan.id,
        bmr: energyPlan.calculatedTmbKcal || 0,
        tee: energyPlan.calculatedGetKcal || 0,
        objective: energyPlan.weightGoalDetails?.goalWeightChangeKg ? 'weight_change' : 'maintenance',
        formula: energyPlan.formulaKey || 'unknown',
        activityFactor: 1.4, // Default value since it's not directly stored
        createdAt: energyPlan.createdAt instanceof Date 
          ? energyPlan.createdAt.toISOString()
          : String(energyPlan.createdAt),
      } : undefined,
      previousMealPlans: previousMealPlans.map(plan => ({
        id: plan.id,
        title: plan.name,
        description: plan.description,
        startDate: plan.startDate instanceof Date ? plan.startDate.toISOString().split('T')[0] : (plan.startDate ? String(plan.startDate).split('T')[0] : ''),
        endDate: plan.endDate instanceof Date ? plan.endDate.toISOString().split('T')[0] : (plan.endDate ? String(plan.endDate).split('T')[0] : ''),
        createdAt: plan.createdAt instanceof Date ? plan.createdAt.toISOString() : String(plan.createdAt),
      })),
      progressPhotos: progressPhotos.map(photo => ({
        id: photo.id,
        type: photo.type,
        url: photo.url,
        createdAt: photo.createdAt instanceof Date ? photo.createdAt.toISOString() : String(photo.createdAt),
      })),
    };

    this.logger.log(`Successfully aggregated data for patient ${patientId}`);
    this.logger.debug(`Data summary: ${JSON.stringify({
      hasLatestMeasurement: !!result.latestMeasurement,
      hasEnergyPlan: !!result.energyPlan,
      mealPlansCount: result.previousMealPlans?.length || 0,
      photosCount: result.progressPhotos?.length || 0,
    })}`);

    return result;
  }

  async validatePatientDataCompleteness(patientData: AiPatientDataDto): Promise<{
    isComplete: boolean;
    missingData: string[];
    warnings: string[];
  }> {
    const missingData: string[] = [];
    const warnings: string[] = [];

    // Essential data checks
    if (!patientData.latestMeasurement) {
      missingData.push('Dados antropométricos recentes');
    } else {
      if (!patientData.latestMeasurement.weight) {
        missingData.push('Peso atual');
      }
      if (!patientData.latestMeasurement.height) {
        missingData.push('Altura');
      }
    }

    if (!patientData.energyPlan) {
      warnings.push('Plano energético não encontrado - TMB será estimada');
    }

    // Calculate age for validation
    const birthDate = new Date(patientData.patient.birthDate);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    
    if (age < 18 || age > 80) {
      warnings.push('Idade fora da faixa padrão (18-80 anos) - pode afetar recomendações');
    }

    // Optional data warnings
    if (!patientData.previousMealPlans || patientData.previousMealPlans.length === 0) {
      warnings.push('Sem histórico de planos alimentares anteriores');
    }

    if (!patientData.progressPhotos || patientData.progressPhotos.length === 0) {
      warnings.push('Sem fotos de progresso disponíveis');
    }

    return {
      isComplete: missingData.length === 0,
      missingData,
      warnings,
    };
  }
}