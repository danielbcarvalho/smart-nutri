import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsDateString,
  IsNumber,
  Min,
  Max,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '../enums/gender.enum';
import { EnergyFormula } from '../enums/energy-formulas.enum';
import { ActivityFactor } from '../enums/activity-factors.enum';
import { InjuryFactor } from '../enums/injury-factors.enum';
import { MetDetailDto } from './met-detail.dto';
import { WeightGoalDetailDto } from './weight-goal-detail.dto';
import { PregnancySpecificInputsDto } from './pregnancy-specific-inputs.dto';

export class CreateEnergyPlanDto {
  @ApiProperty({
    description: 'Nome do plano energético',
    example: 'Plano de Treino',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'ID do paciente',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  patientId: string;

  @ApiProperty({
    description: 'ID do nutricionista',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  nutritionistId: string;

  @ApiProperty({
    description: 'ID da consulta (opcional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  consultationId?: string;

  @ApiProperty({
    description: 'Peso no momento do cálculo (kg)',
    example: 70.5,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  weightAtCalculationKg: number;

  @ApiProperty({
    description: 'Altura no momento do cálculo (cm)',
    example: 170.5,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  heightAtCalculationCm: number;

  @ApiProperty({
    description: 'Massa magra no momento do cálculo (kg)',
    example: 55.2,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fatFreeMassAtCalculationKg?: number;

  @ApiProperty({
    description: 'Idade no momento do cálculo (anos)',
    example: 30,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  ageAtCalculationYears: number;

  @ApiProperty({
    description: 'Gênero no momento do cálculo',
    enum: Gender,
    example: Gender.MALE,
  })
  @IsNotEmpty()
  @IsEnum(Gender)
  genderAtCalculation: Gender;

  @ApiProperty({
    description: 'Fórmula utilizada para cálculo',
    enum: EnergyFormula,
    example: EnergyFormula.HARRIS_BENEDICT_1984,
  })
  @IsNotEmpty()
  @IsEnum(EnergyFormula)
  formulaKey: EnergyFormula;

  @ApiProperty({
    description: 'Fator de atividade física',
    enum: ActivityFactor,
    example: ActivityFactor.MODERATE,
    required: false,
  })
  @IsOptional()
  @IsEnum(ActivityFactor)
  activityFactorKey?: ActivityFactor;

  @ApiProperty({
    description: 'Fator de lesão',
    enum: InjuryFactor,
    example: InjuryFactor.MILD,
    required: false,
  })
  @IsOptional()
  @IsEnum(InjuryFactor)
  injuryFactorKey?: InjuryFactor;

  @ApiProperty({
    description: 'Detalhes adicionais de MET',
    type: [MetDetailDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MetDetailDto)
  additionalMetDetails?: MetDetailDto[];

  @ApiProperty({
    description: 'Total de kcal de MET adicionais',
    example: 150.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  additionalMetTotalKcal?: number;

  @ApiProperty({
    description: 'Detalhes do objetivo de peso',
    type: WeightGoalDetailDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => WeightGoalDetailDto)
  weightGoalDetails?: WeightGoalDetailDto;

  @ApiProperty({
    description: 'Calorias adicionais para gestação',
    example: 300,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  additionalPregnancyKcal?: number;

  @ApiProperty({
    description: 'Inputs específicos para gestação',
    type: PregnancySpecificInputsDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PregnancySpecificInputsDto)
  pregnancySpecificInputs?: PregnancySpecificInputsDto;

  @ApiProperty({
    description: 'Input personalizado de TMB',
    example: 1500,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  customTmbKcalInput?: number;

  @ApiProperty({
    description: 'Input personalizado de GET',
    example: 2500,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  customGetKcalInput?: number;

  @ApiProperty({
    description: 'TMB calculado',
    example: 1500,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  calculatedTmbKcal?: number;

  @ApiProperty({
    description: 'GET calculado',
    example: 2500,
  })
  @IsNotEmpty()
  @IsNumber()
  calculatedGetKcal: number;

  @ApiProperty({
    description: 'Distribuição dos macronutrientes',
    example: { proteins: 20, carbs: 50, fats: 30 },
    required: false,
  })
  @IsOptional()
  macronutrientDistribution?: {
    proteins: number;
    carbs: number;
    fats: number;
  };

  @ApiProperty({
    description: 'Variação de peso desejada (kg)',
    required: false,
  })
  @IsOptional()
  goalWeightChangeKg?: number;

  @ApiProperty({ description: 'Dias para atingir a meta', required: false })
  @IsOptional()
  goalDaysToAchieve?: number;

  @ApiProperty({
    description: 'Ajuste calórico estimado para a meta',
    required: false,
  })
  @IsOptional()
  calculatedGoalKcalAdjustment?: number;
}
