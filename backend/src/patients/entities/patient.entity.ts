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

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column({ type: 'date' })
  birthDate: Date;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  height: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
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
