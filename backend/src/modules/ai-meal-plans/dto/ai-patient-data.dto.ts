import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AiPatientBasicDto {
  @ApiProperty({ description: 'Patient ID' })
  id: string;

  @ApiProperty({ description: 'Patient name' })
  name: string;

  @ApiProperty({ description: 'Patient email' })
  email: string;

  @ApiProperty({ description: 'Birth date' })
  birthDate: string;

  @ApiProperty({ description: 'Gender (M/F)' })
  gender: string;


  @ApiPropertyOptional({ description: 'Phone number' })
  phone?: string;
}

export class AiMeasurementDto {
  @ApiProperty({ description: 'Measurement ID' })
  id: string;

  @ApiProperty({ description: 'Weight in kg' })
  weight: number;

  @ApiProperty({ description: 'Height in meters' })
  height: number;

  @ApiPropertyOptional({ description: 'Body fat percentage' })
  bodyFat?: number;

  @ApiPropertyOptional({ description: 'Muscle mass in kg' })
  muscleMass?: number;

  @ApiProperty({ description: 'Measurement date' })
  measureDate: string;

  @ApiPropertyOptional({ type: Object, description: 'Body measurements' })
  measurements?: Record<string, number>;
}

export class AiEnergyPlanDto {
  @ApiProperty({ description: 'Energy plan ID' })
  id: string;

  @ApiProperty({ description: 'Basal Metabolic Rate' })
  bmr: number;

  @ApiProperty({ description: 'Total Energy Expenditure' })
  tee: number;

  @ApiProperty({ description: 'Plan objective' })
  objective: string;

  @ApiProperty({ description: 'Formula used for calculation' })
  formula: string;

  @ApiProperty({ description: 'Activity factor applied' })
  activityFactor: number;

  @ApiProperty({ description: 'Creation date' })
  createdAt: string;
}

export class AiMealPlanHistoryDto {
  @ApiProperty({ description: 'Meal plan ID' })
  id: string;

  @ApiProperty({ description: 'Meal plan title' })
  title: string;

  @ApiProperty({ description: 'Meal plan description' })
  description: string;

  @ApiProperty({ description: 'Start date' })
  startDate: string;

  @ApiProperty({ description: 'End date' })
  endDate: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: string;
}

export class AiPhotoDto {
  @ApiProperty({ description: 'Photo ID' })
  id: string;

  @ApiProperty({ description: 'Photo type (front, back, left, right)' })
  type: string;

  @ApiProperty({ description: 'Photo URL' })
  url: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: string;
}

export class AiPatientDataDto {
  @ApiProperty({ type: AiPatientBasicDto, description: 'Basic patient information' })
  patient: AiPatientBasicDto;

  @ApiPropertyOptional({ type: AiMeasurementDto, description: 'Latest measurement data' })
  latestMeasurement?: AiMeasurementDto;

  @ApiPropertyOptional({ type: AiEnergyPlanDto, description: 'Current energy plan' })
  energyPlan?: AiEnergyPlanDto;

  @ApiPropertyOptional({ type: [AiMealPlanHistoryDto], description: 'Previous meal plans' })
  previousMealPlans?: AiMealPlanHistoryDto[];

  @ApiPropertyOptional({ type: [AiPhotoDto], description: 'Progress photos' })
  progressPhotos?: AiPhotoDto[];
}