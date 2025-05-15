import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class MetDetailDto {
  @ApiProperty({
    description: 'Identificador do MET',
    example: 'METS_RUN_MODERATE',
  })
  @IsNotEmpty()
  @IsString()
  met_id: string;

  @ApiProperty({
    description: 'Duração em minutos',
    example: 30,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  duration_minutes: number;

  @ApiProperty({
    description: 'Valor do MET',
    example: 7.0,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  met_value: number;
}
