import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
// Importar entidades Patient e Assessment se necessário
// import { Patient } from '../../patients/entities/patient.entity';
// import { Assessment } from '../../assessments/entities/assessment.entity';
import { Measurement } from '../../patients/entities/measurement.entity';

export enum PhotoType {
  FRONT = 'front',
  BACK = 'back',
  LEFT = 'left',
  RIGHT = 'right',
}

@Entity('photos')
export class Photo {
  @ApiProperty({ description: 'ID único da foto', example: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID do paciente', example: 'uuid' })
  @Index()
  @Column('uuid')
  patientId: string;

  // Descomente se quiser relação direta
  // @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  // @JoinColumn({ name: 'patientId' })
  // patient: Patient;

  @ApiProperty({
    description: 'ID da avaliação',
    example: 'uuid',
    required: false,
  })
  @Index()
  @Column('uuid', { nullable: true })
  assessmentId: string | null;

  @ManyToOne(() => Measurement, (measurement) => measurement.photos, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'assessmentId' })
  measurement: Measurement;

  @ApiProperty({
    description: 'Tipo da foto',
    enum: PhotoType,
    example: 'front',
  })
  @Column({ type: 'enum', enum: PhotoType })
  type: PhotoType;

  @ApiProperty({ description: 'URL da foto', example: 'https://...' })
  @Column()
  url: string;

  @ApiProperty({ description: 'URL do thumbnail', example: 'https://...' })
  @Column({ name: 'thumbnail_url' })
  thumbnailUrl: string;

  @ApiProperty({ description: 'Caminho no storage', example: '...' })
  @Column({ name: 'storage_path' })
  storagePath: string;

  @ApiProperty({
    description: 'Data de criação',
    example: '2024-05-01T10:00:00Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de atualização',
    example: '2024-05-01T10:00:00Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Data de remoção (soft delete)',
    required: false,
  })
  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date | null;
}
