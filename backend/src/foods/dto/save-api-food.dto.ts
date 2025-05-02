import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveTbcaFoodDto {
  @ApiProperty({
    description:
      'Código do alimento na base TBCA (Tabela Brasileira de Composição de Alimentos)',
    example: 'C0001',
    minLength: 3,
    maxLength: 80,
  })
  @IsString()
  @MinLength(3)
  codigo: string;
}
