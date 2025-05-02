import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Food } from './entities/food.entity';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { SearchFoodDto } from './dto/search-food.dto';
import { TbcaDatabaseService } from './services/tbca-database.service';
import { AlimentoToFoodAdapter } from './adapters/alimento-to-food.adapter';

@Injectable()
export class FoodsService {
  constructor(
    @InjectRepository(Food)
    private readonly foodsRepository: Repository<Food>,
    private readonly tbcaDatabaseService: TbcaDatabaseService,
  ) {}

  async saveFromApi(externalId: string): Promise<Food> {
    // Verifica se o alimento já existe no banco
    const existingFood = await this.foodsRepository.findOne({
      where: { externalId },
    });

    if (existingFood) {
      return existingFood;
    }

    // Buscar o alimento no TBCA
    const tbcaAlimento = await this.tbcaDatabaseService.findByCode(externalId);
    if (!tbcaAlimento) {
      throw new NotFoundException(
        `Alimento com código ${externalId} não encontrado na base TBCA`,
      );
    }

    // Converter e salvar no banco local
    const food = AlimentoToFoodAdapter.adapt(tbcaAlimento);
    return this.foodsRepository.save(food);
  }

  async search(searchFoodDto: SearchFoodDto): Promise<Food[]> {
    const { query, page = 0, pageSize = 20 } = searchFoodDto;

    const overallStart = Date.now();
    console.log('[FoodsService] Valor recebido em query:', query);
    let localFoods: Food[] = [];

    try {
      const localStart = Date.now();
      // Primeiro, procura no cache local
      localFoods = await this.foodsRepository
        .createQueryBuilder('food')
        .where('food.name ILIKE :query', { query: `%${query}%` })
        .orWhere(':query = ANY(food.categories)', { query })
        .take(pageSize)
        .skip(page * pageSize)
        .orderBy('food.usage_count_meal_plans', 'DESC')
        .addOrderBy('food.name', 'ASC')
        .getMany();
      const localDuration = Date.now() - localStart;
      console.log(`[FoodsService] Tempo busca local: ${localDuration}ms`);

      // Se encontrou resultados suficientes no cache, retorna
      if (localFoods.length >= pageSize) {
        const overallDuration = Date.now() - overallStart;
        console.log(
          `[FoodsService] Tempo total (apenas local): ${overallDuration}ms`,
        );
        return localFoods;
      }

      // Busca no TBCA
      const tbcaStart = Date.now();
      const tbcaResponse = await this.tbcaDatabaseService.search(
        query,
        pageSize - localFoods.length,
        page * pageSize,
      );
      const tbcaDuration = Date.now() - tbcaStart;
      console.log(`[FoodsService] Tempo busca TBCA: ${tbcaDuration}ms`);

      if (!tbcaResponse?.items?.length) {
        const overallDuration = Date.now() - overallStart;
        console.log(
          `[FoodsService] Tempo total (local + TBCA vazio): ${overallDuration}ms`,
        );
        return localFoods;
      }

      // Converte os resultados do TBCA para Food entities
      const convertStart = Date.now();
      const tbcaFoods = tbcaResponse.items.map((alimento) =>
        AlimentoToFoodAdapter.adapt(alimento),
      );
      const convertDuration = Date.now() - convertStart;
      console.log(
        `[FoodsService] Tempo conversão TBCA->Food: ${convertDuration}ms`,
      );

      // Salva os alimentos do TBCA no cache local se ainda não existirem (batch)
      const saveStart = Date.now();
      // Buscar todos os externalIds dos alimentos do TBCA
      const externalIds = tbcaFoods
        .map((food) => food.externalId)
        .filter(Boolean);
      let existingFoods: Food[] = [];
      if (externalIds.length > 0) {
        existingFoods = await this.foodsRepository.find({
          where: { externalId: In(externalIds) },
          select: ['externalId'],
        });
      }
      const existingIds = new Set(existingFoods.map((f) => f.externalId));
      const newFoods = tbcaFoods.filter(
        (food) => !existingIds.has(food.externalId),
      );
      if (newFoods.length > 0) {
        await this.foodsRepository.save(newFoods);
      }
      const saveDuration = Date.now() - saveStart;
      console.log(
        `[FoodsService] Tempo salvando TBCA no local (batch): ${saveDuration}ms | novos: ${newFoods.length} | já existiam: ${existingIds.size}`,
      );

      // Combina os resultados
      const results = [...localFoods, ...tbcaFoods];
      const overallDuration = Date.now() - overallStart;
      console.log(`[FoodsService] Tempo total da busca: ${overallDuration}ms`);
      return results.slice(0, pageSize);
    } catch (error) {
      console.error(
        'Erro na busca:',
        error instanceof Error ? error.message : error,
      );
      // Se houver erro, retorna ao menos os resultados locais
      return localFoods;
    }
  }

