import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  Matches,
  IsArray,
  ValidateNested,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateMealFoodDto } from './create-meal-food.dto';

export class CreateMealDto {
  @ApiProperty({
    description: 'Nome da refeição',
    example: 'Café da manhã',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Horário da refeição',
    example: '08:00',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'O horário deve estar no formato HH:mm (ex: 08:00)',
  })
  time: string;

  @ApiProperty({
    description: 'Observações sobre a refeição',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Indica se a refeição deve ser contabilizada nos cálculos',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActiveForCalculation?: boolean;

  @ApiProperty({
    description: 'Lista de alimentos da refeição',
    type: [CreateMealFoodDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMealFoodDto)
  mealFoods: CreateMealFoodDto[];
}
