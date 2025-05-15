import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class QueryEnergyPlanDto {
  @ApiProperty({
    description: 'ID do paciente',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @ApiProperty({
    description: 'ID do nutricionista',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  nutritionistId?: string;

  @ApiProperty({
    description: 'ID da consulta',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  consultationId?: string;

  @ApiProperty({
    description: 'Nome do plano energético',
    example: 'Plano de Treino',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;
}
