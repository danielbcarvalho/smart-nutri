import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from './patient.entity';

@Entity('measurements')
export class Measurement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  weight: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  bodyFat: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  muscleMass: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  bodyWater: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  visceralFat: number;

  @Column({ type: 'jsonb' })
  measurements: {
    chest?: number;
    waist?: number;
    hip?: number;
    arm?: number;
    thigh?: number;
  };

  @ManyToOne(() => Patient, (patient) => patient.measurements, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ name: 'patient_id' })
  patientId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
