import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../enums/gender.enum';
import { EnergyFormula } from '../enums/energy-formulas.enum';
import { ActivityFactor } from '../enums/activity-factors.enum';
import { InjuryFactor } from '../enums/injury-factors.enum';
import { MetDetailDto } from './met-detail.dto';
import { WeightGoalDetailDto } from './weight-goal-detail.dto';
import { PregnancySpecificInputsDto } from './pregnancy-specific-inputs.dto';

export class EnergyPlanResponseDto {
  @ApiProperty({
    description: 'ID do plano energético',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nome do plano energético',
    example: 'Plano de Treino',
  })
  name: string;

  @ApiProperty({
    description: 'ID do paciente',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  patientId: string;

  @ApiProperty({
    description: 'ID do nutricionista',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  nutritionistId: string;

  @ApiProperty({
    description: 'ID da consulta (opcional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  consultationId?: string;

  @ApiProperty({
    description: 'Data do cálculo',
    example: '2024-03-20',
  })
  calculationDate: string;

  @ApiProperty({
    description: 'Peso no momento do cálculo (kg)',
    example: 70.5,
  })
  weightAtCalculationKg: number;

  @ApiProperty({
    description: 'Altura no momento do cálculo (cm)',
    example: 170.5,
  })
  heightAtCalculationCm: number;

  @ApiProperty({
    description: 'Massa magra no momento do cálculo (kg)',
    example: 55.2,
    required: false,
  })
  fatFreeMassAtCalculationKg?: number;

  @ApiProperty({
    description: 'Idade no momento do cálculo (anos)',
    example: 30,
  })
  ageAtCalculationYears: number;

  @ApiProperty({
    description: 'Gênero no momento do cálculo',
    enum: Gender,
    example: Gender.MALE,
  })
  genderAtCalculation: Gender;

  @ApiProperty({
    description: 'Fórmula utilizada para cálculo',
    enum: EnergyFormula,
    example: EnergyFormula.HARRIS_BENEDICT_1984,
  })
  formulaKey: EnergyFormula;

  @ApiProperty({
    description: 'Fator de atividade física',
    enum: ActivityFactor,
    example: ActivityFactor.MODERATE,
    required: false,
  })
  activityFactorKey?: ActivityFactor;

  @ApiProperty({
    description: 'Fator de lesão',
    enum: InjuryFactor,
    example: InjuryFactor.MILD,
    required: false,
  })
  injuryFactorKey?: InjuryFactor;

  @ApiProperty({
    description: 'Detalhes adicionais de MET',
    type: [MetDetailDto],
    required: false,
  })
  additionalMetDetails?: MetDetailDto[];

  @ApiProperty({
    description: 'Total de kcal de MET adicionais',
    example: 150.5,
    required: false,
  })
  additionalMetTotalKcal?: number;

  @ApiProperty({
    description: 'Detalhes do objetivo de peso',
    type: WeightGoalDetailDto,
    required: false,
  })
  weightGoalDetails?: WeightGoalDetailDto;

  @ApiProperty({
    description: 'Calorias adicionais para gestação',
    example: 300,
    required: false,
  })
  additionalPregnancyKcal?: number;

  @ApiProperty({
    description: 'Inputs específicos para gestação',
    type: PregnancySpecificInputsDto,
    required: false,
  })
  pregnancySpecificInputs?: PregnancySpecificInputsDto;

  @ApiProperty({
    description: 'Input personalizado de TMB',
    example: 1500,
    required: false,
  })
  customTmbKcalInput?: number;

  @ApiProperty({
    description: 'Input personalizado de GET',
    example: 2500,
    required: false,
  })
  customGetKcalInput?: number;

  @ApiProperty({
    description: 'TMB calculado',
    example: 1500,
    required: false,
  })
  calculatedTmbKcal?: number;

  @ApiProperty({
    description: 'GET calculado',
    example: 2500,
  })
  calculatedGetKcal: number;

  @ApiProperty({
    description: 'Data de criação',
    example: '2024-03-20T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2024-03-20T10:00:00Z',
  })
  updatedAt: Date;
}
