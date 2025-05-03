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
  @ApiProperty({
    description: 'Nome do alimento (2-100 caracteres)',
    example: 'Maçã Fuji',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'ID do alimento no FatSecret (mínimo 1 caractere)',
    example: '123456',
    minLength: 1,
  })
  @IsString()
  fatsecretId: string;

  @ApiProperty({
    description: 'Quantidade em gramas ou mililitros (mínimo 0)',
    example: 100,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  servingSize: number;

  @ApiProperty({
    description: 'Unidade de medida da porção',
    example: 'g',
    enum: ['g', 'ml', 'unidade', 'colher', 'xícara'],
  })
  @IsString()
  servingUnit: string;

  @ApiProperty({
    description: 'Quantidade de calorias em kcal (mínimo 0)',
    example: 52,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  calories: number;

  @ApiProperty({
    description: 'Quantidade de proteínas em gramas (mínimo 0)',
    example: 0.3,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  protein: number;

  @ApiProperty({
    description: 'Quantidade de carboidratos em gramas (mínimo 0)',
    example: 13.8,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  carbohydrates: number;

  @ApiProperty({
    description: 'Quantidade de gorduras em gramas (mínimo 0)',
    example: 0.2,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  fat: number;

  @ApiPropertyOptional({
    description: 'Quantidade de fibras em gramas (mínimo 0)',
    example: 2.4,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fiber?: number;

  @ApiPropertyOptional({
    description: 'Quantidade de açúcares em gramas (mínimo 0)',
    example: 10.4,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sugar?: number;

  @ApiPropertyOptional({
    description: 'Quantidade de sódio em miligramas (mínimo 0)',
    example: 1,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sodium?: number;

  @ApiPropertyOptional({
    description: 'Outros nutrientes e suas quantidades',
    example: {
      'Vitamina C': 4.6,
      Potássio: 107,
    },
  })
  @IsOptional()
  @IsObject()
  additionalNutrients?: Record<string, number>;

  @ApiPropertyOptional({
    description: 'Lista de categorias que o alimento pertence',
    example: ['Frutas', 'Frutas frescas'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiPropertyOptional({
    description: 'Status de favorito do alimento',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;
}
