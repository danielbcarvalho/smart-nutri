import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  Length,
  IsEnum,
  IsArray,
} from 'class-validator';
import { Gender } from '../enums/gender.enum';

export class UpdatePatientDto {
  @ApiPropertyOptional({ description: 'Nome do paciente' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Email do paciente' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'CPF do paciente' })
  @IsString()
  @IsOptional()
  @Length(11, 11)
  cpf?: string;

  @ApiPropertyOptional({ description: 'Telefone do paciente' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Endereço do paciente' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: 'Data de nascimento do paciente' })
  @IsString()
  @IsOptional()
  birthDate?: string;

  @ApiPropertyOptional({ description: 'Gênero do paciente', enum: Gender })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiPropertyOptional({ description: 'Instagram do paciente' })
  @IsString()
  @IsOptional()
  instagram?: string;

  @ApiPropertyOptional({ description: 'URL da foto de perfil do paciente' })
  @IsString()
  @IsOptional()
  photoUrl?: string;

  @ApiPropertyOptional({
    description: 'Alergias do paciente',
    example: ['Amendoim', 'Lactose'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  allergies?: string[];

  @ApiPropertyOptional({
    description: 'Condições de saúde do paciente',
    example: ['Diabetes', 'Hipertensão'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  healthConditions?: string[];
}
