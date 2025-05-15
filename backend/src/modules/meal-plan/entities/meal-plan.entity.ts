import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Meal } from './meal.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Nutritionist } from '../../nutritionists/entities/nutritionist.entity';
import { Patient } from '../../patients/entities/patient.entity';
import { EnergyPlan } from '../../energy-plan/entities/energy-plan.entity';

@Entity('meal_plans')
export class MealPlan {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @Column()
  @ApiProperty({ example: 'Plano Alimentar Semanal' })
  name: string;

  @Column({ type: 'text', nullable: true, name: 'description' })
  @ApiProperty({ example: 'Plano alimentar para perda de peso' })
  description: string;

  @Column({ name: 'patient_id' })
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  patientId: string;

  @ManyToOne(() => Patient, (patient) => patient.mealPlans, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patient_id' })
  @ApiProperty({ type: () => Patient })
  patient: Patient;

  @Column({ name: 'nutritionist_id' })
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  nutritionistId: string;

  @ManyToOne(() => Nutritionist, (nutritionist) => nutritionist.mealPlans)
  @JoinColumn({ name: 'nutritionist_id' })
  @ApiProperty({ type: () => Nutritionist })
  nutritionist: Nutritionist;

  @Column({ name: 'energy_plan_id', nullable: true })
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  energyPlanId?: string;

  @ManyToOne(() => EnergyPlan, (energyPlan) => energyPlan.mealPlans, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'energy_plan_id' })
  @ApiProperty({ type: () => EnergyPlan })
  energyPlan?: EnergyPlan;

  @Column({ name: 'startDate', type: 'timestamp' })
  @ApiProperty({ example: '2024-03-20T10:00:00Z' })
  startDate: Date;

  @Column({ name: 'endDate', type: 'timestamp' })
  @ApiProperty({ example: '2024-03-27T10:00:00Z' })
  endDate: Date;

  @OneToMany(() => Meal, (meal) => meal.mealPlan)
  @ApiProperty({ type: () => [Meal] })
  meals: Meal[];

  @CreateDateColumn({ name: 'createdAt' })
  @ApiProperty({ example: '2024-03-20T10:00:00Z' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  @ApiProperty({ example: '2024-03-20T10:00:00Z' })
  updatedAt: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  @ApiProperty({ example: 2000.5 })
  dailyCalories: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  @ApiProperty({ example: 150.75 })
  dailyProtein: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  @ApiProperty({ example: 250.3 })
  dailyCarbs: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  @ApiProperty({ example: 80.2 })
  dailyFat: number;
}
