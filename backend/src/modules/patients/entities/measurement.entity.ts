import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Patient } from './patient.entity';
import { Consultation } from './consultation.entity';
import { Photo } from '../../photos/entities/photo.entity';
import { Nutritionist } from '../../nutritionists/entities/nutritionist.entity';

@Entity('measurements')
export class Measurement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  // Dados básicos
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  weight: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  sittingHeight: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  kneeHeight: number;

  // Bioimpedância
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  bodyFat: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  fatMass: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  muscleMassPercentage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  muscleMass: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  fatFreeMass: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  boneMass: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  visceralFat: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  bodyWater: number;

  @Column({ type: 'integer', nullable: true })
  metabolicAge: number;

  // Circunferências corporais estendidas
  @Column({ type: 'jsonb' })
  measurements: {
    chest?: number;
    waist?: number;
    hip?: number;
    neck?: number;
    shoulder?: number;
    abdomen?: number;
    relaxedArmLeft?: number;
    relaxedArmRight?: number;
    contractedArmLeft?: number;
    contractedArmRight?: number;
    forearmLeft?: number;
    forearmRight?: number;
    proximalThighLeft?: number;
    proximalThighRight?: number;
    medialThighLeft?: number;
    medialThighRight?: number;
    distalThighLeft?: number;
    distalThighRight?: number;
    calfLeft?: number;
    calfRight?: number;
  };

  // Dobras cutâneas
  @Column({ type: 'jsonb', nullable: true })
  skinfolds: {
    tricipital?: number;
    bicipital?: number;
    abdominal?: number;
    subscapular?: number;
    axillaryMedian?: number;
    thigh?: number;
    thoracic?: number;
    suprailiac?: number;
    calf?: number;
    supraspinal?: number;
  };

  // Diâmetro ósseo
  @Column({ type: 'jsonb', nullable: true })
  boneDiameters: {
    humerus?: number;
    wrist?: number;
    femur?: number;
  };

  // Fórmula de dobras cutâneas usada
  @Column({ type: 'varchar', length: 50, nullable: true })
  skinfoldFormula: string;

  @ManyToOne(() => Patient, (patient) => patient.measurements, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => Nutritionist, (nutritionist) => nutritionist.measurements, {
    nullable: false,
  })
  @JoinColumn({ name: 'nutritionist_id' })
  nutritionist: Nutritionist;

  @Column({ name: 'nutritionist_id', type: 'uuid' })
  nutritionistId: string;

  @ManyToOne(() => Consultation, (consultation) => consultation.measurements, {
    nullable: true,
  })
  @JoinColumn({ name: 'consultation_id' })
  consultation: Consultation;

  @Column({ name: 'consultation_id', type: 'uuid', nullable: true })
  consultationId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Photo, (photo) => photo.measurement)
  photos: Photo[];
}
