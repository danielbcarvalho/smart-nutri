import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Alimento,
  AlimentoDocument,
  createAlimentoIndexes,
} from '../schemas/alimento.schema';
import { Document, WithId } from 'mongodb';

@Injectable()
export class TbcaDatabaseService implements OnModuleInit {
  private readonly logger = new Logger(TbcaDatabaseService.name);
  private collectionName = 'alimentos';

  constructor(
    @InjectModel(Alimento.name)
    private readonly alimentoModel: Model<AlimentoDocument>,
  ) {
    this.logger.log('TbcaDatabaseService inicializado');
  }

  async onModuleInit() {
    await this.checkConnection();
    await this.detectCollection();
    await this.ensureIndexes();
  }

  private async detectCollection() {
    try {
      const mongoose = this.alimentoModel.db?.db;
      if (!mongoose) {
        this.logger.error('Não foi possível acessar a instância do MongoDB');
        return;
      }

      // Verificar nome do banco de dados
      this.logger.log(`Nome do banco de dados atual: ${mongoose.databaseName}`);

      // Se não está no banco correto, avisar
      if (mongoose.databaseName !== 'tbca_database') {
        this.logger.warn(
          `ATENÇÃO: Usando banco ${mongoose.databaseName} em vez de tbca_database!`,
        );
        this.logger.warn(
          'Os dados estão no banco tbca_database. Verifique a configuração da conexão.',
        );
      }

      // Verificar a coleção diretamente
      const count = await mongoose.collection('alimentos').countDocuments();
      this.logger.log(
        `A coleção ${mongoose.databaseName}.alimentos contém ${count} documentos`,
      );

      if (count === 0) {
        this.logger.warn('Nenhum documento encontrado na coleção alimentos!');
      }
    } catch (error) {
      this.logger.error(
        `Erro ao detectar coleções: ${error.message}`,
        error.stack,
      );
    }
  }

