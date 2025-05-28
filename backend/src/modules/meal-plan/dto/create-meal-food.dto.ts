import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MealFoodSubstituteDto } from './meal-food-substitute.dto';

export class CreateMealFoodDto {
  @ApiProperty({
    description: 'ID do alimento (UUID ou ID externo)',
    example: '3344',
  })
  @IsString()
  @IsNotEmpty()
  foodId: string;

  @ApiProperty({
    description: 'Origem do alimento (ex: taco, tbca, personalizado, backend)',
    example: 'taco',
  })
  @IsString()
  @IsNotEmpty()
  source: string;

  @ApiProperty({
    description: 'Quantidade do alimento',
    example: 100,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'Unidade de medida',
    example: 'g',
  })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiPropertyOptional({
    description: 'Lista de alimentos substitutos',
    type: [MealFoodSubstituteDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MealFoodSubstituteDto)
  substitutes?: MealFoodSubstituteDto[];

  // Campos opcionais para criação automática de alimento personalizado
  @ApiPropertyOptional({
    description: 'Nome do alimento (obrigatório para source "personalizado")',
    example: 'Meu Alimento',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Calorias por 100g (obrigatório para source "personalizado")',
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  calories?: number;

  @ApiPropertyOptional({
    description: 'Proteína por 100g (obrigatório para source "personalizado")',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  protein?: number;

  @ApiPropertyOptional({
    description:
      'Carboidratos por 100g (obrigatório para source "personalizado")',
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  carbs?: number;

  @ApiPropertyOptional({
    description: 'Gordura por 100g (obrigatório para source "personalizado")',
    example: 2,
  })
  @IsOptional()
  @IsNumber()
  fat?: number;
}
