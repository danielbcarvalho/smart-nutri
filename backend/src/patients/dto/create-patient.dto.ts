import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsArray,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Gender } from '../enums/gender.enum';
import { Transform } from 'class-transformer';

export class CreatePatientDto {
  @ApiProperty({
    description: 'Nome completo do paciente',
    example: 'João da Silva',
  })
  @IsString({ message: 'O nome deve ser uma string' })
  @MinLength(3, { message: 'O nome deve ter no mínimo 3 caracteres' })
  @MaxLength(100, { message: 'O nome deve ter no máximo 100 caracteres' })
  @Matches(/^[a-zA-ZÀ-ÿ\s]*$/, {
    message: 'O nome deve conter apenas letras e espaços',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Email do paciente',
    example: 'joao.silva@email.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  @Transform(({ value }): string | null => (value === '' ? null : value))
  email?: string;

  @ApiPropertyOptional({
    description: 'Telefone do paciente',
    example: '(11) 98765-4321',
  })
  @IsOptional()
  @Transform(({ value }): string | null => (value === '' ? null : value))
  phone?: string;

  @ApiPropertyOptional({
    description: 'Data de nascimento do paciente',
    example: '1990-01-01',
    type: Date,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value || value === '') return null;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  })
  @Type(() => Date)
  birthDate?: Date;

  @ApiPropertyOptional({
    description: 'Gênero do paciente',
    enum: Gender,
    example: Gender.MALE,
  })
  @IsOptional()
  @IsEnum(Gender, {
    message: 'Gênero deve ser MALE, FEMALE ou OTHER',
  })
  gender?: Gender;

  @ApiPropertyOptional({
    description: 'Altura do paciente em metros',
    example: 1.75,
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : Number(value)))
  height?: number;

  @ApiPropertyOptional({
    description: 'Peso do paciente em quilogramas',
    example: 70.5,
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : Number(value)))
  weight?: number;

  @ApiPropertyOptional({
    description: 'Objetivos do paciente',
    example: ['Perda de peso', 'Ganho de massa muscular'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  goals?: string[];

  @ApiPropertyOptional({
    description: 'Alergias do paciente',
    example: ['Amendoim', 'Leite'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @ApiPropertyOptional({
    description: 'Condições de saúde do paciente',
    example: ['Diabetes tipo 2', 'Hipertensão'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  healthConditions?: string[];

  @ApiPropertyOptional({
    description: 'Medicamentos em uso',
    example: ['Metformina', 'Losartana'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medications?: string[];

  @ApiPropertyOptional({
    description: 'Observações gerais sobre o paciente',
    example: 'Paciente com histórico familiar de diabetes',
  })
  @IsOptional()
  @IsString()
  observations?: string;
}
