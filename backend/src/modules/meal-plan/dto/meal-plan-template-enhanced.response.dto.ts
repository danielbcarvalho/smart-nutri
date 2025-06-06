import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { MealResponseDto } from './meal.response.dto';

export class MealPlanTemplateEnhancedResponseDto {
  @ApiProperty({ description: 'ID do template' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Nome do plano original' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'Descrição do plano original' })
  @Expose()
  description?: string;

  @ApiProperty({ description: 'Nome do template' })
  @Expose()
  templateName?: string;

  @ApiProperty({ description: 'Descrição do template' })
  @Expose()
  templateDescription?: string;

  @ApiProperty({ description: 'Se o template é público' })
  @Expose()
  isPublic: boolean;

  @ApiProperty({ description: 'Tags do template' })
  @Expose()
  tags?: string[];

  @ApiProperty({ description: 'Categoria do template' })
  @Expose()
  templateCategory?: string;

  @ApiProperty({ description: 'Número de usos do template' })
  @Expose()
  usageCount: number;

  @ApiProperty({ description: 'Calorias alvo do template' })
  @Expose()
  targetCalories?: number;

  @ApiProperty({ description: 'ID do nutricionista' })
  @Expose()
  nutritionistId: string;

  @ApiProperty({ description: 'Data de criação' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização' })
  @Expose()
  updatedAt: Date;

  @ApiProperty({ description: 'Refeições do template', type: [MealResponseDto] })
  @Expose()
  @Type(() => MealResponseDto)
  meals: MealResponseDto[];

  @ApiProperty({ description: 'Total de calorias diárias' })
  @Expose()
  dailyCalories: number;

  @ApiProperty({ description: 'Total de proteínas diárias' })
  @Expose()
  dailyProtein: number;

  @ApiProperty({ description: 'Total de carboidratos diários' })
  @Expose()
  dailyCarbs: number;

  @ApiProperty({ description: 'Total de gorduras diárias' })
  @Expose()
  dailyFat: number;
}