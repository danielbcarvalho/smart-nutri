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

  @ManyToOne(() => Meal, (meal) => meal.mealFoods, {
    onDelete: 'CASCADE',
  })
  meal: Meal;

  @ManyToOne(() => Food, {
    onDelete: 'NO ACTION',
  })
  food: Food;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  amount: number; // Quantidade em gramas ou ml

  @Column()
  unit: string; // g, ml, etc

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
