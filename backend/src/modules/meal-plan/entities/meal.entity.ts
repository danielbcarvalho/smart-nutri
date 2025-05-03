import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { MealPlan } from './meal-plan.entity';
import { MealFood } from './meal-food.entity';

@Entity('meals')
export class Meal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // Café da manhã, Almoço, etc.

  @Column({
    type: 'time',
    transformer: {
      to: (value: string | null) => {
        if (!value) return null;
        return value.split(':').slice(0, 2).join(':');
      },
      from: (value: string | null) => {
        if (!value) return null;
        return value.split(':').slice(0, 2).join(':');
      },
    },
  })
  time: string; // Horário da refeição

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => MealPlan, (mealPlan) => mealPlan.meals, {
    onDelete: 'CASCADE',
  })
  mealPlan: MealPlan;

  @OneToMany(() => MealFood, (mealFood) => mealFood.meal, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  mealFoods: MealFood[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  @ApiProperty({ example: 500.25 })
  totalCalories: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  @ApiProperty({ example: 30.5 })
  totalProtein: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  @ApiProperty({ example: 60.75 })
  totalCarbs: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  @ApiProperty({ example: 20.3 })
  totalFat: number;
}
