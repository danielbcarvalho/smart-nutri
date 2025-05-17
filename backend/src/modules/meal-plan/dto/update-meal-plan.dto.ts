import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsDate,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  ValidateIf,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateMealDto } from './create-meal.dto';
import { IsAfterStartDate } from '../validators/date-range.validator';

export class UpdateMealPlanDto {
  @ApiProperty({
    description: 'Nome do plano alimentar',
    example: 'Plano Semanal',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({
    description: 'Data de início do plano',
    example: '2025-04-05',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @ApiProperty({
    description: 'Data de término do plano',
    example: '2025-04-12',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @ValidateIf((o: UpdateMealPlanDto) => o.startDate !== undefined)
  @IsAfterStartDate({
    message: 'A data final não pode ser anterior à data inicial',
  })
  endDate?: Date;

  @ApiProperty({
    description: 'Observações sobre o plano',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'ID do plano energético de referência',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4')
  energyPlanId?: string;

  @ApiProperty({
    description: 'Lista de refeições do plano',
    type: [CreateMealDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMealDto)
  meals?: CreateMealDto[];
}
