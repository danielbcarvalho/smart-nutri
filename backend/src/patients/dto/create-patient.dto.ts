import {
  IsString,
  IsEmail,
  IsDate,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  IsPhoneNumber,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Gender } from '../enums/gender.enum';

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

  @ApiProperty({
    description: 'Email do paciente',
    example: 'joao.silva@email.com',
  })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({
    description: 'Telefone do paciente',
    example: '(11) 98765-4321',
  })
  @IsPhoneNumber('BR', { message: 'Telefone inválido' })
  phone: string;

  @ApiProperty({
    description: 'Data de nascimento do paciente',
    example: '1990-01-01',
    type: Date,
  })
  @Type(() => Date)
  @IsDate()
  birthDate: Date;

  @ApiProperty({
    description: 'Gênero do paciente',
    enum: Gender,
    example: Gender.MALE,
  })
  @IsEnum(Gender, {
    message: 'Gênero deve ser MALE, FEMALE ou OTHER',
  })
  gender: Gender;

  @ApiProperty({
    description: 'Altura do paciente em metros',
    example: 1.75,
    type: Number,
  })
  @IsNumber({}, { message: 'A altura deve ser um número' })
  height: number;

  @ApiProperty({
    description: 'Peso do paciente em quilogramas',
    example: 70.5,
    type: Number,
  })
  @IsNumber({}, { message: 'O peso deve ser um número' })
  weight: number;

  @ApiProperty({
    description: 'Objetivos do paciente',
    example: ['Perda de peso', 'Ganho de massa muscular'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  goals?: string[];

  @ApiProperty({
    description: 'Alergias do paciente',
    example: ['Amendoim', 'Leite'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @ApiProperty({
    description: 'Condições de saúde do paciente',
    example: ['Diabetes tipo 2', 'Hipertensão'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  healthConditions?: string[];

  @ApiProperty({
    description: 'Medicamentos em uso',
    example: ['Metformina', 'Losartana'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medications?: string[];

  @ApiProperty({
    description: 'Observações gerais sobre o paciente',
    example: 'Paciente com histórico familiar de diabetes',
    required: false,
  })
  @IsOptional()
  @IsString()
  observations?: string;
}
