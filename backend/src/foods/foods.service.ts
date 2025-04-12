import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Food } from './entities/food.entity';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { SearchFoodDto } from './dto/search-food.dto';
import { OpenFoodFactsService } from './services/openfoodfacts.service';

@Injectable()
export class FoodsService {
  constructor(
    @InjectRepository(Food)
    private readonly foodsRepository: Repository<Food>,
    private readonly openFoodFactsService: OpenFoodFactsService,
  ) {}

  async saveFromApi(externalId: string): Promise<Food> {
    // Verifica se o alimento já existe no banco
    const existingFood = await this.foodsRepository.findOne({
      where: { externalId },
    });

    if (existingFood) {
      return existingFood;
    }

    // Busca o alimento na API
    const product = await this.openFoodFactsService.getFood(externalId);

    // Cria um novo alimento com os dados da API
    const food = new Food();
    food.externalId = product._id;
    food.name = product.product_name;
    food.servingSize = 100; // Open Food Facts usa 100g como padrão
    food.servingUnit = 'g';
    food.calories = product.nutriments['energy-kcal_100g'] || 0;
    food.protein = product.nutriments.proteins_100g || 0;
    food.carbohydrates = product.nutriments.carbohydrates_100g || 0;
    food.fat = product.nutriments.fat_100g || 0;
    food.fiber = product.nutriments.fiber_100g || 0;
    food.sugar = product.nutriments.sugars_100g || 0;
    food.sodium = product.nutriments.sodium_100g || 0;
    food.categories =
      product.categories_tags?.map((c) => c.replace('en:', '')) || [];

    // Salva no banco de dados
    return this.foodsRepository.save(food);
  }

  async search(searchFoodDto: SearchFoodDto): Promise<Food[]> {
    const { query, page = 0, pageSize = 20 } = searchFoodDto;
    console.log('Iniciando busca com query:', query);

    let localFoods: Food[] = [];

    try {
      // Primeiro, procura no cache local
      console.log('Buscando no cache local...');
      localFoods = await this.foodsRepository
        .createQueryBuilder('food')
        .where('food.name ILIKE :query', { query: `%${query}%` })
        .orWhere(':query = ANY(food.categories)', { query })
        .take(pageSize)
        .skip(page * pageSize)
        .orderBy('food.usageCount', 'DESC')
        .addOrderBy('food.name', 'ASC')
        .getMany();

      console.log('Resultados do cache local:', localFoods.length);

      // Se encontrou resultados suficientes no cache, retorna
      if (localFoods.length >= pageSize) {
        console.log('Cache suficiente, retornando resultados locais');
        return localFoods;
      }

      // Caso contrário, busca na API do Open Food Facts
      console.log('Buscando na API do Open Food Facts...');
      const openFoodResponse = await this.openFoodFactsService.searchFoods(
        query,
        page + 1, // Open Food Facts usa página 1-based
        pageSize - localFoods.length,
      );

      if (!openFoodResponse?.products?.length) {
        console.log(
          'Sem resultados do Open Food Facts, retornando apenas cache local',
        );
        return localFoods;
      }

      // Transforma os resultados do Open Food Facts em Food entities
      const openFoodFoods = openFoodResponse.products.map((product) => {
        const food = new Food();
        food.externalId = product._id;
        food.name = product.product_name;
        food.calories = product.nutriments['energy-kcal_100g'] || 0;
        food.protein = product.nutriments.proteins_100g || 0;
        food.carbohydrates = product.nutriments.carbohydrates_100g || 0;
        food.fat = product.nutriments.fat_100g || 0;
        food.fiber = product.nutriments.fiber_100g || 0;
        food.sugar = product.nutriments.sugars_100g || 0;
        food.sodium = product.nutriments.sodium_100g || 0;
        food.categories =
          product.categories_tags?.map((c) => c.replace('en:', '')) || [];
        return food;
      });

      console.log(
        'Resultados do Open Food Facts transformados:',
        openFoodFoods.length,
      );

      // Combina os resultados
      const results = [...localFoods, ...openFoodFoods];
      console.log('Total de resultados:', results.length);
      return results;
    } catch (error) {
      console.error(
        'Erro na busca:',
        error instanceof Error ? error.message : error,
      );
      // Se houver erro na API externa, retorna ao menos os resultados locais
      return localFoods;
    }
  }

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
