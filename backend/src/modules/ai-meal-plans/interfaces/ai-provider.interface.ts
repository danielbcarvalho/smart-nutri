import { AiPatientDataDto } from '../dto/ai-patient-data.dto';
import { AiConfigurationDto } from '../dto/ai-meal-plan-request.dto';
import { AiMealPlanResponseDto } from '../dto/ai-meal-plan-response.dto';

export interface AiProviderInterface {
  /**
   * Generate a meal plan using AI based on patient data and configuration
   */
  generateMealPlan(
    patientData: AiPatientDataDto,
    configuration: AiConfigurationDto,
    foodDatabase: any[],
  ): Promise<AiMealPlanResponseDto>;

  /**
   * Get the provider name
   */
  getProviderName(): string;

  /**
   * Check if the provider is available/configured
   */
  isAvailable(): boolean;
}

export interface AiGenerationContext {
  patientData: AiPatientDataDto;
  configuration: AiConfigurationDto;
  foodDatabase: any[];
  nutritionistId: string;
  generationId: string;
}

export interface AiGenerationResult {
  success: boolean;
  data?: AiMealPlanResponseDto;
  error?: string;
  provider: string;
  generationTime: number;
  tokensUsed?: number;
}