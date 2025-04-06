import {
  IsDate,
  IsNumber,
  IsObject,
  IsOptional,
  Min,
  Max,
  ValidateNested,
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
  @Max(120, { message: 'Medida máxima da coxa: 120cm' })
  thigh?: number;
}

export class CreateMeasurementDto {
  @ApiProperty({
    description: 'Data da medição',
    example: '2024-04-05',
    type: Date,
  })
  @Type(() => Date)
  @IsDate()
  date: Date;

  @ApiProperty({
    description: 'Peso em quilogramas',
    example: 70.5,
    type: Number,
  })
  @IsNumber({}, { message: 'O peso deve ser um número' })
  @Min(0.1, { message: 'Peso mínimo: 0.1kg' })
  @Max(500, { message: 'Peso máximo: 500kg' })
  weight: number;

  @ApiProperty({
    description: 'Percentual de gordura corporal',
    example: 20.5,
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'O percentual de gordura deve ser um número' })
  @Min(1, { message: 'Percentual mínimo de gordura: 1%' })
  @Max(70, { message: 'Percentual máximo de gordura: 70%' })
  bodyFat?: number;

  @ApiProperty({
    description: 'Percentual de massa muscular',
    example: 35.2,
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsNumber(
    {},
    { message: 'O percentual de massa muscular deve ser um número' },
  )
  @Min(10, { message: 'Percentual mínimo de massa muscular: 10%' })
  @Max(80, { message: 'Percentual máximo de massa muscular: 80%' })
  muscleMass?: number;

  @ApiProperty({
    description: 'Percentual de água corporal',
    example: 60.5,
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'O percentual de água deve ser um número' })
  @Min(20, { message: 'Percentual mínimo de água: 20%' })
  @Max(80, { message: 'Percentual máximo de água: 80%' })
  bodyWater?: number;

  @ApiProperty({
    description: 'Nível de gordura visceral',
    example: 8,
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsNumber({}, { message: 'O nível de gordura visceral deve ser um número' })
  @Min(1, { message: 'Nível mínimo de gordura visceral: 1' })
  @Max(59, { message: 'Nível máximo de gordura visceral: 59' })
  visceralFat?: number;

  @ApiProperty({
    description: 'Medidas corporais',
    type: BodyMeasurements,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => BodyMeasurements)
  measurements: BodyMeasurements;
}
