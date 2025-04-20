import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { MealPlan } from '../../meal-plans/entities/meal-plan.entity';
import { Measurement } from '../../patients/entities/measurement.entity';
import { Consultation } from '../../patients/entities/consultation.entity';
import { MealPlanTemplate } from '../../meal-plans/entities/meal-plan-template.entity';

@Entity('nutritionists')
export class Nutritionist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  crn: string;

  @Column({ type: 'jsonb', nullable: true })
  specialties: string[];

  @Column({ nullable: true })
  clinicName: string;

  @OneToMany(() => Patient, (patient) => patient.nutritionist)
  patients: Patient[];

  @OneToMany(() => MealPlan, (mealPlan) => mealPlan.nutritionist)
  mealPlans: MealPlan[];

  @OneToMany(() => MealPlanTemplate, (template) => template.nutritionist)
  mealPlanTemplates: MealPlanTemplate[];

  @OneToMany(() => Measurement, (measurement) => measurement.nutritionist)
  measurements: Measurement[];

  @OneToMany(() => Consultation, (consultation) => consultation.nutritionist)
  consultations: Consultation[];

  @Column({ name: 'photo_url', nullable: true })
  photoUrl?: string;

  @Column({ nullable: true })
  instagram: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
