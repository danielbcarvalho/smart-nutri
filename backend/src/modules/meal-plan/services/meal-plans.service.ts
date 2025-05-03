import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { MealPlan } from '../entities/meal-plan.entity';
import { Meal } from '../entities/meal.entity';
import { MealFood } from '../entities/meal-food.entity';
import { CreateMealPlanDto } from '../dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from '../dto/update-meal-plan.dto';
import { CreateMealDto } from '../dto/create-meal.dto';
import { PatientsService } from '../../patients/patients.service';

@Injectable()
export class MealPlansService {
  private readonly logger = new Logger(MealPlansService.name);

  constructor(
    @InjectRepository(MealPlan)
    private readonly mealPlanRepository: Repository<MealPlan>,
    @InjectRepository(Meal)
    private readonly mealRepository: Repository<Meal>,
    @InjectRepository(MealFood)
    private readonly mealFoodRepository: Repository<MealFood>,
    private readonly patientsService: PatientsService,
  ) {}

  async create(
    createMealPlanDto: CreateMealPlanDto,
    nutritionistId: string,
  ): Promise<MealPlan> {
    // Verifica se o paciente existe e pertence ao nutricionista
    await this.patientsService.findOne(
      createMealPlanDto.patientId,
      nutritionistId,
    );

    const mealPlan = this.mealPlanRepository.create({
      ...createMealPlanDto,
      nutritionistId,
    });

    const savedMealPlan = await this.mealPlanRepository.save(mealPlan);

    // Atualiza os totais nutricionais para todas as refeições
    if (createMealPlanDto.meals) {
      for (const meal of savedMealPlan.meals) {
        await this.updateMealNutritionTotals(meal.id);
      }
    }

    // Atualiza os totais do plano
    await this.updateMealPlanTotals(savedMealPlan.id);

    return this.findOne(savedMealPlan.id, nutritionistId);
  }

  async findAll(nutritionistId: string): Promise<MealPlan[]> {
    return this.mealPlanRepository.find({
      where: { nutritionistId },
      relations: ['meals', 'meals.mealFoods'],
      order: { startDate: 'DESC' },
    });
  }

  async findOne(id: string, nutritionistId: string): Promise<MealPlan> {
    const mealPlan = await this.mealPlanRepository.findOne({
      where: { id, nutritionistId },
      relations: ['meals', 'meals.mealFoods'],
    });
    if (!mealPlan) {
      throw new NotFoundException(`Meal plan with ID ${id} not found`);
    }
    return mealPlan;
  }

  async findByPatient(
    patientId: string,
    nutritionistId: string,
  ): Promise<MealPlan[]> {
    try {
      // Verificar se o paciente existe e pertence ao nutricionista
      try {
        await this.patientsService.findOne(patientId, nutritionistId);
      } catch (error) {
        if (error instanceof NotFoundException) {
          return [];
        }
        throw error;
      }

      // Usar SQL bruto para evitar problemas com nomes de colunas
      const query =
        this.mealPlanRepository.manager.connection.createQueryRunner();
      await query.connect();

      try {
        const result = await query.query(
          `SELECT * FROM meal_plans WHERE patient_id = $1 AND nutritionist_id = $2`,
          [patientId, nutritionistId],
        );

        // Converter os resultados para entidades
        return result.map((row) => {
          const mealPlan = new MealPlan();
          Object.assign(mealPlan, {
            id: row.id,
            name: row.name,
            description: row.notes,
            patientId: row.patient_id,
            nutritionistId: row.nutritionist_id,
            startDate: row.startDate,
            endDate: row.endDate,
            dailyCalories: row.daily_calories,
            dailyProtein: row.daily_protein,
            dailyCarbs: row.daily_carbs,
            dailyFat: row.daily_fat,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
          });
          return mealPlan;
        });
      } finally {
        await query.release();
      }
    } catch (error) {
      this.logger.error(
        `Error fetching meal plans for patient ${patientId}:`,
        error.stack,
      );
      // Retornar array vazio em vez de propagar o erro
      return [];
    }
  }

