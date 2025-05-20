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
      relations: [
        'meals',
        'meals.mealFoods',
        'patient',
        'nutritionist',
        'energyPlan',
      ],
      order: { startDate: 'DESC' },
    });
  }

  async findOne(id: string, nutritionistId: string): Promise<MealPlan> {
    this.logger.log('🔍 [MealPlansService] Buscando plano:', {
      id,
      nutritionistId,
    });

    const mealPlan = await this.mealPlanRepository.findOne({
      where: { id, nutritionistId },
      relations: [
        'meals',
        'meals.mealFoods',
        'patient',
        'nutritionist',
        'energyPlan',
      ],
    });

    if (!mealPlan) {
      this.logger.log('❌ [MealPlansService] Plano não encontrado:', {
        id,
        nutritionistId,
      });
      throw new NotFoundException(`Meal plan with ID ${id} not found`);
    }

    return mealPlan;
  }

  async findByPatient(
    patientId: string,
    nutritionistId: string,
  ): Promise<MealPlan[]> {
    // Verificar se o paciente existe e pertence ao nutricionista
    try {
      await this.patientsService.findOne(patientId, nutritionistId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return [];
      }
      throw error;
    }

    // Buscar planos com todas as relações e campos
    return this.mealPlanRepository.find({
      where: { patientId, nutritionistId },
      relations: ['meals', 'meals.mealFoods'],
      order: { startDate: 'DESC' },
    });
  }

  async update(
    id: string,
    mealPlanDto: UpdateMealPlanDto,
    nutritionistId: string,
  ): Promise<MealPlan> {
    // Primeiro, busca o plano sem as relações
    const mealPlan = await this.mealPlanRepository.findOne({
      where: { id, nutritionistId },
    });

    if (!mealPlan) {
      throw new NotFoundException(`Meal plan with ID ${id} not found`);
    }

    // Verifica se estamos atualizando os totais manualmente
    const isUpdatingTotals =
      mealPlanDto.dailyCalories !== undefined ||
      mealPlanDto.dailyProtein !== undefined ||
      mealPlanDto.dailyCarbs !== undefined ||
      mealPlanDto.dailyFat !== undefined;

    // Atualiza todos os campos enviados
    Object.assign(mealPlan, mealPlanDto);

    // Salva o plano atualizado
    const updatedMealPlan = await this.mealPlanRepository.save(mealPlan);

    // Se não estamos atualizando os totais manualmente, recalcula
    if (!isUpdatingTotals) {
      await this.updateMealPlanTotals(id);
    }

    // Força uma nova busca com as relações após a atualização
    const finalMealPlan = await this.mealPlanRepository.findOne({
      where: { id: updatedMealPlan.id },
      relations: [
        'meals',
        'meals.mealFoods',
        'patient',
        'nutritionist',
        'energyPlan',
      ],
    });

    if (!finalMealPlan) {
      throw new NotFoundException(
        `Meal plan with ID ${id} not found after update`,
      );
    }

    return finalMealPlan;
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
    } catch (error) {
      throw error;
    }
  }

  private async updateMealNutritionTotals(mealId: string): Promise<void> {
    try {
      const meal = await this.mealRepository.findOne({
        where: { id: mealId },
        relations: ['mealFoods'],
      });

      if (!meal) {
        return;
      }

      // Calcula os totais
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;

      // Se necessário, buscar dados do alimento manualmente aqui usando mealFood.foodId/source
      // Exemplo: buscar na tabela de alimentos pelo foodId/source
      // Por ora, ignorar cálculo se não for possível

      // Atualiza a refeição
      await this.mealRepository.update(mealId, {
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
      });
    } catch (error) {
      throw error;
    }
  }

  async updateMeal(
    planId: string,
    mealId: string,
    updateMealDto: any,
    nutritionistId: string,
  ): Promise<Meal> {
    // Verifica se o plano e a refeição existem e pertencem ao nutricionista
    const mealPlan = await this.mealPlanRepository.findOne({
      where: { id: planId, nutritionistId },
    });
    if (!mealPlan) {
      throw new NotFoundException(`Plano alimentar não encontrado`);
    }

    // Fetch meal with its current mealFoods
    const meal = await this.mealRepository.findOne({
      where: { id: mealId, mealPlan: { id: planId } },
      relations: ['mealFoods'], // Crucial to load existing foods
    });

    if (!meal) {
      throw new NotFoundException(`Refeição não encontrada`);
    }

    // Atualiza campos básicos
    let mealUpdated = false;
    if (updateMealDto.name && meal.name !== updateMealDto.name) {
      meal.name = updateMealDto.name;
      mealUpdated = true;
    }
    if (updateMealDto.time && meal.time !== updateMealDto.time) {
      meal.time = updateMealDto.time;
      mealUpdated = true;
    }
    if (
      updateMealDto.description !== undefined &&
      meal.description !== updateMealDto.description
    ) {
      meal.description = updateMealDto.description;
      mealUpdated = true;
    }

    // Atualiza alimentos
    if (Array.isArray(updateMealDto.mealFoods)) {
      const existingMealFoods = meal.mealFoods || [];
      const incomingFoodDtos = updateMealDto.mealFoods;

      const foodsToAdd: any[] = [];
      const foodsToUpdate: MealFood[] = [];
      // Clone the array of existing IDs to modify it safely
      const foodIdsToRemove: string[] = existingMealFoods.map((mf) => mf.id);

      // Compare incoming DTOs with existing entities
      for (const foodDto of incomingFoodDtos) {
        // Ensure amount is treated as a number for comparison and saving
        const dtoAmount = Number(foodDto.amount);
        if (isNaN(dtoAmount)) {
          continue; // Skip this food if amount is invalid
        }

        const existingFood = existingMealFoods.find(
          (mf) =>
            mf.foodId === foodDto.foodId &&
            mf.source.toLowerCase() === foodDto.source.toLowerCase(),
        );

        if (existingFood) {
          // Food exists, check for updates
          const indexToRemove = foodIdsToRemove.indexOf(existingFood.id);
          if (indexToRemove > -1) {
            foodIdsToRemove.splice(indexToRemove, 1); // Keep this one, don't remove
          }

          // Compare amount as numbers
          if (
            Number(existingFood.amount) !== dtoAmount ||
            existingFood.unit !== foodDto.unit
          ) {
            existingFood.amount = dtoAmount; // Save as number
            existingFood.unit = foodDto.unit;
            foodsToUpdate.push(existingFood);
          }
        } else {
          // Food is new, add it
          foodsToAdd.push({
            amount: dtoAmount, // Save as number
            unit: foodDto.unit,
            foodId: foodDto.foodId,
            source: foodDto.source.toLowerCase(),
            meal: meal, // Associate with the current meal entity
            mealId: meal.id,
          });
        }
      }

      // Perform DB operations
      let dbChanged = false;
      if (foodIdsToRemove.length > 0) {
        await this.mealFoodRepository.delete(foodIdsToRemove);
        dbChanged = true;
      }
      if (foodsToUpdate.length > 0) {
        await this.mealFoodRepository.save(foodsToUpdate);
        dbChanged = true;
      }
      if (foodsToAdd.length > 0) {
        const newMealFoods = this.mealFoodRepository.create(foodsToAdd);
        const savedMealFoods = await this.mealFoodRepository.save(newMealFoods);
        // Atualiza a coleção em memória para refletir os novos alimentos
        meal.mealFoods = [...(meal.mealFoods || []), ...savedMealFoods];
        dbChanged = true;
      }
      // If any DB operation happened regarding mealFoods, set mealUpdated flag
      if (dbChanged) mealUpdated = true;
    } else if (updateMealDto.mealFoods === null) {
      // If mealFoods is explicitly null, remove all existing foods
      const existingFoodIds = (meal.mealFoods || []).map((mf) => mf.id);
      if (existingFoodIds.length > 0) {
        await this.mealFoodRepository.delete(existingFoodIds);
        mealUpdated = true;
      }
    }
    // Else: mealFoods was undefined in DTO, so don't touch existing meal foods

    // Save the Meal entity itself only if its direct properties or its mealFoods changed
    if (mealUpdated) {
      await this.mealRepository.save(meal);
    }

    await this.updateMealNutritionTotals(meal.id);
    await this.updateMealPlanTotals(planId);

    // Re-fetch the meal with relations to ensure we return the latest state from DB
    const finalMealState = await this.mealRepository.findOne({
      where: { id: meal.id },
      relations: ['mealFoods'], // Ensure relations are loaded
    });

    if (!finalMealState) {
      throw new NotFoundException('Refeição não encontrada após atualização');
    }

    return finalMealState;
  }

  async deleteMeal(
    planId: string,
    mealId: string,
    nutritionistId: string,
  ): Promise<void> {
    // Verifica se o plano e a refeição existem e pertencem ao nutricionista
    const mealPlan = await this.mealPlanRepository.findOne({
      where: { id: planId, nutritionistId },
    });
    if (!mealPlan) {
      throw new NotFoundException(`Plano alimentar não encontrado`);
    }

    const meal = await this.mealRepository.findOne({
      where: { id: mealId, mealPlan: { id: planId } },
      relations: ['mealFoods'],
    });

    if (!meal) {
      throw new NotFoundException(`Refeição não encontrada`);
    }

    // Remove os alimentos da refeição
    if (meal.mealFoods && meal.mealFoods.length > 0) {
      await this.mealFoodRepository.delete(meal.mealFoods.map((mf) => mf.id));
    }

    // Remove a refeição
    await this.mealRepository.remove(meal);

    // Atualiza os totais do plano
    await this.updateMealPlanTotals(planId);
  }
}
