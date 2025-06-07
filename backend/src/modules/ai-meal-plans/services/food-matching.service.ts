import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';

import { Food } from '../../foods/entities/food.entity';

interface FoodMatch {
  food: Food;
  score: number;
  matchType: 'exact' | 'partial' | 'fuzzy';
}

interface FoodMatchResult {
  originalName: string;
  matches: FoodMatch[];
  bestMatch?: Food;
  confidence: number;
}

@Injectable()
export class FoodMatchingService {
  private readonly logger = new Logger(FoodMatchingService.name);

  constructor(
    @InjectRepository(Food)
    private readonly foodRepository: Repository<Food>,
  ) {}

  async matchFoodsWithDatabase(foodNames: string[]): Promise<FoodMatchResult[]> {
    this.logger.log(`Matching ${foodNames.length} foods with TBCA database`);
    
    const results: FoodMatchResult[] = [];
    
    for (const foodName of foodNames) {
      const matchResult = await this.findBestMatch(foodName);
      results.push(matchResult);
    }
    
    this.logger.log(`Food matching completed. Results: ${results.length}`);
    return results;
  }

  async findBestMatch(foodName: string): Promise<FoodMatchResult> {
    const normalizedName = this.normalizeString(foodName);
    const matches: FoodMatch[] = [];
    
    // 1. Exact match
    const exactMatches = await this.foodRepository.find({
      where: { name: foodName },
    });
    
    for (const food of exactMatches) {
      matches.push({
        food,
        score: 1.0,
        matchType: 'exact',
      });
    }
    
    // 2. Partial match (contains)
    if (matches.length === 0) {
      const partialMatches = await this.foodRepository.find({
        where: { name: Like(`%${foodName}%`) },
        take: 10,
      });
      
      for (const food of partialMatches) {
        const score = this.calculateSimilarityScore(normalizedName, this.normalizeString(food.name));
        matches.push({
          food,
          score,
          matchType: 'partial',
        });
      }
    }
    
    // 3. Fuzzy match (similar words)
    if (matches.length === 0) {
      const allFoods = await this.foodRepository.find({
        take: 500, // Limit for performance
      });
      
      for (const food of allFoods) {
        const score = this.calculateFuzzyScore(normalizedName, this.normalizeString(food.name));
        if (score > 0.5) { // Only include reasonably similar matches
          matches.push({
            food,
            score,
            matchType: 'fuzzy',
          });
        }
      }
    }
    
    // Sort by score (highest first)
    matches.sort((a, b) => b.score - a.score);
    
    const bestMatch = matches.length > 0 ? matches[0].food : undefined;
    const confidence = matches.length > 0 ? matches[0].score : 0;
    
    return {
      originalName: foodName,
      matches: matches.slice(0, 5), // Return top 5 matches
      bestMatch,
      confidence,
    };
  }

  async findSimilarFoods(foodId: string, limit: number = 5): Promise<Food[]> {
    const targetFood = await this.foodRepository.findOne({
      where: { id: foodId },
    });
    
    if (!targetFood) {
      return [];
    }
    
    // Find foods with similar nutritional profile
    const similarFoods = await this.foodRepository
      .createQueryBuilder('food')
      .where('food.id != :foodId', { foodId })
      .andWhere('ABS(food.calories - :calories) <= :calorieRange', {
        calories: targetFood.calories,
        calorieRange: targetFood.calories * 0.2, // Within 20%
      })
      .andWhere('ABS(food.protein - :protein) <= :proteinRange', {
        protein: targetFood.protein,
        proteinRange: Math.max(targetFood.protein * 0.3, 2), // Within 30% or 2g
      })
      .orderBy('ABS(food.calories - :targetCalories)', 'ASC')
      .setParameter('targetCalories', targetFood.calories)
      .take(limit)
      .getMany();
    
    return similarFoods;
  }

  async findFoodAlternatives(
    originalFoodId: string,
    restrictions: string[] = [],
    preferences: string[] = [],
  ): Promise<Food[]> {
    const originalFood = await this.foodRepository.findOne({
      where: { id: originalFoodId },
    });
    
    if (!originalFood) {
      return [];
    }
    
    let query = this.foodRepository
      .createQueryBuilder('food')
      .where('food.id != :foodId', { foodId: originalFoodId });
    
    // Apply dietary restrictions
    for (const restriction of restrictions) {
      switch (restriction.toLowerCase()) {
        case 'vegetariano':
        case 'vegano':
          // Exclude meat, fish, dairy (for vegan)
          query = query.andWhere('food.name NOT ILIKE ANY(ARRAY[:...meatKeywords])', {
            meatKeywords: ['%carne%', '%frango%', '%peixe%', '%pork%', '%beef%'],
          });
          if (restriction.toLowerCase() === 'vegano') {
            query = query.andWhere('food.name NOT ILIKE ANY(ARRAY[:...dairyKeywords])', {
              dairyKeywords: ['%leite%', '%queijo%', '%iogurte%', '%manteiga%'],
            });
          }
          break;
        case 'sem glúten':
          query = query.andWhere('food.name NOT ILIKE ANY(ARRAY[:...glutenKeywords])', {
            glutenKeywords: ['%trigo%', '%aveia%', '%centeio%', '%cevada%', '%pão%'],
          });
          break;
        case 'sem lactose':
          query = query.andWhere('food.name NOT ILIKE ANY(ARRAY[:...lactoseKeywords])', {
            lactoseKeywords: ['%leite%', '%queijo%', '%iogurte%', '%manteiga%'],
          });
          break;
      }
    }
    
    // Find nutritionally similar foods
    query = query
      .andWhere('ABS(food.calories - :calories) <= :calorieRange', {
        calories: originalFood.calories,
        calorieRange: originalFood.calories * 0.25,
      })
      .orderBy('ABS(food.calories - :targetCalories)', 'ASC')
      .setParameter('targetCalories', originalFood.calories)
      .take(10);
    
    return await query.getMany();
  }

  private normalizeString(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .trim();
  }

  private calculateSimilarityScore(str1: string, str2: string): number {
    if (str1 === str2) return 1.0;
    
    // Jaccard similarity based on words
    const words1 = new Set(str1.split(/\s+/));
    const words2 = new Set(str2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  private calculateFuzzyScore(str1: string, str2: string): number {
    // Levenshtein distance based similarity
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    
    if (maxLength === 0) return 1.0;
    
    return 1 - (distance / maxLength);
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }
    
    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        if (str1[i - 1] === str2[j - 1]) {
          matrix[j][i] = matrix[j - 1][i - 1];
        } else {
          matrix[j][i] = Math.min(
            matrix[j - 1][i] + 1, // deletion
            matrix[j][i - 1] + 1, // insertion
            matrix[j - 1][i - 1] + 1 // substitution
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  async validateFoodAvailability(foodIds: string[]): Promise<{
    available: string[];
    unavailable: string[];
  }> {
    const foods = await this.foodRepository.find({
      where: { id: Like('%') }, // Get all foods
      select: ['id'],
    });
    
    const availableIds = new Set(foods.map(f => f.id));
    
    return {
      available: foodIds.filter(id => availableIds.has(id)),
      unavailable: foodIds.filter(id => !availableIds.has(id)),
    };
  }
}