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

  @Column({ name: 'patient_id', nullable: true })
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  patientId?: string;

  @ManyToOne(() => Patient, (patient) => patient.mealPlans, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patient_id' })
  @ApiProperty({ type: () => Patient })
  patient?: Patient;

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

  @Column({ name: 'startDate', type: 'timestamp', nullable: true })
  @ApiProperty({ example: '2024-03-20T10:00:00Z' })
  startDate?: Date;

  @Column({ name: 'endDate', type: 'timestamp', nullable: true })
  @ApiProperty({ example: '2024-03-27T10:00:00Z' })
  endDate?: Date;

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

  // Template-specific fields
  @Column({ name: 'is_template', default: false })
  @ApiProperty({ 
    example: false, 
    description: 'Indicates if this meal plan is used as a template' 
  })
  isTemplate: boolean;

  @Column({ name: 'template_name', nullable: true })
  @ApiProperty({ 
    example: 'Plano Low Carb 1600kcal', 
    description: 'Name when used as template',
    required: false 
  })
  templateName?: string;

  @Column({ name: 'template_description', type: 'text', nullable: true })
  @ApiProperty({ 
    example: 'Template de plano alimentar low carb para perda de peso', 
    description: 'Description when used as template',
    required: false 
  })
  templateDescription?: string;

  @Column({ name: 'is_public', default: false })
  @ApiProperty({ 
    example: false, 
    description: 'If true, template is visible to all nutritionists' 
  })
  isPublic: boolean;

  @Column({ type: 'jsonb', nullable: true })
  @ApiProperty({ 
    example: ['lowcarb', 'emagrecimento', 'ativo'], 
    description: 'Tags for template categorization',
    required: false 
  })
  tags?: string[];

  @Column({ name: 'template_category', nullable: true })
  @ApiProperty({ 
    example: 'emagrecimento', 
    description: 'Category when used as template',
    required: false 
  })
  templateCategory?: string;

  @Column({ name: 'usage_count', default: 0 })
  @ApiProperty({ 
    example: 15, 
    description: 'Number of times this template has been used' 
  })
  usageCount: number;

  @Column({ name: 'target_calories', type: 'decimal', precision: 10, scale: 2, nullable: true })
  @ApiProperty({ 
    example: 1600, 
    description: 'Target calories for template (for filtering)',
    required: false 
  })
  targetCalories?: number;
}
