import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PhotoType } from '../entities/patient-photo.entity';

export class CreatePatientPhotoDto {
  @ApiProperty({
    description: 'ID do paciente',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({
    description: 'URL da foto',
    example: 'https://storage.example.com/photos/patient123-front.jpg',
  })
  @IsString()
  @IsNotEmpty()
  photoUrl: string;

  @ApiProperty({
    description: 'Tipo da foto',
    enum: PhotoType,
    example: PhotoType.FRONT,
  })
  @IsEnum(PhotoType)
  @IsNotEmpty()
  photoType: PhotoType;

  @ApiProperty({
    description: 'Data da foto',
    example: '2024-04-01',
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  photoDate: Date;

  @ApiProperty({
    description: 'Observações sobre a foto',
    example: 'Foto tirada após 3 meses de dieta',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
