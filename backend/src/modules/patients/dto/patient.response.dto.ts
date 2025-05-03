import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ConsultationFrequency } from '../enums/consultation-frequency.enum';
import { MonitoringStatus } from '../enums/monitoring-status.enum';
import { PatientStatus } from '../enums/patient-status.enum';
import { NutritionistResponseDto } from '../../nutritionists/dto/nutritionist.response.dto';

export class PatientResponseDto {
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
  address: string;

  @ApiProperty()
  @Expose()
  birthDate: Date;

  @ApiProperty()
  @Expose()
  gender: string;

  @ApiProperty({ enum: PatientStatus })
  @Expose()
  status: PatientStatus;

  @ApiProperty({ enum: MonitoringStatus })
  @Expose()
  monitoringStatus: MonitoringStatus;

  @ApiProperty({ enum: ConsultationFrequency })
  @Expose()
  consultationFrequency: ConsultationFrequency;

  @ApiProperty()
  @Expose()
  customConsultationDays?: number;

  @ApiProperty()
  @Expose()
  lastConsultationAt?: Date;

  @ApiProperty()
  @Expose()
  nextConsultationAt?: Date;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @ApiProperty({ type: NutritionistResponseDto })
  @Expose()
  @Type(() => NutritionistResponseDto)
  nutritionist?: NutritionistResponseDto;
}
