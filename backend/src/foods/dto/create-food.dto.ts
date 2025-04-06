import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsBoolean,
  Min,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFoodDto {
  @ApiProperty({ description: 'Nome do alimento' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'ID do alimento no FatSecret' })
  @IsString()
  fatsecretId: string;

  @ApiProperty({ description: 'Tamanho da porção' })
  @IsNumber()
  @Min(0)
  servingSize: number;

  @ApiProperty({ description: 'Unidade da porção (g, ml, etc)' })
  @IsString()
  servingUnit: string;

  @ApiProperty({ description: 'Calorias por porção' })
  @IsNumber()
  @Min(0)
  calories: number;

  @ApiProperty({ description: 'Proteínas por porção (g)' })
  @IsNumber()
  @Min(0)
  protein: number;

  @ApiProperty({ description: 'Carboidratos por porção (g)' })
  @IsNumber()
  @Min(0)
  carbohydrates: number;

  @ApiProperty({ description: 'Gorduras por porção (g)' })
  @IsNumber()
  @Min(0)
  fat: number;

  @ApiPropertyOptional({ description: 'Fibras por porção (g)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fiber?: number;

  @ApiPropertyOptional({ description: 'Açúcares por porção (g)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sugar?: number;

  @ApiPropertyOptional({ description: 'Sódio por porção (mg)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sodium?: number;

  @ApiPropertyOptional({ description: 'Nutrientes adicionais' })
  @IsOptional()
  @IsObject()
  additionalNutrients?: Record<string, number>;

  @ApiPropertyOptional({ description: 'Categorias do alimento' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiPropertyOptional({ description: 'Indica se é um alimento favorito' })
  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;
}
