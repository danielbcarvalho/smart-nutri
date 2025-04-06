import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveApiFoodDto {
  @ApiProperty({
    description: 'ID do alimento na API do Open Food Facts',
    example: '7898926645011',
  })
  @IsString()
  externalId: string;
}
