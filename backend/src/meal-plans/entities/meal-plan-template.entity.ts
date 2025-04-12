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
import { Nutritionist } from '../../nutritionists/entities/nutritionist.entity';
import { MealTemplate } from './meal-template.entity';

@Entity('meal_plan_templates')
export class MealPlanTemplate {
  @ApiProperty({ description: 'ID do template do plano alimentar' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Nome do template' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Descrição do template' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'ID do nutricionista' })
  @Column({ name: 'nutritionist_id', nullable: true })
  nutritionistId: string;

  @ManyToOne(
    () => Nutritionist,
    (nutritionist) => nutritionist.mealPlanTemplates,
  )
  @JoinColumn({ name: 'nutritionist_id' })
  nutritionist: Nutritionist;

  @ApiProperty({ description: 'Se o template é público' })
  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  @ApiProperty({ description: 'Tags do template' })
  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @OneToMany(() => MealTemplate, (mealTemplate) => mealTemplate.planTemplate)
  meals: MealTemplate[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
