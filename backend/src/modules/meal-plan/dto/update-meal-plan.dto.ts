import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsDate,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  ValidateIf,
  IsUUID,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateMealDto } from './create-meal.dto';
import { IsAfterStartDate } from '../validators/date-range.validator';

export class UpdateMealDto extends CreateMealDto {
  @ApiProperty({ description: 'ID da refeição' })
  @IsUUID()
  id: string;
}

export class UpdateMealPlanDto {
  @ApiPropertyOptional({ description: 'Nome do plano alimentar' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ description: 'Data de início do plano' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional({ description: 'Data de término do plano' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @ValidateIf((o: UpdateMealPlanDto) => o.startDate !== undefined)
  @IsAfterStartDate({
    message: 'A data final não pode ser anterior à data inicial',
  })
  endDate?: Date;

  @ApiPropertyOptional({ description: 'Descrição do plano alimentar' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'ID do plano energético' })
  @IsOptional()
  @IsUUID()
  energyPlanId?: string;

  @ApiPropertyOptional({
    description: 'Calorias diárias',
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  dailyCalories?: number;

  @ApiPropertyOptional({
    description: 'Proteína diária (g)',
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  dailyProtein?: number;

  @ApiPropertyOptional({
    description: 'Carboidratos diários (g)',
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  dailyCarbs?: number;

  @ApiPropertyOptional({
    description: 'Gorduras diárias (g)',
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  dailyFat?: number;

  @ApiPropertyOptional({
    description: 'Lista de refeições do plano',
    type: [UpdateMealDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateMealDto)
  meals?: UpdateMealDto[];
}
