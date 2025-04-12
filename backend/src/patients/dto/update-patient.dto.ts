import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, Length } from 'class-validator';

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
}
