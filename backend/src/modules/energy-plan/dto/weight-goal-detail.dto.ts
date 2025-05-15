import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min } from 'class-validator';

export class WeightGoalDetailDto {
  @ApiProperty({
    description: 'Mudança de peso alvo em kg',
    example: -2,
  })
  @IsOptional()
  @IsNumber()
  target_weight_change_kg?: number;

  @ApiProperty({
    description: 'Dias para atingir o objetivo',
    example: 60,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  days_to_achieve?: number;

  @ApiProperty({
    description: 'Ajuste calórico calculado',
    example: -256,
  })
  @IsOptional()
  @IsNumber()
  calculated_kcal_adjustment?: number;
}
