import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

@Schema()
class Nutriente {
  @Prop({ type: mongoose.Schema.Types.Mixed })
  valor: number | string;

  @Prop()
  unidade: string;
}

export type AlimentoDocument = Alimento & Document;

@Schema({ timestamps: true })
export class Alimento {
  @Prop({ required: true })
  codigo: string;

  @Prop({ required: true })
  classe: string;

  @Prop({ required: true })
  descricao: string;

  @Prop()
  descricao_simplificada: string;

  @Prop([String])
  tags: string[];

  @Prop({ type: Object })
  nutrientes: Record<string, Nutriente>;

  @Prop([Object])
  nutrientes_array: Array<{
    componente: string;
    unidade: string;
    valor_por_100g: number | string;
  }>;

  @Prop({ type: Object })
  metadados: {
    ultima_atualizacao: Date;
    fonte: string;
    versao_scraper: string;
  };
}

export const AlimentoSchema = SchemaFactory.createForClass(Alimento);

// Configurar índices no schema
AlimentoSchema.index({ codigo: 1 }, { unique: true });
AlimentoSchema.index({ classe: 1 });
AlimentoSchema.index(
  { descricao: 'text', descricao_simplificada: 'text', tags: 'text' },
  { weights: { descricao: 10, descricao_simplificada: 5, tags: 1 } },
);
AlimentoSchema.index({ 'nutrientes.proteina.valor': 1 });
AlimentoSchema.index({ 'nutrientes.energia_kcal.valor': 1 });
AlimentoSchema.index({ 'nutrientes.carboidrato_total.valor': 1 });
AlimentoSchema.index({ 'nutrientes.lipidios.valor': 1 });

// Método helper para criar os índices manualmente se necessário
export const createAlimentoIndexes = async (model: mongoose.Model<any>) => {
  try {
    await model.collection.createIndex({ codigo: 1 }, { unique: true });
    await model.collection.createIndex({ classe: 1 });
    await model.collection.createIndex(
      { descricao: 'text', descricao_simplificada: 'text', tags: 'text' },
      { weights: { descricao: 10, descricao_simplificada: 5, tags: 1 } },
    );
    await model.collection.createIndex({ 'nutrientes.proteina.valor': 1 });
    await model.collection.createIndex({ 'nutrientes.energia_kcal.valor': 1 });
    await model.collection.createIndex({
      'nutrientes.carboidrato_total.valor': 1,
    });
    await model.collection.createIndex({ 'nutrientes.lipidios.valor': 1 });
    console.log('Todos os índices para Alimento foram criados com sucesso');
  } catch (error) {
    console.error('Erro ao criar índices:', error);
  }
};
