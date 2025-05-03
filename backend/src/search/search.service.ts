import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Patient } from '../patients/entities/patient.entity';
import { MealPlan } from '../modules/meal-plan/entities/meal-plan.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
    @InjectRepository(MealPlan)
    private mealPlansRepository: Repository<MealPlan>,
  ) {}

  async search(query: string) {
    if (!query || query.length < 3) {
      return [];
    }

    const searchTerm = `%${query}%`;

    // Busca pacientes
    const patients = await this.patientsRepository.find({
      where: [
        { name: ILike(searchTerm) },
        { email: ILike(searchTerm) },
        { phone: ILike(searchTerm) },
      ],
      take: 5,
    });

    // Busca planos alimentares
    const mealPlans = await this.mealPlansRepository.find({
      where: { name: ILike(searchTerm) },
      relations: ['patient'],
      take: 5,
    });

    // Formata os resultados
    const patientResults = patients.map((patient) => ({
      id: patient.id,
      type: 'patient' as const,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
    }));

    const mealPlanResults = mealPlans.map((plan) => ({
      id: plan.id,
      type: 'mealPlan' as const,
      title: plan.name,
      patientName: plan.patient?.name,
    }));

    // Combina e retorna os resultados
    return [...patientResults, ...mealPlanResults];
  }
}