  // Método para buscar alimento diretamente do TBCA por código
  async findByTbcaCode(codigo: string): Promise<Food | null> {
    // Primeiro verifica se já existe no cache local
    const existingFood = await this.foodsRepository.findOne({
      where: { sourceId: codigo, source: 'TBCA' },
    });

    if (existingFood) {
      return existingFood;
    }

    // Se não existir, busca no TBCA
    const tbcaAlimento = await this.tbcaDatabaseService.findByCode(codigo);
    if (!tbcaAlimento) {
      return null;
    }

    // Converte e salva no cache local
    const food = AlimentoToFoodAdapter.adapt(tbcaAlimento);
    return this.foodsRepository.save(food);
  }

  // Método para buscar alimentos por classe
  async findByClass(classe: string, limit = 80, offset = 0): Promise<Food[]> {
    try {
      const tbcaResponse = await this.tbcaDatabaseService.findByClass(
        classe,
        limit,
        offset,
      );

      if (!tbcaResponse?.items?.length) {
        return [];
      }

      // Converte os resultados do TBCA para Food entities
      return tbcaResponse.items.map((alimento) =>
        AlimentoToFoodAdapter.adapt(alimento),
      );
    } catch (error) {
      console.error('Erro ao buscar alimentos por classe:', error);
      return [];
    }
  }

  // Método para buscar alimentos por faixa de nutriente
  async findByNutrientRange(
    nutrient: string,
    minValue?: number,
    maxValue?: number,
    limit = 80,
    offset = 0,
  ): Promise<Food[]> {
    try {
      const tbcaResponse = await this.tbcaDatabaseService.findByNutrientRange(
        nutrient,
        minValue,
        maxValue,
        limit,
        offset,
      );

      if (!tbcaResponse?.items?.length) {
        return [];
      }

      // Converte os resultados do TBCA para Food entities
      return tbcaResponse.items.map((alimento) =>
        AlimentoToFoodAdapter.adapt(alimento),
      );
    } catch (error) {
      console.error('Erro ao buscar alimentos por nutriente:', error);
      return [];
    }
  }

  // Métodos existentes abaixo
  async create(createFoodDto: CreateFoodDto): Promise<Food> {
    const food = this.foodsRepository.create(createFoodDto);
    return await this.foodsRepository.save(food);
  }

  async findAll(): Promise<Food[]> {
    return await this.foodsRepository.find({
      order: {
        usageCountMealPlans: 'DESC',
        name: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<Food> {
    const food = await this.foodsRepository.findOne({ where: { id } });
    if (!food) {
      throw new NotFoundException(`Food with ID ${id} not found`);
    }
    return food;
  }

  async update(id: string, updateFoodDto: UpdateFoodDto): Promise<Food> {
    const food = await this.findOne(id);
    Object.assign(food, updateFoodDto);
    return await this.foodsRepository.save(food);
  }

  async remove(id: string): Promise<void> {
    const food = await this.findOne(id);
    await this.foodsRepository.remove(food);
  }

  async toggleFavorite(id: string): Promise<Food> {
    const food = await this.findOne(id);
    food.isFavorite = !food.isFavorite;
    return await this.foodsRepository.save(food);
  }

  async incrementUsageCount(id: string): Promise<void> {
    await this.foodsRepository.increment({ id }, 'usageCount', 1);
  }

  async getFavorites(): Promise<Food[]> {
    return await this.foodsRepository.find({
      where: { isFavorite: true },
      order: {
        name: 'ASC',
      },
    });
  }
}
