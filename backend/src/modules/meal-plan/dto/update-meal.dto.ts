import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateMealFoodDto } from './create-meal-food.dto';

export class UpdateMealDto {
  @ApiPropertyOptional({ description: 'Nome da refeição', example: 'Almoço' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Horário da refeição', example: '12:00' })
  @IsOptional()
  @IsString()
  time?: string;

  @ApiPropertyOptional({
    description: 'Observações da refeição',
    example: 'Sem sal',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Lista de alimentos da refeição',
    type: [CreateMealFoodDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMealFoodDto)
  mealFoods?: CreateMealFoodDto[];
}
