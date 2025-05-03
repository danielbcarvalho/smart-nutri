import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PatientResponseDto } from '../../patients/dto/patient.response.dto';

export class FoodResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  portion: string;

  @ApiProperty()
  @Expose()
  category: string;

  @ApiProperty()
  @Expose()
  tags: string[];

  @ApiProperty()
  @Expose()
  description?: string;

  @ApiProperty()
  @Expose()
  consumed: boolean;
}

export class MealResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  description?: string;

  @ApiProperty()
  @Expose()
  time: string;

  @ApiProperty()
  @Expose()
  consumed: boolean;

  @ApiProperty({ type: [FoodResponseDto] })
  @Expose()
  @Type(() => FoodResponseDto)
  foods: FoodResponseDto[];
}

export class MealPlanResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  description?: string;

  @ApiProperty()
  @Expose()
  startDate: Date;

  @ApiProperty()
  @Expose()
  endDate: Date;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @ApiProperty({ type: PatientResponseDto })
  @Expose()
  @Type(() => PatientResponseDto)
  patient: PatientResponseDto;

  @ApiProperty({ type: [MealResponseDto] })
  @Expose()
  @Type(() => MealResponseDto)
  meals: MealResponseDto[];
}
