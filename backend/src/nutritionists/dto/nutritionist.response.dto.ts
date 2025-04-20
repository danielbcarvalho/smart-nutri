import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class NutritionistResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  phone: string;

  @ApiProperty()
  @Expose()
  crn: string;

  @ApiProperty()
  @Expose()
  specialties: string[];

  @ApiProperty()
  @Expose()
  clinicName: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @ApiProperty()
  @Expose()
  photoUrl?: string;

  @ApiProperty()
  @Expose()
  instagram: string;
}
