import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Measurement } from './measurement.entity';
import { PatientPhoto } from './patient-photo.entity';
import { Consultation } from './consultation.entity';
import { Gender } from '../enums/gender.enum';
import { MealPlan } from '../../meal-plans/entities/meal-plan.entity';
import { Nutritionist } from '../../nutritionists/entities/nutritionist.entity';

export enum PatientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum MonitoringStatus {
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  COMPLETED = 'completed',
}

export enum ConsultationFrequency {
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
}

@Entity('patients')
export class Patient {
  @ApiProperty({ description: 'Indica se é um paciente de exemplo' })
  @Column({ default: false })
  isSample: boolean;

  @ApiProperty({ description: 'ID do paciente' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Nome do paciente' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Email do paciente' })
  @Column({ unique: true, nullable: true })
  @Index()
  email: string;

  @ApiProperty({ description: 'CPF do paciente' })
  @Column({ unique: true, nullable: true })
  @Index()
  cpf: string;

  @ApiProperty({ description: 'Telefone do paciente' })
  @Column({ nullable: true })
  phone: string;

  @ApiProperty({ description: 'Endereço do paciente' })
  @Column({ nullable: true })
  address: string;

  @ApiProperty({ description: 'Data de nascimento do paciente' })
  @Column({ type: 'date', nullable: true })
  birthDate: string;

  @ApiProperty({ description: 'Gênero do paciente' })
  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender;

  @ApiProperty({ description: 'Instagram do paciente' })
  @Column({ nullable: true })
  instagram: string;

  @ApiProperty({ description: 'Status do paciente' })
  @Column({ type: 'enum', enum: PatientStatus, default: PatientStatus.ACTIVE })
  status: PatientStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number;

  @Column({ type: 'jsonb', nullable: true })
  goals: string[];

  @Column({ type: 'jsonb', nullable: true })
  allergies: string[];

  @Column({ type: 'jsonb', nullable: true })
  healthConditions: string[];

  @Column({ type: 'jsonb', nullable: true })
  medications: string[];

  @Column({ nullable: true })
  observations: string;

  @ApiProperty({ description: 'ID do nutricionista' })
  @Column({ name: 'nutritionist_id', type: 'uuid', nullable: true })
  nutritionistId: string;

  @ManyToOne(() => Nutritionist, (nutritionist) => nutritionist.patients, {
    nullable: true,
  })
  @JoinColumn({ name: 'nutritionist_id' })
  nutritionist: Nutritionist;

  @OneToMany(() => Measurement, (measurement) => measurement.patient)
  measurements: Measurement[];

  @OneToMany(() => MealPlan, (mealPlan) => mealPlan.patient)
  mealPlans: MealPlan[];

  @OneToMany(() => PatientPhoto, (photo) => photo.patient)
  photos: PatientPhoto[];

  @OneToMany(() => Consultation, (consultation) => consultation.patient)
  consultations: Consultation[];

  @Column({ type: 'timestamp', nullable: true })
  lastConsultationAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextConsultationAt: Date;

  @Column({
    type: 'enum',
    enum: MonitoringStatus,
    default: MonitoringStatus.IN_PROGRESS,
  })
  monitoringStatus: MonitoringStatus;

  @Column({
    type: 'enum',
    enum: ConsultationFrequency,
    default: ConsultationFrequency.MONTHLY,
  })
  consultationFrequency: ConsultationFrequency;

  @Column({ type: 'int', nullable: true })
  customConsultationDays: number;

  @ApiProperty({
    description: 'URL da foto de perfil do paciente',
    required: false,
  })
  @Column({ name: 'photo_url', nullable: true })
  photoUrl?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
