import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Patient } from './patient.entity';
import { Nutritionist } from '../../nutritionists/entities/nutritionist.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum PhotoType {
  FRONT = 'front',
  BACK = 'back',
  LEFT_SIDE = 'left_side',
  RIGHT_SIDE = 'right_side',
  OTHER = 'other',
}

@Entity('patient_photos')
export class PatientPhoto {
  @ApiProperty({ description: 'ID da foto' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID do paciente' })
  @Column({ name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => Patient, (patient) => patient.photos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ApiProperty({ description: 'ID do nutricionista' })
  @Column({ name: 'nutritionist_id' })
  nutritionistId: string;

  @ManyToOne(() => Nutritionist, {
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'nutritionist_id' })
  nutritionist: Nutritionist;

  @ApiProperty({ description: 'URL da foto' })
  @Column()
  photoUrl: string;

  @ApiProperty({
    description: 'Tipo da foto',
    enum: PhotoType,
    example: PhotoType.FRONT,
  })
  @Column({
    type: 'enum',
    enum: PhotoType,
    default: PhotoType.OTHER,
  })
  photoType: PhotoType;

  @ApiProperty({ description: 'Data da foto' })
  @Column({ type: 'date' })
  photoDate: Date;

  @ApiProperty({ description: 'Observações sobre a foto' })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ description: 'Data de criação do registro' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Data da última atualização do registro' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