  async search(
    query: string,
    limit = 80,
    offset = 0,
  ): Promise<{ items: Alimento[]; total: number }> {
    const overallStart = Date.now();
    this.logger.log(
      `Realizando busca priorizada: "${query}" (limit: ${limit}, offset: ${offset})`,
    );

    function normalize(str: string) {
      return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    try {
      const mongoose = this.alimentoModel.db?.db;
      if (!mongoose) {
        this.logger.error('Não foi possível acessar a instância do MongoDB');
        return { items: [], total: 0 };
      }
      const collection = mongoose.collection(this.collectionName);
      const results: any[] = [];
      const ids = new Set<string>();
      let total = 0;
      const searchTerm = query?.trim() || '';
      if (!searchTerm) {
        return { items: [], total: 0 };
      }
      const normalizedTerm = normalize(searchTerm);
      const termsToTry = [searchTerm];
      if (normalizedTerm !== searchTerm) {
        termsToTry.push(normalizedTerm);
      }

      // Estratégia: buscar explicitamente o match exato antes das demais queries
      function normalizeFull(str: string) {
        return str
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[.,;:!?-\u036f\-_/\\()\[\]{}]/g, '')
          .replace(/\s+/g, ' ')
          .trim()
          .toLowerCase();
      }
      const normTerm = normalizeFull(searchTerm);
      let matchExato: any = null;
      // Buscar match exato (normalizado)
      for (const term of [searchTerm, normalizedTerm]) {
        const exato = await collection
          .find({ descricao: { $regex: `^${term}$`, $options: 'i' } })
          .toArray();
        this.logger.log(
          `[DEBUG] Resultados match exato (${term}): ${exato.map((e) => e.descricao).join(' | ')}`,
        );
        if (exato.length > 0) {
          // Encontrar o que tem nome normalizado igual
          matchExato =
            exato.find(
              (item) => normalizeFull(item.descricao || '') === normTerm,
            ) || exato[0];
          break;
        }
      }
      if (matchExato) {
        results.push(matchExato);
        ids.add(matchExato.codigo);
      }
      // Usar limit maior nas queries subsequentes
      const extraLimit = limit * 3;
      // 2. Começa com
      if (results.length < limit) {
        for (const term of [searchTerm, normalizedTerm]) {
          const items = await collection
            .find({
              descricao: { $regex: `^${term}`, $options: 'i' },
              codigo: { $ne: matchExato?.codigo },
            })
            .limit(extraLimit)
            .toArray();
          this.logger.log(
            `[DEBUG] Resultados começa com (${term}): ${items.map((e) => e.descricao).join(' | ')}`,
          );
          for (const item of items) {
            if (!ids.has(item.codigo)) {
              results.push(item);
              ids.add(item.codigo);
            }
          }
          if (results.length >= limit) break;
        }
      }
      // 3. Contém
      if (results.length < limit) {
        for (const term of [searchTerm, normalizedTerm]) {
          const items = await collection
            .find({
              descricao: { $regex: term, $options: 'i' },
              codigo: { $ne: matchExato?.codigo },
            })
            .limit(extraLimit)
            .toArray();
          this.logger.log(
            `[DEBUG] Resultados contém (${term}): ${items.map((e) => e.descricao).join(' | ')}`,
          );
          for (const item of items) {
            if (!ids.has(item.codigo)) {
              results.push(item);
              ids.add(item.codigo);
            }
          }
          if (results.length >= limit) break;
        }
      }
      // 4. Tags/descricao_simplificada
      if (results.length < limit) {
        for (const term of [searchTerm, normalizedTerm]) {
          const items = await collection
            .find({
              $or: [
                { descricao_simplificada: { $regex: term, $options: 'i' } },
                { tags: { $regex: term, $options: 'i' } },
              ],
              codigo: { $ne: matchExato?.codigo },
            })
            .limit(extraLimit)
            .toArray();
          this.logger.log(
            `[DEBUG] Resultados tags/descricao_simplificada (${term}): ${items.map((e) => e.descricao).join(' | ')}`,
          );
          for (const item of items) {
            if (!ids.has(item.codigo)) {
              results.push(item);
              ids.add(item.codigo);
            }
          }
          if (results.length >= limit) break;
        }
      }
      // DEBUG: Buscar explicitamente 'pão francês' puro (com ou sem acento)
      const paoFrancesPuro = await collection
        .find({ descricao: { $regex: /^p[aã]o francês$/i } })
        .toArray();
      this.logger.log(
        `[DEBUG] Busca direta por 'pão francês' puro: ${paoFrancesPuro.map((e) => e.descricao).join(' | ') || 'NENHUM ENCONTRADO'}`,
      );
      // Ordenação customizada pós-processamento (garante match exato no topo)
      const sorted = results.slice().sort((a, b) => {
        const na = normalizeFull(a.descricao || '');
        const nb = normalizeFull(b.descricao || '');
        // 1. Match exato
        const aExact = na === normTerm;
        const bExact = nb === normTerm;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        // 2. Começa com
        const aStarts = na.startsWith(normTerm);
        const bStarts = nb.startsWith(normTerm);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        // 3. Contém
        const aContains = na.includes(normTerm);
        const bContains = nb.includes(normTerm);
        if (aContains && !bContains) return -1;
        if (!aContains && bContains) return 1;
        // 4. Ordem alfabética
        return na.localeCompare(nb);
      });
      const paginated = sorted.slice(offset, offset + limit);
      total = results.length;
      this.logger.log(
        `[PRIORIDADE] Total retornado: ${paginated.length} de ${total}`,
      );
      const convertedItems = paginated.map((item) =>
        this.convertToAlimento(item),
      );
      const overallDuration = Date.now() - overallStart;
      this.logger.log(
        `[TOTAL PRIORIDADE] Tempo total da busca: ${overallDuration}ms`,
      );
      return { items: convertedItems, total };
    } catch (error) {
      this.logger.error(
        `Erro na busca por "${query}": ${error.message}`,
        error.stack,
      );
      return { items: [], total: 0 };
    }
  }

  private async checkConnection() {
    try {
      const mongoose = this.alimentoModel.db?.db;
      if (!mongoose) {
        this.logger.error('Não foi possível acessar a instância do MongoDB');
        return;
      }

      // Verificar a conexão geral do MongoDB
      const admin = mongoose.admin();
      const result = await admin.ping();
      this.logger.log(`Ping do MongoDB: ${JSON.stringify(result)}`);

      // Listar os bancos de dados disponíveis
      const dbs = await admin.listDatabases();
      this.logger.log(
        `Bancos de dados disponíveis: ${dbs.databases.map((db) => db.name).join(', ')}`,
      );

      // Verificar documentos na coleção padrão
      const count = await this.alimentoModel.countDocuments().exec();
      this.logger.log(
        `Conectado ao MongoDB. Total de documentos na coleção padrão: ${count}`,
      );

      if (count === 0) {
        this.logger.warn('A coleção de alimentos padrão está vazia!');
      }
    } catch (error) {
      this.logger.error(
        `Erro ao conectar ao MongoDB: ${error.message}`,
        error.stack,
      );
    }
  }

  private async ensureIndexes() {
    try {
      // Verifica se já existem índices
      const indexes = await this.alimentoModel.collection.indexes();
      const hasTextIndex = indexes.some((index) => index.textIndexVersion);

      if (!hasTextIndex || indexes.length < 5) {
        this.logger.log('Criando índices para a coleção alimentos...');
        await createAlimentoIndexes(this.alimentoModel);
      } else {
        this.logger.log(
          'Índices já existem. Total de índices:',
          indexes.length,
        );
      }
    } catch (error) {
      this.logger.error(
        `Erro ao verificar ou criar índices: ${error.message}`,
        error.stack,
      );
    }
  }

