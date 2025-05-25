import { api } from "@/services/api";
import type { MealFood as FoodServiceMealFood } from "@/services/foodService";

export type CreateMealFood = Omit<FoodServiceMealFood, "id">;
export type CreateMeal = Omit<Meal, "id" | "mealFoods"> & {
  mealFoods: CreateMealFood[];
};

export type UpdateMealFood = Omit<FoodServiceMealFood, "id">;
export type UpdateMeal = Partial<Omit<Meal, "id" | "mealFoods">> & {
  mealFoods: UpdateMealFood[];
  notes?: string;
  energyPlanId?: string;
};

export interface Meal {
  id: string;
  time: string;
  name: string;
  notes?: string;
  mealFoods: MealFood[];
}

export interface MealPlan {
  id: string;
  patientId: string;
  nutritionistId: string;
  name: string;
  type: "alimentos" | "equivalentes" | "qualitativa";
  status: "draft" | "active" | "archived";
  startDate: string;
  endDate: string;
  meals: Meal[];
  createdAt: string;
  updatedAt: string;
  description?: string;
  dailyCalories?: number;
  dailyProtein?: number;
  dailyCarbs?: number;
  dailyFat?: number;
  energyPlanId?: string;
}

// Adicionar tipos para substitutos
interface Substitute {
  id: string;
  foodId: string;
  source: string;
  amount: number;
  unit: string;
}

interface MealFood extends FoodServiceMealFood {
  substitutes?: Substitute[];
}

export const mealPlanService = {
  // Buscar todos os planos de um paciente
  getPatientPlans: async (patientId: string) => {
    const response = await api.get<MealPlan[]>(
      `/meal-plans?patientId=${patientId}`
    );
    return response.data;
  },

  // Buscar um plano específico
  getById: async (planId: string) => {
    const response = await api.get<MealPlan>(`/meal-plans/${planId}`);
    return response.data;
  },

  // Criar novo plano
  createPlan: async (
    data: Omit<MealPlan, "id" | "createdAt" | "updatedAt">
  ) => {
    const response = await api.post<MealPlan>("/meal-plans", data);
    return response.data;
  },

  // Atualizar plano existente
  updatePlan: async (planId: string, data: Partial<MealPlan>) => {
    const response = await api.patch<MealPlan>(`/meal-plans/${planId}`, data);
    return response.data;
  },

  // Excluir plano
  deletePlan: async (planId: string) => {
    await api.delete(`/meal-plans/${planId}`);
  },

  // Adicionar refeição ao plano
  addMeal: async (planId: string, meal: CreateMeal) => {
    const response = await api.post<Meal>(`/meal-plans/${planId}/meals`, meal);
    return response.data;
  },

  // Atualizar refeição
  updateMeal: async (planId: string, mealId: string, data: UpdateMeal) => {
    const response = await api.patch<Meal>(
      `/meal-plans/${planId}/meals/${mealId}`,
      data
    );
    return response.data;
  },

  // Excluir refeição
  deleteMeal: async (planId: string, mealId: string) => {
    await api.delete(`/meal-plans/${planId}/meals/${mealId}`);
  },

  // Reordenar refeições
  reorderMeals: async (planId: string, mealIds: string[]) => {
    const response = await api.post<MealPlan>(`/meal-plans/${planId}/reorder`, {
      mealIds,
    });
    return response.data;
  },

  // Adicionar funções de gerenciamento de substitutos
  addSubstitute: async (
    mealFoodId: string,
    substitute: Omit<Substitute, "id">
  ) => {
    const response = await api.post(
      `/meal-foods/${mealFoodId}/substitutes`,
      substitute
    );
    return response.data;
  },

  removeSubstitute: async (mealFoodId: string, substituteId: string) => {
    await api.delete(`/meal-foods/${mealFoodId}/substitutes/${substituteId}`);
  },
};
