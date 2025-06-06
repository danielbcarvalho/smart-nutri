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
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiQuery, 
  ApiParam, 
  ApiBody 
} from '@nestjs/swagger';

import { MealPlanTemplatesService } from '../services/meal-plan-templates.service';
import { SaveAsTemplateDto } from '../dto/save-as-template.dto';
import { TemplateFiltersDto } from '../dto/template-filters.dto';
import { CreatePlanFromTemplateDto } from '../dto/create-plan-from-template.dto';
import { MealPlanTemplateEnhancedResponseDto } from '../dto/meal-plan-template-enhanced.response.dto';
import { MealPlan } from '../entities/meal-plan.entity';
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

  @Get()
  @ApiOperation({ summary: 'Get all meal plan templates' })
  @ApiResponse({ status: 200, type: [MealPlan] })
  async findAll(
    @CurrentUser('id') nutritionistId: string,
  ): Promise<MealPlan[]> {
    return this.mealPlanTemplatesService.findAll(nutritionistId);
  }

  @Get('search')
  @ApiOperation({ 
    summary: 'Search templates with advanced filters',
    description: 'Filter templates by category, tags, calories, search term, and public/private status'
  })
  @ApiQuery({ name: 'category', required: false, example: 'emagrecimento' })
  @ApiQuery({ name: 'tags', required: false, example: 'lowcarb,ativo' })
  @ApiQuery({ name: 'search', required: false, example: 'low carb' })
  @ApiQuery({ name: 'isPublic', required: false, type: Boolean })
  @ApiQuery({ name: 'minCalories', required: false, type: Number })
  @ApiQuery({ name: 'maxCalories', required: false, type: Number })
  @ApiResponse({ status: 200, type: [MealPlan] })
  async searchTemplates(
    @Query() filters: TemplateFiltersDto,
    @CurrentUser('id') nutritionistId: string,
  ): Promise<MealPlan[]> {
    return this.mealPlanTemplatesService.searchTemplates(filters, nutritionistId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a meal plan template by ID' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({ status: 200, type: MealPlan })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') nutritionistId: string,
  ): Promise<MealPlan> {
    return this.mealPlanTemplatesService.findOne(id, nutritionistId);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update a meal plan template metadata',
    description: 'Update template name, description, tags, category, etc. Only template owner can update.'
  })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiBody({ type: SaveAsTemplateDto })
  @ApiResponse({ status: 200, type: MealPlan })
  @ApiResponse({ status: 404, description: 'Template not found or not owned by user' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateData: Partial<SaveAsTemplateDto>,
    @CurrentUser('id') nutritionistId: string,
  ): Promise<MealPlan> {
    return this.mealPlanTemplatesService.update(id, updateData, nutritionistId);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete a meal plan template',
    description: 'Remove a template permanently. Only template owner can delete.'
  })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({ status: 204, description: 'Template deleted successfully' })
  @ApiResponse({ status: 404, description: 'Template not found or not owned by user' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') nutritionistId: string,
  ): Promise<void> {
    await this.mealPlanTemplatesService.remove(id, nutritionistId);
  }

  @Post(':id/create-plan/:patientId')
  @ApiOperation({ 
    summary: 'Create a meal plan from a template',
    description: 'Generate a new meal plan for a patient using a template with optional customization. Increments template usage count.'
  })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiParam({ name: 'patientId', description: 'Patient ID' })
  @ApiBody({ 
    type: CreatePlanFromTemplateDto, 
    required: false,
    description: 'Optional customization data for the new meal plan'
  })
  @ApiResponse({ status: 201, type: MealPlan })
  @ApiResponse({ status: 404, description: 'Template or patient not found' })
  async createPlanFromTemplate(
    @Param('id', ParseUUIDPipe) templateId: string,
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @CurrentUser('id') nutritionistId: string,
    @Body() customData?: CreatePlanFromTemplateDto,
  ): Promise<MealPlan> {
    return this.mealPlanTemplatesService.createMealPlanFromTemplate(
      templateId,
      patientId,
      nutritionistId,
      customData,
    );
  }
}
