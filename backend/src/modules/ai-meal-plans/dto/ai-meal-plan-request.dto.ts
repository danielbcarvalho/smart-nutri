import { IsString, IsArray, IsNumber, IsOptional, IsEnum, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AiObjective {
  WEIGHT_LOSS = 'weight_loss',
  MUSCLE_GAIN = 'muscle_gain',
  MAINTENANCE = 'maintenance',
  SPORTS_PERFORMANCE = 'sports_performance',
  GENERAL_HEALTH = 'general_health',
}

export enum AiComplexity {
  SIMPLE = 'simple',
  MODERATE = 'moderate',
  ELABORATE = 'elaborate',
}

export enum AiExerciseIntensity {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

export class AiConfigurationDto {
  @ApiProperty({ enum: AiObjective, description: 'Primary objective for the meal plan' })
  @IsEnum(AiObjective)
  objective: AiObjective;

  @ApiPropertyOptional({ description: 'Additional details about the objective' })
  @IsOptional()
  @IsString()
  objectiveDetails?: string;

  @ApiProperty({ type: [String], description: 'List of dietary restrictions' })
  @IsArray()
  @IsString({ each: true })
  restrictions: string[];

  @ApiPropertyOptional({ description: 'Custom dietary restrictions description' })
  @IsOptional()
  @IsString()
  customRestrictions?: string;

  @ApiProperty({ type: [Object], description: 'Foods to avoid' })
  @IsArray()
  avoidedFoods: any[];

  @ApiProperty({ type: [Object], description: 'Preferred foods' })
  @IsArray()
  preferredFoods: any[];

  @ApiProperty({ description: 'Number of meals per day', minimum: 3, maximum: 6 })
  @IsNumber()
  @Min(3)
  @Max(6)
  mealsPerDay: number;

  @ApiPropertyOptional({ description: 'Budget consideration in BRL' })
  @IsOptional()
  @IsString()
  budget?: string;

  @ApiProperty({ enum: AiComplexity, description: 'Recipe complexity level' })
  @IsEnum(AiComplexity)
  complexity: AiComplexity;

  @ApiPropertyOptional({ description: 'Available preparation time' })
  @IsOptional()
  @IsString()
  prepTime?: string;

  @ApiPropertyOptional({ description: 'Exercise routine description' })
  @IsOptional()
  @IsString()
  exerciseRoutine?: string;

  @ApiPropertyOptional({ description: 'Exercise frequency per week' })
  @IsOptional()
  @IsString()
  exerciseFrequency?: string;

  @ApiPropertyOptional({ enum: AiExerciseIntensity, description: 'Exercise intensity level' })
  @IsOptional()
  @IsEnum(AiExerciseIntensity)
  exerciseIntensity?: AiExerciseIntensity;

  @ApiProperty({ type: [String], description: 'Available kitchen equipment' })
  @IsArray()
  @IsString({ each: true })
  kitchenEquipment: string[];

  @ApiPropertyOptional({ description: 'Social context and eating patterns' })
  @IsOptional()
  @IsString()
  socialContext?: string;
}

export class AiMealPlanRequestDto {
  @ApiProperty({ description: 'Patient ID for whom the meal plan is being generated' })
  @IsString()
  patientId: string;

  @ApiProperty({ type: AiConfigurationDto, description: 'AI configuration parameters' })
  @ValidateNested()
  @Type(() => AiConfigurationDto)
  configuration: AiConfigurationDto;
}