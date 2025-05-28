import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class MealFoodSubstituteDto {
  @ApiProperty({
    description: 'ID do alimento substituto (UUID ou ID externo)',
    example: '2984',
  })
  @IsString()
  @IsNotEmpty()
  foodId: string;

  @ApiProperty({
    description:
      'Origem do alimento substituto (ex: taco, tbca, personalizado, backend)',
    example: 'taco',
  })
  @IsString()
  @IsNotEmpty()
  source: string;

  @ApiProperty({
    description: 'Nome do alimento substituto',
    example: 'Pão de queijo',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Quantidade do alimento substituto',
    example: 1,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'Unidade de medida do substituto',
    example: 'Unidade(s) pequena(s)',
  })
  @IsString()
  @IsNotEmpty()
  unit: string;
}
