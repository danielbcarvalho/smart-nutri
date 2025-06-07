import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiMealPlansService } from './ai-meal-plans.service';

import {
  AiMealPlanRequestDto,
  AiMealPlanResponseDto,
  AiPatientDataDto,
} from './dto';

@ApiTags('AI Meal Plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai-meal-plans')
export class AiMealPlansController {
  private readonly logger = new Logger(AiMealPlansController.name);

  constructor(private readonly aiMealPlansService: AiMealPlansService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate AI meal plan',
    description: 'Generate a personalized meal plan using AI based on patient data and configuration',
  })
  @ApiBody({ type: AiMealPlanRequestDto })
  @ApiResponse({
    status: 200,
    description: 'AI meal plan generated successfully',
    type: AiMealPlanResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data or AI service unavailable',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  async generateMealPlan(
    @Body() request: AiMealPlanRequestDto,
    @Request() req: any,
  ): Promise<AiMealPlanResponseDto> {
    this.logger.log(`AI meal plan generation requested for patient: ${request.patientId}`);
    
    const nutritionistId = req.user?.id;
    if (!nutritionistId) {
      throw new BadRequestException('Nutritionist ID not found in token');
    }

    try {
      const result = await this.aiMealPlansService.generateAiMealPlan(request, nutritionistId);
      
      this.logger.log(`AI meal plan generated successfully for patient: ${request.patientId}`);
      return result;
    } catch (error) {
      this.logger.error(`AI meal plan generation failed:`, error.message);
      throw error;
    }
  }

  @Get('patient-data/:patientId')
  @ApiOperation({
    summary: 'Get aggregated patient data for AI',
    description: 'Retrieve comprehensive patient data needed for AI meal plan generation',
  })
  @ApiParam({
    name: 'patientId',
    description: 'Patient ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Patient data retrieved successfully',
    type: AiPatientDataDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Patient not found',
  })
  async getPatientDataForAi(
    @Param('patientId') patientId: string,
  ): Promise<AiPatientDataDto> {
    this.logger.log(`Patient data requested for AI: ${patientId}`);
    
    try {
      const result = await this.aiMealPlansService.getPatientDataForAi(patientId);
      
      this.logger.log(`Patient data retrieved successfully: ${patientId}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to retrieve patient data:`, error.message);
      throw error;
    }
  }

  @Post('save')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Save AI-generated meal plan',
    description: 'Save an AI-generated meal plan to the database as a regular meal plan',
  })
  @ApiResponse({
    status: 201,
    description: 'AI meal plan saved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid meal plan data',
  })
  async saveMealPlan(
    @Body() body: {
      aiResponse: AiMealPlanResponseDto;
      patientId: string;
    },
    @Request() req: any,
  ): Promise<{ id: string; message: string }> {
    this.logger.log(`Saving AI meal plan for patient: ${body.patientId}`);
    
    const nutritionistId = req.user?.userId;
    if (!nutritionistId) {
      throw new BadRequestException('Nutritionist ID not found in token');
    }

    try {
      const savedPlan = await this.aiMealPlansService.saveMealPlan(
        body.aiResponse,
        body.patientId,
        nutritionistId,
      );
      
      this.logger.log(`AI meal plan saved successfully: ${savedPlan.id}`);
      return {
        id: savedPlan.id,
        message: 'AI meal plan saved successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to save AI meal plan:`, error.message);
      throw error;
    }
  }

  @Post('food-matching')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Match foods with database',
    description: 'Match AI-suggested foods with the TBCA food database',
  })
  @ApiResponse({
    status: 200,
    description: 'Food matching completed',
  })
  async matchFoods(
    @Body() body: { foods: string[] },
  ): Promise<any> {
    this.logger.log(`Food matching requested for ${body.foods?.length || 0} foods`);
    
    if (!body.foods || !Array.isArray(body.foods)) {
      throw new BadRequestException('Foods array is required');
    }

    try {
      const result = await this.aiMealPlansService.batchFoodMatching(body.foods);
      
      this.logger.log(`Food matching completed for ${body.foods.length} foods`);
      return result;
    } catch (error) {
      this.logger.error(`Food matching failed:`, error.message);
      throw error;
    }
  }

  @Get('status')
  @ApiOperation({
    summary: 'Get AI service status',
    description: 'Check the availability and configuration of AI services',
  })
  @ApiResponse({
    status: 200,
    description: 'AI service status retrieved',
  })
  async getAiStatus(): Promise<{
    isEnabled: boolean;
    isAvailable: boolean;
    provider: string;
    foodDatabaseSize: number;
  }> {
    this.logger.log('AI service status requested');
    
    try {
      const status = await this.aiMealPlansService.getAiGenerationStatus();
      
      this.logger.log(`AI service status: ${JSON.stringify(status)}`);
      return status;
    } catch (error) {
      this.logger.error(`Failed to get AI status:`, error.message);
      throw error;
    }
  }
}