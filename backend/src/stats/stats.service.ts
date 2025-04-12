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

  async getStats(nutritionistId: string) {
    try {
      // Buscar totais usando QueryBuilder
      const totalPatients = await this.patientRepository
        .createQueryBuilder('patient')
        .where('patient.nutritionist_id = :nutritionistId', { nutritionistId })
        .getCount();

      const totalMealPlans = await this.mealPlanRepository
        .createQueryBuilder('mealPlan')
        .where('mealPlan.nutritionist_id = :nutritionistId', { nutritionistId })
        .getCount();

      const totalMeasurements = await this.measurementRepository
        .createQueryBuilder('measurement')
        .where('measurement.nutritionist_id = :nutritionistId', {
          nutritionistId,
        })
        .getCount();

      // Calcular crescimento da última semana
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // Usar a SQL diretamente para MealPlans devido às diferenças nos nomes das colunas
      const newPatients = await this.patientRepository
        .createQueryBuilder('patient')
        .where('patient.nutritionist_id = :nutritionistId', { nutritionistId })
        .andWhere('patient.created_at >= :oneWeekAgo', { oneWeekAgo })
        .getCount();

      // Para MealPlans, usamos a coluna sem alias devido à diferença de convenção
      const newMealPlans = await this.mealPlanRepository
        .createQueryBuilder()
        .where('nutritionist_id = :nutritionistId', { nutritionistId })
        .andWhere('"createdAt" >= :oneWeekAgo', { oneWeekAgo })
        .getCount();

      const newMeasurements = await this.measurementRepository
        .createQueryBuilder('measurement')
        .where('measurement.nutritionist_id = :nutritionistId', {
          nutritionistId,
        })
        .andWhere('measurement.created_at >= :oneWeekAgo', { oneWeekAgo })
        .getCount();

      // Calcular percentual de crescimento
      const calculateGrowth = (total: number, newItems: number) => {
        if (total === 0) return 0;
        return Number(((newItems / total) * 100).toFixed(1));
      };

      return {
        totalPatients,
        totalMealPlans,
        totalMeasurements,
        totalDocuments: 0, // Placeholder para futura implementação
        lastWeekGrowth: {
          patients: calculateGrowth(totalPatients, newPatients),
          mealPlans: calculateGrowth(totalMealPlans, newMealPlans),
          measurements: calculateGrowth(totalMeasurements, newMeasurements),
          documents: 0,
        },
      };
    } catch (error) {
      console.error('Error in stats service:', error);
      // Retornar dados vazios em caso de erro
      return {
        totalPatients: 0,
        totalMealPlans: 0,
        totalMeasurements: 0,
        totalDocuments: 0,
        lastWeekGrowth: {
          patients: 0,
          mealPlans: 0,
          measurements: 0,
          documents: 0,
        },
      };
    }
  }
}
