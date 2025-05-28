import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MealFood } from './meal-food.entity';

@Entity('food_substitutes')
export class FoodSubstitute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'original_food_id' })
  originalFoodId: string;

  @Column({ name: 'original_source' })
  originalSource: string;

  @Column({ name: 'substitute_food_id' })
  substituteFoodId: string;

  @Column({ name: 'substitute_source' })
  substituteSource: string;

  @Column({ name: 'substitute_amount', type: 'numeric' })
  substituteAmount: number;

  @Column({ name: 'substitute_unit' })
  substituteUnit: string;

  @Column({ name: 'nutritionist_id' })
  nutritionistId: string;

  @ManyToOne(() => MealFood)
  @JoinColumn([
    { name: 'original_food_id', referencedColumnName: 'foodId' },
    { name: 'original_source', referencedColumnName: 'source' },
  ])
  mealFood: MealFood;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
