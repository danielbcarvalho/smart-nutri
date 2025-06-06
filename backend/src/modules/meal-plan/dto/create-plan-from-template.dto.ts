import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlanFromTemplateDto {
  @ApiProperty({
    description: 'Custom name for the meal plan',
    example: 'Plano Hipertrofia - João',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Custom description/objective for the meal plan',
    example: 'Plano focado em ganho de massa muscular',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Custom start date for the meal plan',
    example: '2024-01-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Custom end date for the meal plan',
    example: '2024-02-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}