  async update(
    id: string,
    mealPlanDto: UpdateMealPlanDto,
    nutritionistId: string,
  ): Promise<MealPlan> {
    const mealPlan = await this.findOne(id, nutritionistId);

    // Delete existing meals and their foods
    const meals = await this.mealRepository.find({
      where: { mealPlan: { id, nutritionistId } },
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

    // Atualiza os totais do plano
    await this.updateMealPlanTotals(id);

    return this.findOne(id, nutritionistId);
  }

  async remove(id: string, nutritionistId: string): Promise<void> {
    const mealPlan = await this.findOne(id, nutritionistId);
    await this.mealPlanRepository.remove(mealPlan);

    // Não precisamos chamar updateMealPlanTotals pois o plano está sendo removido
  }

  async addMeal(
    planId: string,
    createMealDto: CreateMealDto,
    nutritionistId: string,
  ): Promise<Meal> {
    const mealPlan = await this.findOne(planId, nutritionistId);

    const meal = this.mealRepository.create({
      ...createMealDto,
      mealPlan,
    });

    try {
      const savedMeal = await this.mealRepository.save(meal);

      // Atualiza os totais do plano
      await this.updateMealPlanTotals(planId);

      return savedMeal;
    } catch (error) {
      throw error;
    }
  }

  async getMeals(id: string, nutritionistId: string): Promise<Meal[]> {
    const mealPlan = await this.findOne(id, nutritionistId);
    return mealPlan.meals;
  }

  async search(query: string, nutritionistId: string): Promise<MealPlan[]> {
    return this.mealPlanRepository.find({
      where: [{ name: ILike(`%${query}%`), nutritionistId }],
      relations: ['patient'],
      take: 5, // Limita a 5 resultados
    });
  }

  private async updateMealPlanTotals(mealPlanId: string): Promise<void> {
    try {
      const mealPlan = await this.mealPlanRepository.findOne({
        where: { id: mealPlanId },
        relations: ['meals'],
      });

      if (!mealPlan) {
        this.logger.warn(
          `Meal plan ${mealPlanId} not found when updating totals`,
        );
        return;
      }

      // Calcula os totais do plano
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;

      for (const meal of mealPlan.meals) {
        totalCalories += meal.totalCalories;
        totalProtein += meal.totalProtein;
        totalCarbs += meal.totalCarbs;
        totalFat += meal.totalFat;
      }

      // Calcula médias diárias
      const days = Math.max(
        1,
        Math.ceil(
          (mealPlan.endDate.getTime() - mealPlan.startDate.getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      );

      // Atualiza o plano
      await this.mealPlanRepository.update(mealPlanId, {
        dailyCalories: totalCalories / days,
        dailyProtein: totalProtein / days,
        dailyCarbs: totalCarbs / days,
        dailyFat: totalFat / days,
      });

      this.logger.log(`Updated totals for meal plan ${mealPlanId}`);
    } catch (error) {
      this.logger.error(
        `Failed to update totals for meal plan ${mealPlanId}`,
        error.stack,
      );
      throw error;
    }
  }

  private async updateMealNutritionTotals(mealId: string): Promise<void> {
    try {
      const meal = await this.mealRepository.findOne({
        where: { id: mealId },
        relations: ['mealFoods', 'mealFoods.food'],
      });

      if (!meal) {
        this.logger.warn(
          `Meal ${mealId} not found when updating nutrition totals`,
        );
        return;
      }

      // Calcula os totais
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;

      for (const mealFood of meal.mealFoods) {
        const food = mealFood.food;
        const amount = mealFood.amount;
        const servingSize = food.servingSize || 1; // Evita divisão por zero

        totalCalories += (food.calories * amount) / servingSize;
        totalProtein += (food.protein * amount) / servingSize;
        totalCarbs += (food.carbohydrates * amount) / servingSize;
        totalFat += (food.fat * amount) / servingSize;
      }

      // Atualiza a refeição
      await this.mealRepository.update(mealId, {
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
      });

      this.logger.log(`Updated nutrition totals for meal ${mealId}`);
    } catch (error) {
      this.logger.error(
        `Failed to update nutrition totals for meal ${mealId}`,
        error.stack,
      );
      throw error;
    }
  }
}