  async findByCode(codigo: string): Promise<Alimento | null> {
    this.logger.log(`Buscando alimento por código: ${codigo}`);
    try {
      const mongoose = this.alimentoModel.db?.db;
      if (!mongoose) {
        this.logger.error('Não foi possível acessar a instância do MongoDB');
        return null;
      }

      const collection = mongoose.collection(this.collectionName);
      const result = await collection.findOne({ codigo });

      this.logger.log(
        `Resultado da busca por código ${codigo}: ${result ? 'Encontrado' : 'Não encontrado'}`,
      );

      if (!result) {
        return null;
      }

      return this.convertToAlimento(result);
    } catch (error) {
      this.logger.error(
        `Erro ao buscar por código ${codigo}: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  private async checkTextIndex(): Promise<boolean> {
    try {
      const mongoose = this.alimentoModel.db?.db;
      if (!mongoose) {
        this.logger.error('Não foi possível acessar a instância do MongoDB');
        return false;
      }

      const collection = mongoose.collection(this.collectionName);
      const indexes = await collection.indexes();
      const hasTextIndex = indexes.some((index) => index.textIndexVersion);
      this.logger.log(
        `Índices disponíveis na coleção ${this.collectionName}: ${indexes.length}, Índice de texto: ${hasTextIndex ? 'Sim' : 'Não'}`,
      );
      return hasTextIndex;
    } catch (error) {
      this.logger.error(`Erro ao verificar índices: ${error.message}`);
      return false;
    }
  }

  async findByNutrientRange(
    nutrient: string,
    minValue?: number,
    maxValue?: number,
    limit = 80,
    offset = 0,
  ): Promise<{ items: Alimento[]; total: number }> {
    try {
      const mongoose = this.alimentoModel.db?.db;
      if (!mongoose) {
        this.logger.error('Não foi possível acessar a instância do MongoDB');
        return { items: [], total: 0 };
      }

      const collection = mongoose.collection(this.collectionName);
      const query: any = {};

      if (minValue !== undefined || maxValue !== undefined) {
        query[`nutrientes.${nutrient}.valor`] = {};

        if (minValue !== undefined) {
          query[`nutrientes.${nutrient}.valor`].$gte = minValue;
        }

        if (maxValue !== undefined) {
          query[`nutrientes.${nutrient}.valor`].$lte = maxValue;
        }
      }

      this.logger.log(
        `Buscando alimentos por nutriente: ${nutrient} (min: ${minValue}, max: ${maxValue})`,
      );

      const [items, total] = await Promise.all([
        collection.find(query).skip(offset).limit(limit).toArray(),
        collection.countDocuments(query),
      ]);

      const convertedItems = items.map((item) => this.convertToAlimento(item));
      this.logger.log(
        `Resultados encontrados: ${convertedItems.length} de ${total}`,
      );

      return { items: convertedItems, total };
    } catch (error) {
      this.logger.error(
        `Erro ao buscar por nutriente: ${error.message}`,
        error.stack,
      );
      return { items: [], total: 0 };
    }
  }

  async findByClass(
    classe: string,
    limit = 80,
    offset = 0,
  ): Promise<{ items: Alimento[]; total: number }> {
    try {
      const mongoose = this.alimentoModel.db?.db;
      if (!mongoose) {
        this.logger.error('Não foi possível acessar a instância do MongoDB');
        return { items: [], total: 0 };
      }

      const collection = mongoose.collection(this.collectionName);
      const query = { classe };
      this.logger.log(`Buscando alimentos por classe: ${classe}`);

      const [items, total] = await Promise.all([
        collection.find(query).skip(offset).limit(limit).toArray(),
        collection.countDocuments(query),
      ]);

      const convertedItems = items.map((item) => this.convertToAlimento(item));
      this.logger.log(
        `Resultados encontrados: ${convertedItems.length} de ${total}`,
      );

      return { items: convertedItems, total };
    } catch (error) {
      this.logger.error(
        `Erro ao buscar por classe: ${error.message}`,
        error.stack,
      );
      return { items: [], total: 0 };
    }
  }

  // Converter um documento do MongoDB para o formato de Alimento
  private convertToAlimento(doc: WithId<Document>): Alimento {
    // Criar um objeto básico com propriedades padrão
    const alimento: Partial<Alimento> = {
      codigo: doc.codigo || doc._id?.toString() || 'unknown',
      classe: doc.classe || doc.category || 'Não classificado',
      descricao:
        doc.descricao ||
        doc.description ||
        doc.nome ||
        doc.name ||
        'Sem descrição',
      descricao_simplificada:
        doc.descricao_simplificada || doc.descricao || doc.description || '',
      tags: doc.tags || [],
      nutrientes: doc.nutrientes || {},
      metadados: doc.metadados || {
        ultima_atualizacao: new Date(),
        fonte: doc.fonte || 'Desconhecida',
        versao_scraper: doc.versao_scraper || '1.0',
      },
    };

    return alimento as Alimento;
  }
}
