import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Patient } from './patient.entity';
import { Nutritionist } from '../../nutritionists/entities/nutritionist.entity';
import { Measurement } from './measurement.entity';

export enum ConsultationStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled',
}

export enum ConsultationType {
  INITIAL = 'initial',
  FOLLOW_UP = 'follow_up',
  ASSESSMENT = 'assessment',
  MEAL_PLAN_REVIEW = 'meal_plan_review',
  OTHER = 'other',
}

@Entity('consultations')
export class Consultation {
  @ApiProperty({ description: 'ID da consulta' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Data da consulta' })
  @Column({ type: 'timestamp' })
  date: Date;

  @ApiProperty({ description: 'ID do paciente' })
  @Column({ name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => Patient, (patient) => patient.consultations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ApiProperty({ description: 'ID do nutricionista' })
  @Column({ name: 'nutritionist_id' })
  nutritionistId: string;

  @ManyToOne(() => Nutritionist, (nutritionist) => nutritionist.consultations, {
    onDelete: 'NO ACTION',
  })
  @JoinColumn({ name: 'nutritionist_id' })
  nutritionist: Nutritionist;

  @ApiProperty({ description: 'Anotações da consulta' })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({
    description: 'Status da consulta',
    enum: ConsultationStatus,
    example: ConsultationStatus.SCHEDULED,
  })
  @Column({
    type: 'enum',
    enum: ConsultationStatus,
    default: ConsultationStatus.SCHEDULED,
  })
  status: ConsultationStatus;

  @ApiProperty({
    description: 'Tipo da consulta',
    enum: ConsultationType,
    example: ConsultationType.FOLLOW_UP,
  })
  @Column({
    type: 'enum',
    enum: ConsultationType,
    default: ConsultationType.FOLLOW_UP,
  })
  type: ConsultationType;

  @OneToMany(() => Measurement, (measurement) => measurement.consultation)
  measurements: Measurement[];

  @ApiProperty({ description: 'Data de criação do registro' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Data da última atualização do registro' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
