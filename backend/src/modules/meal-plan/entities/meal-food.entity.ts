import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Meal } from './meal.entity';

@Entity('meal_foods')
export class MealFood {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 8, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 100 })
  unit: string;

  @Column({ type: 'varchar', length: 100 })
  foodId: string;

  @Column({ type: 'varchar', length: 50 })
  source: string;

  @Column({ type: 'uuid', nullable: false })
  mealId: string;

  @ManyToOne(() => Meal, (meal) => meal.mealFoods, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'mealId' })
  meal: Meal;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
