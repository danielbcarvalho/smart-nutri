import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Meal } from './meal.entity';
import { Food } from '../../foods/entities/food.entity';

@Entity('meal_foods')
export class MealFood {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Meal, meal => meal.mealFoods)
  meal: Meal;

  @ManyToOne(() => Food)
  food: Food;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number; // Quantidade em gramas ou ml

  @Column()
  unit: string; // g, ml, etc

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
