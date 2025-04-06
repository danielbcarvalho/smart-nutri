import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchFoodDto {
  @ApiProperty({ description: 'Termo de busca para encontrar alimentos' })
  @IsString()
  query: string;

  @ApiPropertyOptional({ description: 'Página dos resultados', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  page?: number = 0;

  @ApiPropertyOptional({
    description: 'Quantidade de itens por página',
    default: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize?: number = 20;
}
