import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min, IsUUID } from 'class-validator';

export class CreateMealFoodDto {
  @ApiProperty({
    description: 'ID do alimento',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  foodId: string;

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
}
