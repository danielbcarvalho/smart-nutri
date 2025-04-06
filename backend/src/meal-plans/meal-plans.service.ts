import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MealPlan } from './entities/meal-plan.entity';
import { Meal } from './entities/meal.entity';
import { MealFood } from './entities/meal-food.entity';
import { Patient } from '../patients/entities/patient.entity';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';
import { CreateMealDto } from './dto/create-meal.dto';

@Injectable()
export class MealPlansService {
  constructor(
    @InjectRepository(MealPlan)
    private readonly mealPlanRepository: Repository<MealPlan>,
    @InjectRepository(Meal)
    private readonly mealRepository: Repository<Meal>,
    @InjectRepository(MealFood)
    private readonly mealFoodRepository: Repository<MealFood>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async create(createMealPlanDto: CreateMealPlanDto): Promise<MealPlan> {
    const { patientId, ...mealPlanData } = createMealPlanDto;

    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException(
        `Paciente com ID ${patientId} não encontrado`,
      );
    }

    const mealPlan = this.mealPlanRepository.create({
      ...mealPlanData,
      patient,
      patientId,
    });

    return this.mealPlanRepository.save(mealPlan);
  }

  async findAll(): Promise<MealPlan[]> {
    return this.mealPlanRepository.find({
      relations: [
        'patient',
        'meals',
        'meals.mealFoods',
        'meals.mealFoods.food',
      ],
    });
  }

  async findOne(id: string): Promise<MealPlan> {
    const mealPlan = await this.mealPlanRepository.findOne({
      where: { id },
      relations: [
        'patient',
        'meals',
        'meals.mealFoods',
        'meals.mealFoods.food',
      ],
    });

    if (!mealPlan) {
      throw new NotFoundException(
        `Plano alimentar com ID ${id} não encontrado`,
      );
    }

    return mealPlan;
  }

  async findByPatient(patientId: string): Promise<MealPlan[]> {
    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException(
        `Paciente com ID ${patientId} não encontrado`,
      );
    }

    return this.mealPlanRepository.find({
      where: { patientId },
      relations: [
        'patient',
        'meals',
        'meals.mealFoods',
        'meals.mealFoods.food',
      ],
    });
  }

  async update(
    id: string,
    updateMealPlanDto: UpdateMealPlanDto,
  ): Promise<MealPlan> {
    const mealPlan = await this.findOne(id);
    this.mealPlanRepository.merge(mealPlan, updateMealPlanDto);
    return this.mealPlanRepository.save(mealPlan);
  }

  async remove(id: string): Promise<void> {
    const mealPlan = await this.findOne(id);
    await this.mealPlanRepository.remove(mealPlan);
  }

  async addMeal(planId: string, createMealDto: CreateMealDto): Promise<Meal> {
    console.log('Service: Adding meal to plan', { planId, createMealDto });
    const mealPlan = await this.findOne(planId);
    console.log('Service: Found meal plan:', mealPlan);

    const meal = this.mealRepository.create({
      ...createMealDto,
      mealPlan,
    });
    console.log('Service: Created meal entity:', meal);

    try {
      const savedMeal = await this.mealRepository.save(meal);
      console.log('Service: Saved meal successfully:', savedMeal);
      return savedMeal;
    } catch (error) {
      console.error('Service: Error saving meal:', error);
      throw error;
    }
  }
}
