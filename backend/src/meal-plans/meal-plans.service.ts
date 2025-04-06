import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { MealPlan } from './entities/meal-plan.entity';
import { Meal } from './entities/meal.entity';
import { MealFood } from './entities/meal-food.entity';
import { Patient } from '../patients/entities/patient.entity';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';
import { CreateMealDto } from './dto/create-meal.dto';
import { PatientsService } from '../patients/patients.service';

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
    private readonly patientsService: PatientsService,
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
    try {
      await this.patientsService.findOne(patientId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return [];
      }
      throw error;
    }

    return this.mealPlanRepository.find({
      where: { patient: { id: patientId } },
      relations: [
        'patient',
        'meals',
        'meals.mealFoods',
        'meals.mealFoods.food',
      ],
    });
  }

  async update(id: string, mealPlanDto: UpdateMealPlanDto): Promise<MealPlan> {
    const mealPlan = await this.findOne(id);

    // Delete existing meals and their foods
    const meals = await this.mealRepository.find({
      where: { mealPlan: { id } },
      relations: ['mealFoods'],
    });

    for (const meal of meals) {
      await this.mealFoodRepository.delete({ meal: { id: meal.id } });
    }
    await this.mealRepository.delete({ mealPlan: { id } });

    // Update meal plan basic info
    Object.assign(mealPlan, mealPlanDto);

    // Create new meals
    if (mealPlanDto.meals) {
      mealPlan.meals = [];
      for (const mealDto of mealPlanDto.meals) {
        // Ensure time format is HH:mm
        const formattedTime = mealDto.time.split(':').slice(0, 2).join(':');

        const meal = this.mealRepository.create({
          ...mealDto,
          time: formattedTime,
          mealPlan,
        });
        const savedMeal = await this.mealRepository.save(meal);

        // Create meal foods
        if (mealDto.mealFoods) {
          savedMeal.mealFoods = [];
          for (const mealFoodDto of mealDto.mealFoods) {
            const mealFood = this.mealFoodRepository.create({
              ...mealFoodDto,
              meal: savedMeal,
            });
            await this.mealFoodRepository.save(mealFood);
            savedMeal.mealFoods.push(mealFood);
          }
        }
        mealPlan.meals.push(savedMeal);
      }
    }

    await this.mealPlanRepository.save(mealPlan);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const mealPlan = await this.findOne(id);

    // Remove o plano alimentar e todas as suas relações em cascata
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

  async getMeals(id: string): Promise<Meal[]> {
    const mealPlan = await this.findOne(id);
    return mealPlan.meals;
  }

  async search(query: string): Promise<MealPlan[]> {
    return this.mealPlanRepository.find({
      where: [{ name: ILike(`%${query}%`) }],
      relations: ['patient'],
      take: 5, // Limita a 5 resultados
    });
  }
}
