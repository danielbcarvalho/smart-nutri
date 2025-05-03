import {
  IsDate,
  IsNumber,
  IsObject,
  IsOptional,
  Min,
  Max,
  ValidateNested,
  IsNotEmpty,
  IsDateString,
  IsUUID,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BodyMeasurements {
  @ApiProperty({
    description: 'Medida do peito em centímetros',
    example: 95,
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'A medida do peito deve ser um número' })
  @Min(30, { message: 'Medida mínima do peito: 30cm' })
  @Max(200, { message: 'Medida máxima do peito: 200cm' })
  chest?: number;

  @ApiProperty({
    description: 'Medida da cintura em centímetros',
    example: 80,
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'A medida da cintura deve ser um número' })
  @Min(30, { message: 'Medida mínima da cintura: 30cm' })
  @Max(200, { message: 'Medida máxima da cintura: 200cm' })
  waist?: number;

  @ApiProperty({
    description: 'Medida do quadril em centímetros',
    example: 100,
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'A medida do quadril deve ser um número' })
  @Min(30, { message: 'Medida mínima do quadril: 30cm' })
  @Max(200, { message: 'Medida máxima do quadril: 200cm' })
  hip?: number;

  @ApiProperty({
    description: 'Medida do braço em centímetros',
    example: 32,
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'A medida do braço deve ser um número' })
  @Min(10, { message: 'Medida mínima do braço: 10cm' })
  @Max(100, { message: 'Medida máxima do braço: 100cm' })
  arm?: number;

  @ApiProperty({
    description: 'Medida da coxa em centímetros',
    example: 55,
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'A medida da coxa deve ser um número' })
  @Min(20, { message: 'Medida mínima da coxa: 20cm' })
  @Max(100, { message: 'Medida máxima da coxa: 100cm' })
  thigh?: number;

  // Medidas adicionais
  @ApiPropertyOptional({
    description: 'Medida do pescoço em centímetros',
    example: 38,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'A medida do pescoço deve ser um número' })
  neck?: number;

  @ApiPropertyOptional({
    description: 'Medida do ombro em centímetros',
    example: 110,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'A medida do ombro deve ser um número' })
  shoulder?: number;

  @ApiPropertyOptional({
    description: 'Medida do abdômen em centímetros',
    example: 90,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'A medida do abdômen deve ser um número' })
  abdomen?: number;

  @ApiPropertyOptional({
    description: 'Medida do braço relaxado em centímetros',
    example: 30,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'A medida do braço relaxado deve ser um número' })
  relaxedArm?: number;

  @ApiPropertyOptional({
    description: 'Medida do braço contraído em centímetros',
    example: 33,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'A medida do braço contraído deve ser um número' })
  contractedArm?: number;

  @ApiPropertyOptional({
    description: 'Medida do antebraço em centímetros',
    example: 28,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'A medida do antebraço deve ser um número' })
  forearm?: number;

  @ApiPropertyOptional({
    description: 'Medida da coxa proximal em centímetros',
    example: 58,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'A medida da coxa proximal deve ser um número' })
  proximalThigh?: number;

  @ApiPropertyOptional({
    description: 'Medida da coxa medial em centímetros',
    example: 50,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'A medida da coxa medial deve ser um número' })
  medialThigh?: number;

  @ApiPropertyOptional({
    description: 'Medida da coxa distal em centímetros',
    example: 40,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'A medida da coxa distal deve ser um número' })
  distalThigh?: number;

  @ApiPropertyOptional({
    description: 'Medida da coxa distal esquerda em centímetros',
    example: 40,
    type: Number,
  })
  @IsOptional()
  @IsNumber(
    {},
    { message: 'A medida da coxa distal esquerda deve ser um número' },
  )
  distalThighLeft?: number;

  @ApiPropertyOptional({
    description: 'Medida da coxa distal direita em centímetros',
    example: 40,
    type: Number,
  })
  @IsOptional()
  @IsNumber(
    {},
    { message: 'A medida da coxa distal direita deve ser um número' },
  )
  distalThighRight?: number;

  @ApiPropertyOptional({
    description: 'Medida da panturrilha em centímetros',
    example: 38,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'A medida da panturrilha deve ser um número' })
  calf?: number;

  @ApiPropertyOptional({
    description: 'Medida do braço relaxado esquerdo em centímetros',
    example: 30,
    type: Number,
  })
  @IsOptional()
  @IsNumber(
    {},
    { message: 'A medida do braço relaxado esquerdo deve ser um número' },
  )
  relaxedArmLeft?: number;

  @ApiPropertyOptional({
    description: 'Medida do braço relaxado direito em centímetros',
    example: 30,
    type: Number,
  })
  @IsOptional()
  @IsNumber(
    {},
    { message: 'A medida do braço relaxado direito deve ser um número' },
  )
  relaxedArmRight?: number;

  @ApiPropertyOptional({
    description: 'Medida do braço contraído esquerdo em centímetros',
    example: 33,
    type: Number,
  })
  @IsOptional()
  @IsNumber(
    {},
    { message: 'A medida do braço contraído esquerdo deve ser um número' },
  )
  contractedArmLeft?: number;

  @ApiPropertyOptional({
    description: 'Medida do braço contraído direito em centímetros',
    example: 33,
    type: Number,
  })
  @IsOptional()
  @IsNumber(
    {},
    { message: 'A medida do braço contraído direito deve ser um número' },
  )
  contractedArmRight?: number;

  @ApiPropertyOptional({
    description: 'Medida do antebraço esquerdo em centímetros',
    example: 28,
    type: Number,
  })
  @IsOptional()
  @IsNumber(
    {},
    { message: 'A medida do antebraço esquerdo deve ser um número' },
  )
  forearmLeft?: number;

  @ApiPropertyOptional({
    description: 'Medida do antebraço direito em centímetros',
    example: 28,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'A medida do antebraço direito deve ser um número' })
  forearmRight?: number;

  @ApiPropertyOptional({
    description: 'Medida da coxa proximal esquerda em centímetros',
    example: 58,
    type: Number,
  })
  @IsOptional()
  @IsNumber(
    {},
    { message: 'A medida da coxa proximal esquerda deve ser um número' },
  )
  proximalThighLeft?: number;

  @ApiPropertyOptional({
    description: 'Medida da coxa proximal direita em centímetros',
    example: 58,
    type: Number,
  })
  @IsOptional()
  @IsNumber(
    {},
    { message: 'A medida da coxa proximal direita deve ser um número' },
  )
  proximalThighRight?: number;

  @ApiPropertyOptional({
    description: 'Medida da coxa medial esquerda em centímetros',
    example: 50,
    type: Number,
  })
  @IsOptional()
  @IsNumber(
    {},
    { message: 'A medida da coxa medial esquerda deve ser um número' },
  )
  medialThighLeft?: number;

  @ApiPropertyOptional({
    description: 'Medida da coxa medial direita em centímetros',
    example: 50,
    type: Number,
  })
  @IsOptional()
  @IsNumber(
    {},
    { message: 'A medida da coxa medial direita deve ser um número' },
  )
  medialThighRight?: number;

  @ApiPropertyOptional({
    description: 'Medida da panturrilha esquerda em centímetros',
    example: 38,
    type: Number,
  })
  @IsOptional()
  @IsNumber(
    {},
    { message: 'A medida da panturrilha esquerda deve ser um número' },
  )
  calfLeft?: number;

  @ApiPropertyOptional({
    description: 'Medida da panturrilha direita em centímetros',
    example: 38,
    type: Number,
  })
  @IsOptional()
  @IsNumber(
    {},
    { message: 'A medida da panturrilha direita deve ser um número' },
  )
  calfRight?: number;
}

export class Skinfolds {
  @ApiPropertyOptional({
    description: 'Dobra cutânea tricipital em mm',
    example: 15,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'A dobra cutânea tricipital deve ser um número' })
  tricipital?: number;

  @ApiPropertyOptional({
    description: 'Dobra cutânea bicipital em mm',
    example: 10,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'A dobra cutânea bicipital deve ser um número' })
  bicipital?: number;

  @ApiPropertyOptional({
    description: 'Dobra cutânea abdominal em mm',
    example: 25,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'A dobra cutânea abdominal deve ser um número' })
  abdominal?: number;

  @ApiPropertyOptional({
    description: 'Dobra cutânea subescapular em mm',
    example: 18,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'A dobra cutânea subescapular deve ser um número' })
  subscapular?: number;

  @ApiPropertyOptional({
    description: 'Dobra cutânea axilar média em mm',
    example: 12,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'A dobra cutânea axilar média deve ser um número' })
  axillaryMedian?: number;

  @ApiPropertyOptional({
    description: 'Dobra cutânea da coxa em mm',
    example: 28,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'A dobra cutânea da coxa deve ser um número' })
  thigh?: number;

  @ApiPropertyOptional({
    description: 'Dobra cutânea torácica em mm',
    example: 14,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'A dobra cutânea torácica deve ser um número' })
  thoracic?: number;

  @ApiPropertyOptional({
    description: 'Dobra cutânea suprailíaca em mm',
    example: 22,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'A dobra cutânea suprailíaca deve ser um número' })
  suprailiac?: number;

  @ApiPropertyOptional({
    description: 'Dobra cutânea da panturrilha em mm',
    example: 16,
    type: Number,
  })
  @IsOptional()
  @IsNumber(
    {},
    { message: 'A dobra cutânea da panturrilha deve ser um número' },
  )
  calf?: number;

  @ApiPropertyOptional({
    description: 'Dobra cutânea supraespinhal em mm',
    example: 15,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'A dobra cutânea supraespinhal deve ser um número' })
  supraspinal?: number;
}

export class BoneDiameters {
  @ApiPropertyOptional({
    description: 'Diâmetro do úmero em cm',
    example: 6.8,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'O diâmetro do úmero deve ser um número' })
  humerus?: number;

  @ApiPropertyOptional({
    description: 'Diâmetro do punho em cm',
    example: 5.5,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'O diâmetro do punho deve ser um número' })
  wrist?: number;

  @ApiPropertyOptional({
    description: 'Diâmetro do fêmur em cm',
    example: 9.2,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'O diâmetro do fêmur deve ser um número' })
  femur?: number;
}

export class CreateMeasurementDto {
  @ApiProperty({
    description: 'Data da medição',
    example: '2024-03-20',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    description: 'Peso em quilogramas',
    example: 70.5,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  weight: number;

  @ApiPropertyOptional({
    description: 'Altura em centímetros',
    example: 170,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  height?: number;

  @ApiPropertyOptional({
    description: 'Altura sentado em centímetros',
    example: 90,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  sittingHeight?: number;

  @ApiPropertyOptional({
    description: 'Altura do joelho em centímetros',
    example: 50,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  kneeHeight?: number;

  @ApiPropertyOptional({
    description: 'Percentual de gordura corporal',
    example: 15.5,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  bodyFat?: number;

  @ApiPropertyOptional({
    description: 'Massa gorda em kg',
    example: 12.5,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  fatMass?: number;

  @ApiPropertyOptional({
    description: 'Percentual de massa muscular',
    example: 45.2,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  muscleMassPercentage?: number;

  @ApiPropertyOptional({
    description: 'Massa muscular em quilogramas',
    example: 35.2,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  muscleMass?: number;

  @ApiPropertyOptional({
    description: 'Massa livre de gordura em kg',
    example: 58.0,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  fatFreeMass?: number;

  @ApiPropertyOptional({
    description: 'Massa óssea em kg',
    example: 3.1,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  boneMass?: number;

  @ApiPropertyOptional({
    description: 'Percentual de água corporal',
    example: 60.5,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  bodyWater?: number;

  @ApiPropertyOptional({
    description: 'Gordura visceral',
    example: 8.5,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  visceralFat?: number;

  @ApiPropertyOptional({
    description: 'Idade metabólica',
    example: 34,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  metabolicAge?: number;

  @ApiProperty({
    description: 'Medidas corporais',
    example: {
      chest: 95,
      waist: 80,
      hip: 100,
      arm: 32,
      thigh: 55,
    },
  })
  @IsObject()
  @ValidateNested()
  @Type(() => BodyMeasurements)
  measurements: BodyMeasurements;

  @ApiPropertyOptional({
    description: 'Dobras cutâneas',
    example: {
      tricipital: 15,
      bicipital: 10,
      abdominal: 25,
      subscapular: 18,
    },
  })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => Skinfolds)
  skinfolds?: Skinfolds;

  @ApiPropertyOptional({
    description: 'Diâmetros ósseos',
    example: {
      humerus: 6.8,
      wrist: 5.5,
      femur: 9.2,
    },
  })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => BoneDiameters)
  boneDiameters?: BoneDiameters;

  @ApiPropertyOptional({
    description: 'Fórmula de dobras cutâneas usada',
    example: 'pollock3',
  })
  @IsString()
  @IsOptional()
  skinfoldFormula?: string;

  @ApiProperty({
    description: 'ID do paciente',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID('4')
  patientId: string;

  @ApiProperty({
    description:
      'ID do nutricionista responsável (opcional, obtido automaticamente do token JWT)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID do nutricionista inválido' })
  nutritionistId?: string;
}
