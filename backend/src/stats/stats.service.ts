import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../patients/entities/patient.entity';
import { MealPlan } from '../meal-plans/entities/meal-plan.entity';
import { Measurement } from '../patients/entities/measurement.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(MealPlan)
    private readonly mealPlanRepository: Repository<MealPlan>,
    @InjectRepository(Measurement)
    private readonly measurementRepository: Repository<Measurement>,
  ) {}

  async getStats() {
    const [totalPatients, totalMealPlans, totalMeasurements] =
      await Promise.all([
        this.patientRepository.count(),
        this.mealPlanRepository.count(),
        this.measurementRepository.count(),
      ]);

    return {
      totalPatients,
      totalMealPlans,
      totalMeasurements,
      totalDocuments: 0, // Placeholder para futura implementação
      lastWeekGrowth: {
        patients: 2.6,
        mealPlans: 0.2,
        measurements: -0.1,
        documents: 1.5,
      },
    };
  }
}
