import axios from "axios";
import { fetchFoodDb } from "./foodDbService";
import type { Alimento } from "@/modules/meal-plan/components/AddFoodToMealModal";

export interface Food {
  id: string;
  name: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  categories: string[];
  isFavorite: boolean;
  usageCount: number;
}

export interface MacroNutrients {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export interface MealFood {
  id: string;
  foodId: string;
  amount: number;
  unit: string;
  source: string;
}

export interface Meal {
  id: string;
  name: string;
  time: string;
  notes?: string;
  mealFoods: MealFood[];
}

export interface MealPlan {
  id: string;
  patientId: string;
  date: Date;
  meals: Meal[];
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export function normalize(str: string): string {
  if (!str) return ""; // Handle nullish input
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^\w\s]/gi, "") // remove special characters (keeps letters, numbers, underscore, whitespace)
    .toLowerCase()
    .trim();
}

/**
 * Calculates a relevance score for a food item based on a search query.
 * Lower scores are better.
 * Score Tiers:
 *  0: Perfect exact match.
 *  1: Match starts with the query term (followed by space or parenthesis).
 *  2: Match contains the exact query term somewhere.
 *  3: Match contains all individual words from the query term.
 * 100: Poor match (filtered out).
 *
 * A penalty based on extra length is added to scores 1, 2, and 3
 * to favor shorter, more specific results within the same tier.
 */
function getScore(
  food: { nome?: string; usageCount?: number },
  normQuery: string,
  queryWords: string[]
): number {
  // Ensure food.nome exists and is a string before normalizing
  const normName = normalize(food?.nome || "");
  if (!normName) return 100; // Treat empty names as non-matches

  const queryLen = normQuery.length;
  const nameLen = normName.length;

  // Base score calculation
  let baseScore: number;

  // Tier 0: Perfect exact match
  if (normName === normQuery) {
    baseScore = 0;
  }
  // Tier 1: Match starts with the query term (followed by space or parenthesis)
  // Added check for exact query length to avoid matching partial words if query has no space
  else if (
    normName.startsWith(normQuery + " ") ||
    normName.startsWith(normQuery + "(") ||
    normName.startsWith(normQuery + " (")
    // Optional: Add case for exact match at start if name is exactly query length (already covered by Tier 0)
    // || normName.startsWith(normQuery) && nameLen === queryLen // Redundant due to Tier 0 check
  ) {
    baseScore = 1;
  }
  // Tier 2: Match contains the exact query term phrase somewhere
  else if (normName.includes(normQuery)) {
    // Refinement: Prefer matches at word boundaries
    const boundaryRegex = new RegExp(
      `(\\s|^)${normQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\s|$)`
    );
    if (boundaryRegex.test(normName)) {
      baseScore = 2; // Contains whole phrase at boundary
    } else {
      baseScore = 2.5; // Contains whole phrase but not at boundary (maybe less relevant?)
    }
  }
  // Tier 3: Match contains all individual words from the query term
  else if (
    queryWords.length > 1 &&
    queryWords.every((q) => normName.includes(q))
  ) {
    baseScore = 3;
  }
  // Tier 100: No relevant match found
  else {
    return 100;
  }

  // Add penalty for extra length - INCREASED FACTOR from 0.001 to 0.01
  // This helps ensure shorter results are preferred when the base score is the same or very close.
  const lengthPenalty = Math.max(0, nameLen - queryLen) * 0.01; // Increased factor

  return baseScore + lengthPenalty;
}

export function searchFoods(query: string, foodDb: Alimento[]): Alimento[] {
  if (!query || query.length < 2) return [];

  const normQuery = normalize(query);
  const queryWords = normQuery.split(/\s+/).filter(Boolean);

  if (!normQuery) return [];

  const scoredFoods = foodDb
    .map((food) => {
      const score = getScore(food, normQuery, queryWords);
      const usageCount =
        typeof food.usageCount === "number" ? food.usageCount : 0;

      return {
        food,
        score,
        usageCount,
      };
    })
    .filter(({ score }) => score < 100);

  const sortedFoods = scoredFoods.sort((a, b) => {
    if (a.score !== b.score) {
      return a.score - b.score;
    }
    if (a.usageCount !== b.usageCount) {
      return b.usageCount - a.usageCount;
    }
    const lenA = a.food?.nome?.length ?? 0;
    const lenB = b.food?.nome?.length ?? 0;
    if (lenA !== lenB) {
      return lenA - lenB;
    }
    return (a.food?.nome ?? "").localeCompare(b.food?.nome ?? "");
  });

  return sortedFoods.map(({ food }) => food);
}

export const foodService = {
  // Lista todos os alimentos
  async getAllFoods(): Promise<Food[]> {
    const response = await api.get("/foods");
    return response.data;
  },

  // Lista alimentos favoritos
  async getFavorites(): Promise<Food[]> {
    const response = await api.get("/foods/favorites");
    return response.data;
  },

  // Toggle favorito
  async toggleFavorite(id: string): Promise<Food> {
    const response = await api.patch(`/foods/${id}/favorite`);
    return response.data;
  },

  // Calcula macros baseado na quantidade
  calculateMacros(food: Food, amount: number): MacroNutrients {
    const factor = amount / food.servingSize;
    return {
      calories: Math.round(food.calories * factor),
      protein: +(food.protein * factor).toFixed(1),
      carbohydrates: +(food.carbohydrates * factor).toFixed(1),
      fat: +(food.fat * factor).toFixed(1),
      fiber: food.fiber ? +(food.fiber * factor).toFixed(1) : undefined,
      sugar: food.sugar ? +(food.sugar * factor).toFixed(1) : undefined,
      sodium: food.sodium ? +(food.sodium * factor).toFixed(1) : undefined,
    };
  },

  // Soma macros de vários alimentos
  sumMacros(mealFoods: Array<{ food: Food; amount: number }>): MacroNutrients {
    const initialMacros: MacroNutrients = {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    };

    return mealFoods.reduce((total, { food, amount }) => {
      const foodMacros = this.calculateMacros(food, amount);
      return {
        calories: total.calories + foodMacros.calories,
        protein: +(total.protein + foodMacros.protein).toFixed(1),
        carbohydrates: +(
          total.carbohydrates + foodMacros.carbohydrates
        ).toFixed(1),
        fat: +(total.fat + foodMacros.fat).toFixed(1),
        fiber:
          foodMacros.fiber && total.fiber
            ? +(total.fiber + foodMacros.fiber).toFixed(1)
            : undefined,
        sugar:
          foodMacros.sugar && total.sugar
            ? +(total.sugar + foodMacros.sugar).toFixed(1)
            : undefined,
        sodium:
          foodMacros.sodium && total.sodium
            ? +(total.sodium + foodMacros.sodium).toFixed(1)
            : undefined,
      };
    }, initialMacros);
  },
};
