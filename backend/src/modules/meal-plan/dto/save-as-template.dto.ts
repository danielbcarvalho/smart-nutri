import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsArray, IsNumber } from 'class-validator';

export class SaveAsTemplateDto {
  @ApiProperty({
    description: 'Nome do template',
    example: 'Plano Low Carb 1600kcal',
  })
  @IsString()
  templateName: string;

  @ApiProperty({
    description: 'Descrição do template',
    example: 'Template de plano alimentar low carb para perda de peso',
    required: false,
  })
  @IsOptional()
  @IsString()
  templateDescription?: string;

  @ApiProperty({
    description: 'Se o template deve ser público para outros nutricionistas',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({
    description: 'Tags para categorização do template',
    example: ['lowcarb', 'emagrecimento', 'ativo'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    description: 'Categoria do template',
    example: 'emagrecimento',
    required: false,
  })
  @IsOptional()
  @IsString()
  templateCategory?: string;

  @ApiProperty({
    description: 'Calorias alvo do template (para filtros)',
    example: 1600,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  targetCalories?: number;
}