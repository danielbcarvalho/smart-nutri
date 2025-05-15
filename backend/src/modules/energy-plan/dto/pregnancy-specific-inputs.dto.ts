import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsNumber,
  IsString,
  IsDateString,
  Min,
  Max,
} from 'class-validator';

export class PregnancySpecificInputsDto {
  @ApiProperty({
    description: 'Idade gestacional em semanas',
    example: 20,
    minimum: 0,
    maximum: 42,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(42)
  gestational_age_weeks?: number;

  @ApiProperty({
    description: 'Estado nutricional pré-gestacional',
    example: 'normal',
  })
  @IsOptional()
  @IsString()
  pre_pregnancy_nutritional_status?: string;

  @ApiProperty({
    description: 'Data prevista do parto',
    example: '2024-12-25',
  })
  @IsOptional()
  @IsDateString()
  due_date_or_delivery_date?: string;
}
