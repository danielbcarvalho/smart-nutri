import { ApiProperty } from '@nestjs/swagger';
import { MealFoodSubstituteDto } from './meal-food-substitute.dto';

export class MealFoodResponseDto {
  @ApiProperty({
    description: 'ID do alimento na refeição',
    example: '87f10920-a910-46bf-bbf6-d162380687e9',
  })
  id: string;

  @ApiProperty({
    description: 'Quantidade do alimento',
    example: '1.00',
  })
  amount: string;

  @ApiProperty({
    description: 'Unidade de medida',
    example: 'Unidade(s) pequena(s)',
  })
  unit: string;

  @ApiProperty({
    description: 'ID do alimento (UUID ou ID externo)',
    example: '2980',
  })
  foodId: string;

  @ApiProperty({
    description: 'Origem do alimento (ex: taco, tbca, personalizado, backend)',
    example: 'tucunduva',
  })
  source: string;

  @ApiProperty({
    description: 'ID da refeição',
    example: 'e429433c-fe5c-451d-b51f-0e6c11bdea8f',
  })
  mealId: string;

  @ApiProperty({
    description: 'Data de criação',
    example: '2025-05-20T02:33:15.462Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de atualização',
    example: '2025-05-20T02:33:15.495Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Lista de alimentos substitutos',
    type: [MealFoodSubstituteDto],
  })
  substitutes?: MealFoodSubstituteDto[];
}
