import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Measurement } from './measurement.entity';
import { Gender } from '../enums/gender.enum';
import { MealPlan } from '../../meal-plans/entities/meal-plan.entity';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender;

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

  @OneToMany(() => Measurement, (measurement) => measurement.patient)
  measurements: Measurement[];

  @OneToMany(() => MealPlan, (mealPlan) => mealPlan.patient)
  mealPlans: MealPlan[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
