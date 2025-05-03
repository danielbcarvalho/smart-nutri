import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { PhotoType } from '../entities/patient-photo.entity';

export class UpdatePatientPhotoDto {
  @ApiProperty({
    description: 'URL da foto',
    example: 'https://storage.example.com/photos/patient123-front-updated.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  photoUrl?: string;

  @ApiProperty({
    description: 'Tipo da foto',
    enum: PhotoType,
    example: PhotoType.FRONT,
    required: false,
  })
  @IsEnum(PhotoType)
  @IsOptional()
  photoType?: PhotoType;

  @ApiProperty({
    description: 'Data da foto',
    example: '2024-04-01',
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  photoDate?: Date;

  @ApiProperty({
    description: 'Observações sobre a foto',
    example: 'Foto tirada após 3 meses de dieta',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
