import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { PatientDataAggregationService } from './services/patient-data-aggregation.service';
import { AiProviderService } from './services/ai-provider.service';
import { FoodMatchingService } from './services/food-matching.service';

import { Food } from '../foods/entities/food.entity';
import { MealPlan } from '../meal-plan/entities/meal-plan.entity';
import { Meal } from '../meal-plan/entities/meal.entity';
import { MealFood } from '../meal-plan/entities/meal-food.entity';

import { AiMealPlanRequestDto } from './dto/ai-meal-plan-request.dto';
import { AiMealPlanResponseDto } from './dto/ai-meal-plan-response.dto';
import { AiPatientDataDto } from './dto/ai-patient-data.dto';

@Injectable()
export class AiMealPlansService {
  private readonly logger = new Logger(AiMealPlansService.name);
  private readonly isAiEnabled: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly patientDataService: PatientDataAggregationService,
    private readonly aiProviderService: AiProviderService,
    private readonly foodMatchingService: FoodMatchingService,
    @InjectRepository(Food)
    private readonly foodRepository: Repository<Food>,
    @InjectRepository(MealPlan)
    private readonly mealPlanRepository: Repository<MealPlan>,
    @InjectRepository(Meal)
    private readonly mealRepository: Repository<Meal>,
    @InjectRepository(MealFood)
    private readonly mealFoodRepository: Repository<MealFood>,
  ) {
    this.isAiEnabled = this.configService.get<boolean>('AI_MEAL_PLANS_ENABLED', true);
    this.logger.log(`AI Meal Plans Service initialized. Enabled: ${this.isAiEnabled}`);
  }

  async generateAiMealPlan(request: AiMealPlanRequestDto, nutritionistId: string): Promise<AiMealPlanResponseDto> {
    this.logger.log(`Generating AI meal plan for patient: ${request.patientId}`);

    if (!this.isAiEnabled) {
      throw new BadRequestException('AI meal plan generation is currently disabled');
    }

    if (!this.aiProviderService.isAvailable()) {
      throw new BadRequestException('AI service is not available. Please check configuration.');
    }

    try {
      // 1. Aggregate patient data
      const patientData = await this.patientDataService.aggregatePatientData(request.patientId);
      
      // 2. Validate data completeness
      const validation = await this.patientDataService.validatePatientDataCompleteness(patientData);
      if (!validation.isComplete) {
        this.logger.warn(`Incomplete patient data for ${request.patientId}:`, validation.missingData);
        // Continue with warnings but not blocking errors
      }

      // 3. Get food database
      const foodDatabase = await this.getFoodDatabase();
      if (foodDatabase.length === 0) {
        throw new BadRequestException('Food database is empty. Cannot generate meal plan.');
      }

      // 4. Generate meal plan with AI
      const generationContext = {
        patientData,
        configuration: request.configuration,
        foodDatabase,
        nutritionistId,
        generationId: `gen-${Date.now()}`,
      };

      const result = await this.aiProviderService.generateWithRetry(generationContext);
      
      if (!result.success) {
        throw new BadRequestException(`AI generation failed: ${result.error}`);
      }

      // 5. Validate and enhance AI response
      const enhancedPlan = await this.enhanceAiResponse(result.data!);

      this.logger.log(`AI meal plan generated successfully for patient ${request.patientId}`);
      return enhancedPlan;

    } catch (error) {
      this.logger.error(`Failed to generate AI meal plan for patient ${request.patientId}:`, error.message);
      throw error;
    }
  }

  async getPatientDataForAi(patientId: string): Promise<AiPatientDataDto> {
    return this.patientDataService.aggregatePatientData(patientId);
  }

  async saveMealPlan(aiResponse: AiMealPlanResponseDto, patientId: string, nutritionistId: string): Promise<MealPlan> {
    this.logger.log(`Saving AI-generated meal plan for patient: ${patientId}`);

    try {
      // Create meal plan entity
      const mealPlan = this.mealPlanRepository.create({
        name: aiResponse.mealPlan.title,
        description: aiResponse.mealPlan.description,
        patientId,
        nutritionistId,
        startDate: new Date(aiResponse.mealPlan.startDate),
        endDate: new Date(aiResponse.mealPlan.endDate),
        dailyCalories: aiResponse.nutritionalSummary.totalCalories || 0,
        dailyProtein: aiResponse.nutritionalSummary.protein || 0,
        dailyCarbs: aiResponse.nutritionalSummary.carbohydrates || 0,
        dailyFat: aiResponse.nutritionalSummary.fat || 0,
      });

      const savedMealPlan = await this.mealPlanRepository.save(mealPlan);

      // Create meals and foods
      for (const aiMeal of aiResponse.mealPlan.meals) {
        const meal = this.mealRepository.create({
          name: aiMeal.name,
          time: aiMeal.time,
          mealPlan: savedMealPlan,
          description: `Gerado por IA - ${aiMeal.name}`,
          totalCalories: aiMeal.foods.reduce((sum, food) => sum + (food.calories || 0), 0),
          totalProtein: aiMeal.foods.reduce((sum, food) => sum + (food.protein || 0), 0),
          totalCarbs: aiMeal.foods.reduce((sum, food) => sum + (food.carbohydrates || 0), 0),
          totalFat: aiMeal.foods.reduce((sum, food) => sum + (food.fat || 0), 0),
        });

        const savedMeal = await this.mealRepository.save(meal);

        // Create meal foods
        for (const aiFood of aiMeal.foods) {
          // Try to find the food in our database
          const food = await this.foodRepository.findOne({
            where: { id: aiFood.foodId },
          });

          if (food) {
            const mealFood = this.mealFoodRepository.create({
              mealId: savedMeal.id,
              foodId: food.id,
              amount: aiFood.quantity,
              unit: aiFood.unit,
              source: 'tbca',
              meal: savedMeal,
            });

            await this.mealFoodRepository.save(mealFood);
          } else {
            this.logger.warn(`Food not found in database: ${aiFood.foodId} (${aiFood.name})`);
          }
        }
      }

      this.logger.log(`AI meal plan saved successfully: ${savedMealPlan.id}`);
      return savedMealPlan;

    } catch (error) {
      this.logger.error(`Failed to save AI meal plan:`, error.message);
      throw new BadRequestException('Failed to save AI-generated meal plan');
    }
  }

  async batchFoodMatching(foodNames: string[]): Promise<any> {
    this.logger.log(`Matching ${foodNames.length} foods with database`);
    return this.foodMatchingService.matchFoodsWithDatabase(foodNames);
  }

  private async getFoodDatabase(): Promise<any[]> {
    try {
      const foods = await this.foodRepository.find({
        select: [
          'id',
          'name', 
          'calories',
          'protein',
          'carbohydrates',
          'fat',
          'fiber',
          'servingSize',
          'servingUnit',
          'categories'
        ],
        take: 1000, // Limit for performance - can be adjusted
      });

      return foods.map(food => ({
        id: food.id,
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbohydrates: food.carbohydrates,
        fat: food.fat,
        fiber: food.fiber,
        servingSize: food.servingSize,
        servingUnit: food.servingUnit,
        categories: food.categories,
      }));
    } catch (error) {
      this.logger.error('Failed to fetch food database:', error.message);
      return [];
    }
  }

  private async enhanceAiResponse(aiResponse: AiMealPlanResponseDto): Promise<AiMealPlanResponseDto> {
    // Validate and match foods with database
    const enhancedMeals: any[] = [];

    for (const meal of aiResponse.mealPlan.meals) {
      const enhancedFoods: any[] = [];

      for (const food of meal.foods) {
        // Try to find exact match in database
        let dbFood = await this.foodRepository.findOne({
          where: { name: food.name },
        });

        // If not found, try fuzzy matching
        if (!dbFood) {
          const matchResult = await this.foodMatchingService.findBestMatch(food.name);
          if (matchResult.bestMatch && matchResult.confidence > 0.7) {
            dbFood = matchResult.bestMatch;
            this.logger.log(`Fuzzy matched "${food.name}" to "${dbFood.name}" (confidence: ${matchResult.confidence})`);
          }
        }

        if (dbFood) {
          enhancedFoods.push({
            ...food,
            foodId: dbFood.id,
            name: dbFood.name, // Use database name for consistency
            // Recalculate nutrition based on quantity and database values
            calories: Math.round((food.quantity / (dbFood.servingSize || 100)) * dbFood.calories),
            protein: Number(((food.quantity / (dbFood.servingSize || 100)) * dbFood.protein).toFixed(1)),
            carbohydrates: Number(((food.quantity / (dbFood.servingSize || 100)) * dbFood.carbohydrates).toFixed(1)),
            fat: Number(((food.quantity / (dbFood.servingSize || 100)) * dbFood.fat).toFixed(1)),
          });
        } else {
          this.logger.warn(`Could not match food: ${food.name}`);
          // Keep original but mark as unmatched
          enhancedFoods.push({
            ...food,
            foodId: `unmatched-${Date.now()}`,
          });
        }
      }

      enhancedMeals.push({
        ...meal,
        foods: enhancedFoods,
      });
    }

    return {
      ...aiResponse,
      mealPlan: {
        ...aiResponse.mealPlan,
        meals: enhancedMeals,
      },
    };
  }

  async getAiGenerationStatus(): Promise<{
    isEnabled: boolean;
    isAvailable: boolean;
    provider: string;
    foodDatabaseSize: number;
  }> {
    const foodCount = await this.foodRepository.count();
    
    return {
      isEnabled: this.isAiEnabled,
      isAvailable: this.aiProviderService.isAvailable(),
      provider: this.aiProviderService.getProviderName(),
      foodDatabaseSize: foodCount,
    };
  }
}