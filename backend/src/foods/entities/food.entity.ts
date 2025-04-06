import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('foods')
export class Food {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  externalId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  servingSize: number;

  @Column()
  servingUnit: string;

  @Column('decimal', { precision: 10, scale: 2 })
  calories: number;

  @Column('decimal', { precision: 10, scale: 2 })
  protein: number;

  @Column('decimal', { precision: 10, scale: 2 })
  carbohydrates: number;

  @Column('decimal', { precision: 10, scale: 2 })
  fat: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  fiber: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  sugar: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  sodium: number;

  @Column('jsonb', { nullable: true })
  additionalNutrients: Record<string, number>;

  @Column('text', { array: true, default: [] })
  categories: string[];

  @Column({ default: false })
  isFavorite: boolean;

  @Column({ default: 0 })
  usageCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
