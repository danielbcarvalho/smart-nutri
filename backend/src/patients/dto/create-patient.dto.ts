import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsArray,
  Matches,
  MinLength,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Gender } from '../enums/gender.enum';
import { PatientStatus } from '../entities/patient.entity';

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

  @ApiPropertyOptional({ description: 'CPF do paciente' })
  @IsString()
  @IsOptional()
  cpf?: string;

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
    type: String,
  })
  @IsOptional()
  @Transform(({ value }): string | null => {
    if (!value || value === '') return null;
    return value;
  })
  birthDate?: string;

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
    description: 'Status do paciente',
    enum: PatientStatus,
    example: PatientStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(PatientStatus, {
    message: 'Status deve ser active ou inactive',
  })
  status?: PatientStatus;

  @ApiPropertyOptional({
    description: 'Altura do paciente em centímetros',
    example: 170,
  })
  @IsOptional()
  @Transform(({ value }): number | null => (value ? Number(value) : null))
  height?: number;

  @ApiPropertyOptional({
    description: 'Peso do paciente em quilogramas',
    example: 70,
  })
  @IsOptional()
  @Transform(({ value }): number | null => (value ? Number(value) : null))
  weight?: number;

  @ApiPropertyOptional({
    description: 'Objetivos do paciente',
    example: ['Perda de peso', 'Ganho de massa muscular'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }): string[] => (value ? value : []))
  goals?: string[];

  @ApiPropertyOptional({
    description: 'Alergias do paciente',
    example: ['Amendoim', 'Lactose'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }): string[] => (value ? value : []))
  allergies?: string[];

  @ApiPropertyOptional({
    description: 'Condições de saúde do paciente',
    example: ['Diabetes', 'Hipertensão'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }): string[] => (value ? value : []))
  healthConditions?: string[];

  @ApiPropertyOptional({
    description: 'Medicamentos em uso',
    example: ['Metformina', 'Losartana'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }): string[] => (value ? value : []))
  medications?: string[];

  @ApiPropertyOptional({
    description: 'Observações gerais',
    example: 'Paciente com histórico familiar de diabetes',
  })
  @IsOptional()
  @Transform(({ value }): string | null => (value === '' ? null : value))
  observations?: string;

  @ApiPropertyOptional({
    description: 'ID do nutricionista responsável',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID do nutricionista inválido' })
  nutritionistId?: string;
}
