import { ApiProperty } from '@nestjs/swagger';
import { MealFoodResponseDto } from './meal-food.response.dto';

export class MealResponseDto {
  @ApiProperty({
    description: 'ID da refeição',
    example: 'e429433c-fe5c-451d-b51f-0e6c11bdea8f',
  })
  id: string;

  @ApiProperty({
    description: 'Nome da refeição',
    example: 'Café da manhã',
  })
  name: string;

  @ApiProperty({
    description: 'Horário da refeição',
    example: '07:00',
  })
  time: string;

  @ApiProperty({
    description: 'Observações da refeição',
    example: 'Sem sal',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Lista de alimentos da refeição',
    type: [MealFoodResponseDto],
  })
  mealFoods: MealFoodResponseDto[];

  @ApiProperty({
    description: 'Data de criação',
    example: '2025-05-20T02:32:58.877Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de atualização',
    example: '2025-05-25T10:48:24.309Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Total de calorias da refeição',
    example: '0.00',
  })
  totalCalories: string;

  @ApiProperty({
    description: 'Total de proteínas da refeição',
    example: '0.00',
  })
  totalProtein: string;

  @ApiProperty({
    description: 'Total de carboidratos da refeição',
    example: '0.00',
  })
  totalCarbs: string;

  @ApiProperty({
    description: 'Total de gorduras da refeição',
    example: '0.00',
  })
  totalFat: string;
}
