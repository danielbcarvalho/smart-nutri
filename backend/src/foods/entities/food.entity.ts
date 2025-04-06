import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('foods')
export class Food {
  @ApiProperty({
    description: 'ID único do alimento',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Nome do alimento',
    example: 'Maçã Fuji',
    minLength: 2,
    maxLength: 100,
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'ID do alimento na API externa (FatSecret)',
    example: '123456',
    nullable: true,
  })
  @Column({ nullable: true })
  externalId: string;

  @ApiProperty({
    description: 'Tamanho da porção em gramas ou mililitros',
    example: 100,
    minimum: 0,
  })
  @Column('decimal', { precision: 10, scale: 2 })
  servingSize: number;

  @ApiProperty({
    description: 'Unidade de medida da porção',
    example: 'g',
    enum: ['g', 'ml', 'unidade', 'colher', 'xícara'],
  })
  @Column()
  servingUnit: string;

  @ApiProperty({
    description: 'Quantidade de calorias por porção (kcal)',
    example: 52,
    minimum: 0,
  })
  @Column('decimal', { precision: 10, scale: 2 })
  calories: number;

  @ApiProperty({
    description: 'Quantidade de proteínas por porção (g)',
    example: 0.3,
    minimum: 0,
  })
  @Column('decimal', { precision: 10, scale: 2 })
  protein: number;

  @ApiProperty({
    description: 'Quantidade de carboidratos por porção (g)',
    example: 13.8,
    minimum: 0,
  })
  @Column('decimal', { precision: 10, scale: 2 })
  carbohydrates: number;

  @ApiProperty({
    description: 'Quantidade de gorduras por porção (g)',
    example: 0.2,
    minimum: 0,
  })
  @Column('decimal', { precision: 10, scale: 2 })
  fat: number;

  @ApiProperty({
    description: 'Quantidade de fibras por porção (g)',
    example: 2.4,
    minimum: 0,
    nullable: true,
  })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  fiber: number;

  @ApiProperty({
    description: 'Quantidade de açúcares por porção (g)',
    example: 10.4,
    minimum: 0,
    nullable: true,
  })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  sugar: number;

  @ApiProperty({
    description: 'Quantidade de sódio por porção (mg)',
    example: 1,
    minimum: 0,
    nullable: true,
  })
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  sodium: number;

  @ApiProperty({
    description: 'Outros nutrientes e suas quantidades',
    example: {
      'Vitamina C': 4.6,
      Potássio: 107,
    },
    nullable: true,
  })
  @Column('jsonb', { nullable: true })
  additionalNutrients: Record<string, number>;

  @ApiProperty({
    description: 'Categorias que o alimento pertence',
    example: ['Frutas', 'Frutas frescas'],
    type: [String],
    default: [],
  })
  @Column('text', { array: true, default: [] })
  categories: string[];

  @ApiProperty({
    description: 'Indica se o alimento está marcado como favorito',
    example: false,
    default: false,
  })
  @Column({ default: false })
  isFavorite: boolean;

  @ApiProperty({
    description:
      'Número de vezes que o alimento foi usado em planos alimentares',
    example: 0,
    default: 0,
  })
  @Column({ default: 0 })
  usageCount: number;

  @ApiProperty({
    description: 'Data de criação do registro',
    example: '2024-03-20T10:00:00Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização do registro',
    example: '2024-03-20T10:00:00Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
