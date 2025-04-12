import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { MealTemplate } from './meal-template.entity';

@Entity('food_templates')
export class FoodTemplate {
  @ApiProperty({ description: 'ID do template do alimento' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID do template da refeição' })
  @Column({ name: 'meal_template_id' })
  mealTemplateId: string;

  @ManyToOne(() => MealTemplate, (mealTemplate) => mealTemplate.foods)
  @JoinColumn({ name: 'meal_template_id' })
  meal: MealTemplate;

  @ApiProperty({ description: 'Nome do alimento' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Porção do alimento' })
  @Column()
  portion: string;

  @ApiProperty({ description: 'Calorias' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  calories: number;

  @ApiProperty({ description: 'Proteínas (g)' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  protein: number;

  @ApiProperty({ description: 'Carboidratos (g)' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  carbs: number;

  @ApiProperty({ description: 'Gorduras (g)' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fat: number;

  @ApiProperty({ description: 'Categoria do alimento' })
  @Column({ nullable: true })
  category: string;

  @ApiProperty({ description: 'Tags do alimento' })
  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column({ type: 'tsvector', select: false })
  searchVector: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
