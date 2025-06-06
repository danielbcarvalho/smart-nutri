import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { MealPlan } from '../entities/meal-plan.entity';
import { Meal } from '../entities/meal.entity';
import { MealFood } from '../entities/meal-food.entity';
import { FoodSubstitute } from '../entities/food-substitute.entity';
import { CreateMealPlanDto } from '../dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from '../dto/update-meal-plan.dto';
import { CreateMealDto } from '../dto/create-meal.dto';
import { PatientsService } from '../../patients/patients.service';
import { MealResponseDto } from '../dto/meal.response.dto';
import { MealFoodResponseDto } from '../dto/meal-food.response.dto';
import { FoodsService } from '../../foods/foods.service';

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
    @InjectRepository(FoodSubstitute)
    private readonly foodSubstituteRepository: Repository<FoodSubstitute>,
    private readonly patientsService: PatientsService,
    private readonly foodsService: FoodsService,
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
      where: { 
        nutritionistId,
        isTemplate: false, // Only return regular meal plans, not templates
      },
      relations: [
        'meals',
        'meals.mealFoods',
        'meals.mealFoods.substitutes',
        'patient',
        'nutritionist',
        'energyPlan',
      ],
      order: { startDate: 'DESC' },
    });
  }

  async findOne(id: string, nutritionistId: string): Promise<MealPlan> {
    const mealPlan = await this.mealPlanRepository.findOne({
      where: { 
        id, 
        nutritionistId,
        isTemplate: false, // Only return regular meal plans, not templates
      },
      relations: {
        meals: {
          mealFoods: {
            substitutes: true,
          },
        },
        patient: true,
        nutritionist: true,
        energyPlan: true,
      },
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
      where: { 
        patientId, 
        nutritionistId,
        isTemplate: false, // Only return regular meal plans, not templates
      },
      relations: ['meals', 'meals.mealFoods'],
      order: { startDate: 'DESC' },
    });
  }

  async update(
    id: string,
    mealPlanDto: UpdateMealPlanDto,
    nutritionistId: string,
  ): Promise<MealPlan> {
    // Primeiro, busca o plano com todas as relações necessárias
    const mealPlan = await this.mealPlanRepository.findOne({
      where: { id, nutritionistId },
      relations: ['meals', 'meals.mealFoods', 'meals.mealFoods.substitutes'],
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

    // Atualiza apenas os campos básicos do plano
    const fieldsToUpdate = {
      name: mealPlanDto.name,
      description: mealPlanDto.description,
      startDate: mealPlanDto.startDate,
      endDate: mealPlanDto.endDate,
      energyPlanId: mealPlanDto.energyPlanId,
    };

    // Remove campos undefined
    Object.keys(fieldsToUpdate).forEach(
      (key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key],
    );

    // Atualiza o plano
    await this.mealPlanRepository.update(id, fieldsToUpdate);

    // Atualiza as refeições se necessário
    if (mealPlanDto.meals && Array.isArray(mealPlanDto.meals)) {
      for (const mealDto of mealPlanDto.meals) {
        const existingMeal = mealPlan.meals.find((m) => m.id === mealDto.id);
        if (existingMeal) {
          // Atualiza apenas os campos necessários da refeição
          await this.mealRepository.update(mealDto.id, {
            name: mealDto.name,
            time: mealDto.time,
            description: mealDto.description,
            isActiveForCalculation: mealDto.isActiveForCalculation,
          });
        }
      }
    }

    // Se não estamos atualizando os totais manualmente, recalcula
    if (!isUpdatingTotals) {
      await this.updateMealPlanTotals(id);
    }

    // Força uma nova busca com todas as relações
    const updatedMealPlan = await this.mealPlanRepository.findOne({
      where: { id },
      relations: [
        'meals',
        'meals.mealFoods',
        'meals.mealFoods.substitutes',
        'patient',
        'nutritionist',
        'energyPlan',
      ],
    });

    if (!updatedMealPlan) {
      throw new NotFoundException(
        `Meal plan with ID ${id} not found after update`,
      );
    }

    return updatedMealPlan;
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

    // Criar a refeição sem os mealFoods inicialmente
    const meal = this.mealRepository.create({
      name: createMealDto.name,
      time: createMealDto.time,
      description: createMealDto.description,
      isActiveForCalculation: createMealDto.isActiveForCalculation ?? true,
      mealPlan: { id: mealPlan.id }, // Usar apenas o ID para a relação
    });

    try {
      const savedMeal = await this.mealRepository.save(meal);

      // Se houver mealFoods, criar eles separadamente
      if (createMealDto.mealFoods?.length > 0) {
        const mealFoods = createMealDto.mealFoods.map((foodDto) => ({
          amount: Number(foodDto.amount),
          unit: foodDto.unit,
          foodId: foodDto.foodId,
          source: foodDto.source.toLowerCase(),
          meal: { id: savedMeal.id },
          mealId: savedMeal.id,
        }));

        const savedMealFoods = await this.mealFoodRepository.save(mealFoods);
        savedMeal.mealFoods = savedMealFoods;
      }

      // Atualiza os totais do plano
      await this.updateMealPlanTotals(planId);

      // Buscar a refeição completa com todas as relações
      const completeMeal = await this.mealRepository.findOne({
        where: { id: savedMeal.id },
        relations: ['mealFoods', 'mealFoods.substitutes'],
      });

      if (!completeMeal) {
        throw new NotFoundException('Refeição não encontrada após criação');
      }

      return completeMeal;
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
      where: [{ 
        name: ILike(`%${query}%`), 
        nutritionistId,
        isTemplate: false, // Only return regular meal plans, not templates
      }],
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
        // Só considera refeições ativas para cálculo
        if (meal.isActiveForCalculation) {
          totalCalories += meal.totalCalories;
          totalProtein += meal.totalProtein;
          totalCarbs += meal.totalCarbs;
          totalFat += meal.totalFat;
        }
      }

      // Calcula médias diárias
      const days = Math.max(
        1,
        Math.ceil(
          ((mealPlan.endDate?.getTime() || Date.now()) - (mealPlan.startDate?.getTime() || Date.now())) /
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

  private async transformMealToResponseDto(
    meal: Meal,
  ): Promise<MealResponseDto> {
    const mealFoods = await Promise.all(
      meal.mealFoods?.map(async (mealFood) => {
        const substitutes = await this.foodSubstituteRepository.find({
          where: {
            originalFoodId: mealFood.foodId,
            originalSource: mealFood.source,
          },
        });

        const substitutesWithNames = await Promise.all(
          substitutes.map(async (substitute) => {
            const food = await this.foodsService.findBySourceAndSourceId(
              substitute.substituteSource,
              substitute.substituteFoodId,
            );

            return {
              foodId: substitute.substituteFoodId,
              source: substitute.substituteSource,
              name: food?.name || 'Alimento não encontrado',
              amount: substitute.substituteAmount,
              unit: substitute.substituteUnit,
            };
          }),
        );

        // Buscar o nome do alimento principal
        const mainFood = await this.foodsService.findBySourceAndSourceId(
          mealFood.source,
          mealFood.foodId,
        );

        return {
          id: mealFood.id,
          amount: mealFood.amount.toString(),
          unit: mealFood.unit,
          foodId: mealFood.foodId,
          source: mealFood.source,
          name: mainFood?.name || 'Alimento não encontrado',
          mealId: mealFood.mealId,
          createdAt: mealFood.createdAt,
          updatedAt: mealFood.updatedAt,
          substitutes: substitutesWithNames,
        };
      }) || [],
    );

    return {
      id: meal.id,
      name: meal.name,
      time: meal.time,
      description: meal.description,
      isActiveForCalculation: meal.isActiveForCalculation,
      mealFoods,
      createdAt: meal.createdAt,
      updatedAt: meal.updatedAt,
      totalCalories: meal.totalCalories.toString(),
      totalProtein: meal.totalProtein.toString(),
      totalCarbs: meal.totalCarbs.toString(),
      totalFat: meal.totalFat.toString(),
    };
  }

  async updateMeal(
    planId: string,
    mealId: string,
    updateMealDto: any,
    nutritionistId: string,
  ): Promise<MealResponseDto> {
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
    if (
      updateMealDto.isActiveForCalculation !== undefined &&
      meal.isActiveForCalculation !== updateMealDto.isActiveForCalculation
    ) {
      meal.isActiveForCalculation = updateMealDto.isActiveForCalculation;
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

          // Process substitutes if they exist
          if (foodDto.substitutes?.length > 0) {
            // Remove existing substitutes for this food
            await this.foodSubstituteRepository.delete({
              originalFoodId: existingFood.foodId,
              originalSource: existingFood.source,
              nutritionistId,
            });

            // Add new substitutes
            for (const substitute of foodDto.substitutes) {
              await this.foodSubstituteRepository.save({
                originalFoodId: existingFood.foodId,
                originalSource: existingFood.source,
                substituteFoodId: substitute.foodId,
                substituteSource: substitute.source,
                substituteAmount: substitute.amount,
                substituteUnit: substitute.unit,
                nutritionistId,
              });
            }
          }
        } else {
          // New food to add
          foodsToAdd.push({
            amount: dtoAmount,
            unit: foodDto.unit,
            foodId: foodDto.foodId,
            source: foodDto.source.toLowerCase(),
            meal: { id: meal.id },
            mealId: meal.id,
          });
        }
      }

      // Remove foods that are no longer in the list
      if (foodIdsToRemove.length > 0) {
        await this.mealFoodRepository.delete(foodIdsToRemove);
        mealUpdated = true;
      }

      // Update existing foods
      if (foodsToUpdate.length > 0) {
        await this.mealFoodRepository.save(foodsToUpdate);
        mealUpdated = true;
      }

      // Add new foods
      if (foodsToAdd.length > 0) {
        const newMealFoods = this.mealFoodRepository.create(foodsToAdd);
        const savedMealFoods = await this.mealFoodRepository.save(newMealFoods);
        // Atualiza a coleção em memória para refletir os novos alimentos
        meal.mealFoods = [...(meal.mealFoods || []), ...savedMealFoods];
        mealUpdated = true;
      }
    } else if (updateMealDto.mealFoods === null) {
      // If mealFoods is explicitly null, remove all existing foods and their substitutes
      const existingFoodIds = (meal.mealFoods || []).map((mf) => mf.id);
      if (existingFoodIds.length > 0) {
        // Remove all substitutes for this meal's foods
        for (const mealFood of meal.mealFoods) {
          await this.foodSubstituteRepository.delete({
            originalFoodId: mealFood.foodId,
            originalSource: mealFood.source,
            nutritionistId,
          });
        }
        await this.mealFoodRepository.delete(existingFoodIds);
        mealUpdated = true;
      }
    }

    // Save the Meal entity itself only if its direct properties or its mealFoods changed
    if (mealUpdated) {
      await this.mealRepository.save(meal);
    }

    await this.updateMealNutritionTotals(meal.id);
    await this.updateMealPlanTotals(planId);

    // Buscar a refeição atualizada com todas as relações necessárias
    const updatedMeal = await this.mealRepository
      .createQueryBuilder('meal')
      .leftJoinAndSelect('meal.mealFoods', 'mealFoods')
      .leftJoinAndSelect('mealFoods.substitutes', 'substitutes')
      .leftJoinAndSelect('meal.mealPlan', 'mealPlan')
      .where('meal.id = :mealId', { mealId: meal.id })
      .andWhere('mealPlan.nutritionistId = :nutritionistId', { nutritionistId })
      .getOne();

    if (!updatedMeal) {
      throw new NotFoundException('Refeição não encontrada após atualização');
    }

    // Força uma nova busca dos alimentos para garantir que temos apenas os ativos
    const activeMealFoods = await this.mealFoodRepository.find({
      where: { mealId: meal.id },
      relations: ['substitutes'],
    });

    // Atualiza a coleção de alimentos da refeição
    updatedMeal.mealFoods = activeMealFoods;

    return this.transformMealToResponseDto(updatedMeal);
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
