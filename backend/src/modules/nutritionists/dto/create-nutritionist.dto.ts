import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  MinLength,
} from 'class-validator';

export class CreateNutritionistDto {
  @ApiProperty({
    example: 'João Silva',
    description: 'Nome completo do nutricionista',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'joao@email.com',
    description: 'Email do nutricionista',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'senha123',
    description: 'Senha do nutricionista',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: '11999999999',
    description: 'Telefone do nutricionista',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: 'CRN/SP 12345',
    description: 'Número de registro profissional',
    required: false,
  })
  @IsString()
  @IsOptional()
  crn?: string;

  @ApiProperty({
    example: ['Esportiva', 'Clínica'],
    description: 'Especialidades do nutricionista',
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  specialties?: string[];

  @ApiProperty({
    example: 'Clínica Nutri Saúde',
    description: 'Nome da clínica',
    required: false,
  })
  @IsString()
  @IsOptional()
  clinicName?: string;

  @ApiProperty({
    example: '@exemplo_nutri',
    description: 'Instagram do nutricionista (ex: @exemplo_nutri)',
    required: false,
  })
  @IsString()
  @IsOptional()
  instagram?: string;
}
