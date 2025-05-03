import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { MealPlanTemplate } from './meal-plan-template.entity';
import { FoodTemplate } from './food-template.entity';

@Entity('meal_templates')
export class MealTemplate {
  @ApiProperty({ description: 'ID do template da refeição' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID do template do plano alimentar' })
  @Column({ name: 'plan_template_id' })
  planTemplateId: string;

  @ManyToOne(() => MealPlanTemplate, (planTemplate) => planTemplate.meals)
  @JoinColumn({ name: 'plan_template_id' })
  planTemplate: MealPlanTemplate;

  @ApiProperty({ description: 'Nome da refeição' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Descrição da refeição' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Horário da refeição' })
  @Column({ type: 'time', nullable: true })
  time: string;

  @ApiProperty({ description: 'Ordem da refeição' })
  @Column({ name: 'order_index' })
  orderIndex: number;

  @OneToMany(() => FoodTemplate, (foodTemplate) => foodTemplate.meal)
  foods: FoodTemplate[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
