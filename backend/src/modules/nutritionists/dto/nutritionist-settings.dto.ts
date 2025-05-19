import { ApiProperty } from '@nestjs/swagger';
import {
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CustomColorsDto {
  @ApiProperty({ description: 'Cor principal do tema' })
  @IsString()
  primary: string;

  @ApiProperty({ description: 'Cor secundária do tema' })
  @IsString()
  secondary: string;

  @ApiProperty({ description: 'Cor de destaque do tema' })
  @IsString()
  accent: string;
}

export class CustomFontsDto {
  @ApiProperty({ description: 'Fonte principal do tema' })
  @IsString()
  primary: string;

  @ApiProperty({ description: 'Fonte secundária do tema' })
  @IsString()
  secondary: string;
}

export class NutritionistSettingsDto {
  @ApiProperty({
    description: 'Cores personalizadas do nutricionista',
    required: false,
  })
  customColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };

  @ApiProperty({
    description: 'Fontes personalizadas do nutricionista',
    required: false,
  })
  customFonts?: {
    primary: string;
    secondary: string;
  };

  @ApiProperty({
    description: 'URL do logo do nutricionista',
    required: false,
  })
  logoUrl?: string;
}
