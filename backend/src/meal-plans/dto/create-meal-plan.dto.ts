import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsDate,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsUUID,
  MinDate,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMealFoodDto {
  @ApiProperty({
    description: 'ID do alimento',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  foodId: string;

  @ApiProperty({
    description: 'Quantidade do alimento',
    example: 100,
  })
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'Unidade de medida',
    example: 'g',
  })
  @IsString()
  unit: string;
}

export class CreateMealDto {
  @ApiProperty({
    description: 'Nome da refeição',
    example: 'Café da manhã',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Horário da refeição',
    example: '08:00',
  })
  @IsString()
  time: string;

  @ApiProperty({
    description: 'Observações sobre a refeição',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Lista de alimentos da refeição',
    type: [CreateMealFoodDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMealFoodDto)
  mealFoods: CreateMealFoodDto[];
}

export class CreateMealPlanDto {
  @ApiProperty({
    description: 'Nome do plano alimentar',
    example: 'Plano Alimentar Semanal',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Observações sobre o plano alimentar',
    example: 'Plano alimentar para perda de peso',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'Data de início do plano',
    example: '2024-03-20',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description: 'Data de término do plano',
    example: '2024-03-27',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({
    description: 'ID do paciente',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID('4')
  patientId: string;

  @ApiProperty({
    description: 'ID do nutricionista responsável',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID('4')
  nutritionistId: string;

  @ApiProperty({
    description: 'Lista de refeições do plano',
    type: [CreateMealDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMealDto)
  meals: CreateMealDto[];
}
