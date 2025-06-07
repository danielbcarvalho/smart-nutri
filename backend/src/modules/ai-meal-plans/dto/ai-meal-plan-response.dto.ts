import { ApiProperty } from '@nestjs/swagger';

export class AiGeneratedFoodDto {
  @ApiProperty({ description: 'Food ID from TBCA database' })
  foodId: string;

  @ApiProperty({ description: 'Food name' })
  name: string;

  @ApiProperty({ description: 'Quantity' })
  quantity: number;

  @ApiProperty({ description: 'Unit of measurement' })
  unit: string;

  @ApiProperty({ description: 'Calories per serving' })
  calories: number;

  @ApiProperty({ description: 'Protein content in grams' })
  protein: number;

  @ApiProperty({ description: 'Carbohydrates content in grams' })
  carbohydrates: number;

  @ApiProperty({ description: 'Fat content in grams' })
  fat: number;
}

export class AiGeneratedMealDto {
  @ApiProperty({ description: 'Meal name' })
  name: string;

  @ApiProperty({ description: 'Recommended time' })
  time: string;

  @ApiProperty({ type: [AiGeneratedFoodDto], description: 'Foods in this meal' })
  foods: AiGeneratedFoodDto[];
}

export class AiMealPlanDto {
  @ApiProperty({ description: 'Generated meal plan title' })
  title: string;

  @ApiProperty({ description: 'Meal plan description' })
  description: string;

  @ApiProperty({ description: 'Start date' })
  startDate: string;

  @ApiProperty({ description: 'End date' })
  endDate: string;

  @ApiProperty({ type: [AiGeneratedMealDto], description: 'Generated meals' })
  meals: AiGeneratedMealDto[];
}

export class AiNutritionalSummaryDto {
  @ApiProperty({ description: 'Total daily calories' })
  totalCalories: number;

  @ApiProperty({ description: 'Total protein in grams' })
  protein: number;

  @ApiProperty({ description: 'Total carbohydrates in grams' })
  carbohydrates: number;

  @ApiProperty({ description: 'Total fat in grams' })
  fat: number;
}

export class AiAlternativeDto {
  @ApiProperty({ description: 'Meal name for which alternatives are provided' })
  mealName: string;

  @ApiProperty({ type: [String], description: 'List of alternative foods' })
  alternatives: string[];
}

export class AiReasoningDto {
  @ApiProperty({ description: 'Full prompt sent to AI' })
  prompt: string;

  @ApiProperty({ description: 'Raw AI response' })
  rawResponse: string;

  @ApiProperty({ description: 'Tokens used in the request' })
  tokensUsed?: number;

  @ApiProperty({ description: 'AI model used' })
  model: string;

  @ApiProperty({ description: 'Provider used (openrouter, claude, etc.)' })
  provider: string;

  @ApiProperty({ description: 'Generation time in milliseconds' })
  generationTime: number;

  @ApiProperty({ description: 'API response metadata' })
  metadata?: any;
}

export class AiMealPlanResponseDto {
  @ApiProperty({ description: 'Unique identifier for this AI generation' })
  id: string;

  @ApiProperty({ type: AiMealPlanDto, description: 'Generated meal plan' })
  mealPlan: AiMealPlanDto;

  @ApiProperty({ type: AiNutritionalSummaryDto, description: 'Nutritional summary' })
  nutritionalSummary: AiNutritionalSummaryDto;

  @ApiProperty({ type: [AiAlternativeDto], description: 'Alternative food suggestions' })
  alternatives: AiAlternativeDto[];

  @ApiProperty({ type: [String], description: 'General notes and recommendations' })
  notes: string[];

  @ApiProperty({ type: [String], description: 'AI insights and rationale' })
  aiInsights: string[];

  @ApiProperty({ description: 'Generation timestamp' })
  generatedAt: Date;

  @ApiProperty({ type: AiReasoningDto, description: 'AI reasoning and technical details' })
  reasoning?: AiReasoningDto;
}