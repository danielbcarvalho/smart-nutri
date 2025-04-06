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
import { Patient } from '../../patients/entities/patient.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('meal_plans')
export class MealPlan {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @Column()
  @ApiProperty({ example: 'Plano Alimentar Semanal' })
  name: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ example: 'Plano alimentar para perda de peso' })
  notes: string;

  @Column({ type: 'date' })
  @ApiProperty({ example: '2024-03-20' })
  startDate: Date;

  @Column({ type: 'date' })
  @ApiProperty({ example: '2024-03-27' })
  endDate: Date;

  @ManyToOne(() => Patient, (patient) => patient.mealPlans, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patient_id' })
  @ApiProperty({ type: () => Patient })
  patient: Patient;

  @Column({ name: 'patient_id' })
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  patientId: string;

  @OneToMany(() => Meal, (meal) => meal.mealPlan, {
    cascade: true,
  })
  @ApiProperty({ type: () => [Meal] })
  meals: Meal[];

  @CreateDateColumn()
  @ApiProperty({ example: '2024-03-20T10:00:00Z' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ example: '2024-03-20T10:00:00Z' })
  updatedAt: Date;
}
