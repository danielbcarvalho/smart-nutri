import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchFoodDto {
  @ApiProperty({
    description:
      'Termo de busca para encontrar alimentos (mínimo 2 caracteres)',
    example: 'maçã',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  query: string;

  @ApiPropertyOptional({
    description: 'Número da página dos resultados (começa em 0)',
    example: 0,
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  page?: number = 0;

  @ApiPropertyOptional({
    description: 'Quantidade de itens por página (mínimo 1, máximo 50)',
    example: 20,
    default: 80,
    minimum: 1,
    maximum: 80,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(80)
  pageSize?: number = 80;
}
