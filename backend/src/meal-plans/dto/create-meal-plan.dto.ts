import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsDate,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsUUID,
  MinDate,
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
    description: 'ID do paciente',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({
    description: 'Nome do plano alimentar',
    example: 'Plano Semanal',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Data de início do plano',
    example: '2025-04-05',
  })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    description: 'Data de término do plano',
    example: '2025-04-12',
  })
  @IsDate()
  @Type(() => Date)
  @MinDate(() => new Date(), {
    message: 'A data final não pode ser anterior à data inicial',
  })
  endDate: Date;

  @ApiProperty({
    description: 'Observações sobre o plano',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Lista de refeições do plano',
    type: [CreateMealDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMealDto)
  meals: CreateMealDto[];
}
