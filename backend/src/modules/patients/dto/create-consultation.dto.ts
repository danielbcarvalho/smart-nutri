import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ConsultationStatus,
  ConsultationType,
} from '../entities/consultation.entity';

export class CreateConsultationDto {
  @ApiProperty({
    description: 'Data da consulta',
    example: '2024-04-15T14:00:00Z',
  })
  @IsNotEmpty({ message: 'A data da consulta é obrigatória' })
  @IsDate({ message: 'A data da consulta deve ser uma data válida' })
  @Type(() => Date)
  date: Date;

  @ApiProperty({
    description: 'ID do paciente',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'O ID do paciente é obrigatório' })
  @IsUUID('4', { message: 'O ID do paciente deve ser um UUID válido' })
  patientId: string;

  @ApiProperty({
    description: 'Anotações da consulta',
    example:
      'Paciente relatou melhora nos sintomas digestivos após ajustes na dieta.',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'As anotações devem ser um texto' })
  notes?: string;

  @ApiProperty({
    description: 'Status da consulta',
    enum: ConsultationStatus,
    example: ConsultationStatus.SCHEDULED,
    default: ConsultationStatus.SCHEDULED,
  })
  @IsOptional()
  @IsEnum(ConsultationStatus, {
    message: 'O status deve ser um dos valores válidos',
  })
  status?: ConsultationStatus;

  @ApiProperty({
    description: 'Tipo da consulta',
    enum: ConsultationType,
    example: ConsultationType.FOLLOW_UP,
    default: ConsultationType.FOLLOW_UP,
  })
  @IsOptional()
  @IsEnum(ConsultationType, {
    message: 'O tipo deve ser um dos valores válidos',
  })
  type?: ConsultationType;
}
