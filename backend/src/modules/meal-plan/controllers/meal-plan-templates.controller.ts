import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { MealPlanTemplatesService } from '../services/meal-plan-templates.service';
import { CreateMealPlanTemplateDto } from '../dto/create-meal-plan-template.dto';
import { UpdateMealPlanTemplateDto } from '../dto/update-meal-plan-template.dto';
import { MealPlanTemplateResponseDto } from '../dto/meal-plan-template.response.dto';
import { FoodTemplateResponseDto } from '../dto/meal-plan-template.response.dto';
import { plainToClass } from 'class-transformer';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('Meal Plan Templates')
@Controller('meal-plan-templates')
@UseGuards(JwtAuthGuard)
export class MealPlanTemplatesController {
  constructor(
    private readonly mealPlanTemplatesService: MealPlanTemplatesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new meal plan template' })
  @ApiResponse({ status: 201, type: MealPlanTemplateResponseDto })
  async create(
    @Body() createMealPlanTemplateDto: CreateMealPlanTemplateDto,
    @CurrentUser('id') nutritionistId: string,
  ): Promise<MealPlanTemplateResponseDto> {
    const template = await this.mealPlanTemplatesService.create(
      createMealPlanTemplateDto,
      nutritionistId,
    );
    return plainToClass(MealPlanTemplateResponseDto, template, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all meal plan templates' })
  @ApiResponse({ status: 200, type: [MealPlanTemplateResponseDto] })
  async findAll(
    @CurrentUser('id') nutritionistId: string,
  ): Promise<MealPlanTemplateResponseDto[]> {
    const templates =
      await this.mealPlanTemplatesService.findAll(nutritionistId);
    return plainToClass(MealPlanTemplateResponseDto, templates, {
      excludeExtraneousValues: true,
    });
  }

  @Get('search/foods')
  @ApiOperation({ summary: 'Search food templates' })
  @ApiResponse({ status: 200, type: [FoodTemplateResponseDto] })
  async searchFoods(
    @Query('query') query: string,
  ): Promise<FoodTemplateResponseDto[]> {
    const foods =
      await this.mealPlanTemplatesService.searchFoodTemplates(query);
    return plainToClass(FoodTemplateResponseDto, foods, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a meal plan template by ID' })
  @ApiResponse({ status: 200, type: MealPlanTemplateResponseDto })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') nutritionistId: string,
  ): Promise<MealPlanTemplateResponseDto> {
    const template = await this.mealPlanTemplatesService.findOne(
      id,
      nutritionistId,
    );
    return plainToClass(MealPlanTemplateResponseDto, template, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a meal plan template' })
  @ApiResponse({ status: 200, type: MealPlanTemplateResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMealPlanTemplateDto: UpdateMealPlanTemplateDto,
    @CurrentUser('id') nutritionistId: string,
  ): Promise<MealPlanTemplateResponseDto> {
    const template = await this.mealPlanTemplatesService.update(
      id,
      updateMealPlanTemplateDto,
      nutritionistId,
    );
    return plainToClass(MealPlanTemplateResponseDto, template, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a meal plan template' })
  @ApiResponse({ status: 200 })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') nutritionistId: string,
  ): Promise<void> {
    await this.mealPlanTemplatesService.remove(id, nutritionistId);
  }

  @Post(':id/create-plan/:patientId')
  @ApiOperation({ summary: 'Create a meal plan from a template' })
  @ApiResponse({ status: 201 })
  async createPlanFromTemplate(
    @Param('id', ParseUUIDPipe) templateId: string,
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @CurrentUser('id') nutritionistId: string,
  ): Promise<void> {
    await this.mealPlanTemplatesService.createMealPlanFromTemplate(
      templateId,
      patientId,
      nutritionistId,
    );
  }
}
