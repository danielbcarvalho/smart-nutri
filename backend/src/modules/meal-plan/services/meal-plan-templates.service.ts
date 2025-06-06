import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In } from 'typeorm';
import { MealPlan } from '../entities/meal-plan.entity';
import { Meal } from '../entities/meal.entity';
import { MealFood } from '../entities/meal-food.entity';
import { SaveAsTemplateDto } from '../dto/save-as-template.dto';
import { TemplateFiltersDto } from '../dto/template-filters.dto';
import { CreatePlanFromTemplateDto } from '../dto/create-plan-from-template.dto';
import { MealPlanTemplateEnhancedResponseDto } from '../dto/meal-plan-template-enhanced.response.dto';
import { PatientsService } from '../../patients/patients.service';

@Injectable()
export class MealPlanTemplatesService {
  private readonly logger = new Logger(MealPlanTemplatesService.name);

  constructor(
    @InjectRepository(MealPlan)
    private readonly mealPlanRepository: Repository<MealPlan>,
    @InjectRepository(Meal)
    private readonly mealRepository: Repository<Meal>,
    @InjectRepository(MealFood)
    private readonly mealFoodRepository: Repository<MealFood>,
    private readonly patientsService: PatientsService,
  ) {}

  /**
   * Save an existing meal plan as a template
   */
  async saveAsTemplate(
    mealPlanId: string,
    saveAsTemplateDto: SaveAsTemplateDto,
    nutritionistId: string,
  ): Promise<MealPlan> {
    // Get the original meal plan with all relations
    const originalPlan = await this.mealPlanRepository.findOne({
      where: { id: mealPlanId, nutritionistId },
      relations: {
        meals: {
          mealFoods: {
            substitutes: true,
          },
        },
      },
    });

    if (!originalPlan) {
      throw new NotFoundException(`Meal plan with ID ${mealPlanId} not found`);
    }

    // Create a copy of the meal plan as template
    const template = this.mealPlanRepository.create({
      name: originalPlan.name,
      description: originalPlan.description,
      nutritionistId,
      isTemplate: true,
      templateName: saveAsTemplateDto.templateName,
      templateDescription: saveAsTemplateDto.templateDescription,
      isPublic: saveAsTemplateDto.isPublic ?? false,
      tags: saveAsTemplateDto.tags,
      templateCategory: saveAsTemplateDto.templateCategory,
      targetCalories: saveAsTemplateDto.targetCalories,
      dailyCalories: originalPlan.dailyCalories,
      dailyProtein: originalPlan.dailyProtein,
      dailyCarbs: originalPlan.dailyCarbs,
      dailyFat: originalPlan.dailyFat,
    });

    const savedTemplate = await this.mealPlanRepository.save(template);

    // Copy all meals and their foods
    for (const originalMeal of originalPlan.meals) {
      const templateMeal = this.mealRepository.create({
        name: originalMeal.name,
        time: originalMeal.time,
        description: originalMeal.description,
        isActiveForCalculation: originalMeal.isActiveForCalculation,
        mealPlan: savedTemplate,
        totalCalories: originalMeal.totalCalories,
        totalProtein: originalMeal.totalProtein,
        totalCarbs: originalMeal.totalCarbs,
        totalFat: originalMeal.totalFat,
      });

      const savedMeal = await this.mealRepository.save(templateMeal);

      // Copy all meal foods
      for (const originalMealFood of originalMeal.mealFoods) {
        const templateMealFood = this.mealFoodRepository.create({
          foodId: originalMealFood.foodId,
          source: originalMealFood.source,
          amount: originalMealFood.amount,
          unit: originalMealFood.unit,
          meal: savedMeal,
        });

        await this.mealFoodRepository.save(templateMealFood);
      }
    }

    this.logger.log(`Template '${saveAsTemplateDto.templateName}' created from meal plan ${mealPlanId}`);

    return this.findOne(savedTemplate.id, nutritionistId);
  }

  /**
   * Find all templates accessible to the nutritionist
   */
  async findAll(nutritionistId: string): Promise<MealPlan[]> {
    return this.mealPlanRepository.find({
      where: [
        { nutritionistId, isTemplate: true },
        { isPublic: true, isTemplate: true },
      ],
      relations: {
        meals: {
          mealFoods: true,
        },
      },
      order: { 
        usageCount: 'DESC',
        templateName: 'ASC',
      },
    });
  }

