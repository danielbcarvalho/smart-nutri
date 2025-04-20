import { api } from "./api";

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
  name: string;
  type: "alimentos" | "equivalentes" | "qualitativa";
  status: "draft" | "active" | "archived";
  startDate: string;
  endDate: string;
  meals: Meal[];
  createdAt: string;
  updatedAt: string;
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
  addMeal: async (planId: string, meal: Omit<Meal, "id">) => {
    const response = await api.post<Meal>(`/meal-plans/${planId}/meals`, meal);
    return response.data;
  },

  // Atualizar refeição
  updateMeal: async (planId: string, mealId: string, data: Partial<Meal>) => {
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
};
