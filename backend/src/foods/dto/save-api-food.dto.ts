import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveApiFoodDto {
  @ApiProperty({
    description:
      'ID do alimento na API do Open Food Facts (mínimo 5 caracteres)',
    example: '7898926645011',
    minLength: 5,
    maxLength: 50,
  })
  @IsString()
  @MinLength(5)
  externalId: string;
}