  /**
   * Find templates with advanced filtering
   */
  async searchTemplates(
    filters: TemplateFiltersDto,
    nutritionistId: string,
  ): Promise<MealPlan[]> {
    const queryBuilder = this.mealPlanRepository
      .createQueryBuilder('template')
      .leftJoinAndSelect('template.meals', 'meals')
      .leftJoinAndSelect('meals.mealFoods', 'mealFoods')
      .where('template.isTemplate = :isTemplate', { isTemplate: true })
      .andWhere('(template.nutritionistId = :nutritionistId OR template.isPublic = :isPublic)', {
        nutritionistId,
        isPublic: true,
      });

    // Apply filters
    if (filters.category) {
      queryBuilder.andWhere('template.templateCategory = :category', {
        category: filters.category,
      });
    }

    if (filters.tags && filters.tags.length > 0) {
      queryBuilder.andWhere('template.tags && :tags', {
        tags: filters.tags,
      });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(template.templateName ILIKE :search OR template.templateDescription ILIKE :search OR template.templateCategory ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters.isPublic !== undefined) {
      queryBuilder.andWhere('template.isPublic = :isPublicFilter', {
        isPublicFilter: filters.isPublic,
      });
    }

    if (filters.minCalories) {
      queryBuilder.andWhere('template.targetCalories >= :minCalories', {
        minCalories: filters.minCalories,
      });
    }

    if (filters.maxCalories) {
      queryBuilder.andWhere('template.targetCalories <= :maxCalories', {
        maxCalories: filters.maxCalories,
      });
    }

    return queryBuilder
      .orderBy('template.usageCount', 'DESC')
      .addOrderBy('template.templateName', 'ASC')
      .getMany();
  }

  /**
   * Find a specific template by ID
   */
  async findOne(id: string, nutritionistId: string): Promise<MealPlan> {
    const template = await this.mealPlanRepository.findOne({
      where: [
        { id, nutritionistId, isTemplate: true },
        { id, isPublic: true, isTemplate: true },
      ],
      relations: {
        meals: {
          mealFoods: {
            substitutes: true,
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    return template;
  }

  /**
   * Update template metadata (only owner can update)
   */
  async update(
    id: string,
    updateData: Partial<SaveAsTemplateDto>,
    nutritionistId: string,
  ): Promise<MealPlan> {
    const template = await this.mealPlanRepository.findOne({
      where: { id, nutritionistId, isTemplate: true },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found or not owned by user`);
    }

    await this.mealPlanRepository.update(id, {
      templateName: updateData.templateName,
      templateDescription: updateData.templateDescription,
      isPublic: updateData.isPublic,
      tags: updateData.tags,
      templateCategory: updateData.templateCategory,
      targetCalories: updateData.targetCalories,
    });

    return this.findOne(id, nutritionistId);
  }

  /**
   * Remove a template (only owner can remove)
   */
  async remove(id: string, nutritionistId: string): Promise<void> {
    const template = await this.mealPlanRepository.findOne({
      where: { id, nutritionistId, isTemplate: true },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found or not owned by user`);
    }

    await this.mealPlanRepository.remove(template);
    this.logger.log(`Template '${template.templateName}' deleted by nutritionist ${nutritionistId}`);
  }

  /**
   * Create a new meal plan from a template
   */
  async createMealPlanFromTemplate(
    templateId: string,
    patientId: string,
    nutritionistId: string,
    customData?: CreatePlanFromTemplateDto,
  ): Promise<MealPlan> {
    // Verify patient exists and belongs to nutritionist
    await this.patientsService.findOne(patientId, nutritionistId);

    // Get the template with all relations
    const template = await this.findOne(templateId, nutritionistId);

    // Increment usage count
    await this.mealPlanRepository.update(templateId, {
      usageCount: () => 'usage_count + 1',
    });

    // Create new meal plan from template with optional customization
    const defaultStartDate = new Date();
    const defaultEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    
    const newMealPlan = this.mealPlanRepository.create({
      name: customData?.name || template.templateName || template.name,
      description: customData?.description || template.templateDescription || template.description,
      patientId,
      nutritionistId,
      startDate: customData?.startDate ? new Date(customData.startDate) : defaultStartDate,
      endDate: customData?.endDate ? new Date(customData.endDate) : defaultEndDate,
      isTemplate: false, // This is a regular meal plan, not a template
      dailyCalories: template.dailyCalories,
      dailyProtein: template.dailyProtein,
      dailyCarbs: template.dailyCarbs,
      dailyFat: template.dailyFat,
    });

    const savedMealPlan = await this.mealPlanRepository.save(newMealPlan);

    // Copy all meals and their foods from template
    for (const templateMeal of template.meals) {
      const newMeal = this.mealRepository.create({
        name: templateMeal.name,
        time: templateMeal.time,
        description: templateMeal.description,
        isActiveForCalculation: templateMeal.isActiveForCalculation,
        mealPlan: savedMealPlan,
        totalCalories: templateMeal.totalCalories,
        totalProtein: templateMeal.totalProtein,
        totalCarbs: templateMeal.totalCarbs,
        totalFat: templateMeal.totalFat,
      });

      const savedMeal = await this.mealRepository.save(newMeal);

      // Copy all meal foods from template
      for (const templateMealFood of templateMeal.mealFoods) {
        const newMealFood = this.mealFoodRepository.create({
          foodId: templateMealFood.foodId,
          source: templateMealFood.source,
          amount: templateMealFood.amount,
          unit: templateMealFood.unit,
          meal: savedMeal,
        });

        await this.mealFoodRepository.save(newMealFood);
      }
    }

    this.logger.log(`New meal plan created from template '${template.templateName}' for patient ${patientId}`);

    // Return the complete meal plan with relations
    const result = await this.mealPlanRepository.findOne({
      where: { id: savedMealPlan.id },
      relations: {
        meals: {
          mealFoods: {
            substitutes: true,
          },
        },
        patient: true,
      },
    });

    if (!result) {
      throw new NotFoundException(`Created meal plan with ID ${savedMealPlan.id} not found`);
    }

    return result;
  }
}
