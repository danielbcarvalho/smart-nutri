import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, IsBoolean, IsNumber } from 'class-validator';

export class TemplateFiltersDto {
  @ApiProperty({
    description: 'Categoria do template',
    example: 'emagrecimento',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    description: 'Tags para filtrar templates',
    example: ['lowcarb', 'emagrecimento'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    description: 'Termo de busca por nome ou descrição',
    example: 'low carb',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Se deve incluir apenas templates públicos',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({
    description: 'Filtro por calorias mínimas',
    example: 1200,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  minCalories?: number;

  @ApiProperty({
    description: 'Filtro por calorias máximas',
    example: 2000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  maxCalories?: number;
}