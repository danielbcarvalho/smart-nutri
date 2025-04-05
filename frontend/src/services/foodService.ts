import axios from "axios";

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

export const foodService = {
  // Busca alimentos
  async searchFoods(query: string): Promise<Food[]> {
    const response = await api.get("/foods/search", {
      params: { query },
    });
    return response.data;
  },

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
