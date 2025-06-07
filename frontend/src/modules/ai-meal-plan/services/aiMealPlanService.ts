import { api } from "../../../services/api";

export interface AiMealPlanRequest {
  patientId: string;
  configuration: {
    objective: string;
    objectiveDetails?: string;
    restrictions: string[];
    customRestrictions?: string;
    avoidedFoods: any[];
    preferredFoods: any[];
    mealsPerDay: number;
    budget?: string;
    complexity: string;
    prepTime?: string;
    exerciseRoutine?: string;
    exerciseFrequency?: string;
    exerciseIntensity?: string;
    kitchenEquipment: string[];
    socialContext?: string;
  };
}

export interface AiReasoningResponse {
  prompt: string;
  rawResponse: string;
  tokensUsed?: number;
  model: string;
  provider: string;
  generationTime: number;
  metadata?: any;
}

export interface AiMealPlanResponse {
  id: string;
  mealPlan: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    meals: Array<{
      name: string;
      time: string;
      foods: Array<{
        foodId: string;
        name: string;
        quantity: number;
        unit: string;
        calories: number;
        protein: number;
        carbohydrates: number;
        fat: number;
      }>;
    }>;
  };
  nutritionalSummary: {
    totalCalories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
  };
  alternatives: Array<{
    mealName: string;
    alternatives: string[];
  }>;
  notes: string[];
  aiInsights: string[];
  reasoning?: AiReasoningResponse;
}

class AiMealPlanService {
  private baseUrl = "/ai-meal-plans";

  async generateMealPlan(request: AiMealPlanRequest): Promise<AiMealPlanResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/generate`, request);
      return response.data;
    } catch (error) {
      console.error("Error generating AI meal plan:", error);
      throw this.handleError(error);
    }
  }

  async getPatientDataForAi(patientId: string) {
    try {
      const response = await api.get(`${this.baseUrl}/patient-data/${patientId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching patient data for AI:", error);
      throw this.handleError(error);
    }
  }

  async saveMealPlan(mealPlanData: any) {
    try {
      const response = await api.post(`${this.baseUrl}/save`, mealPlanData);
      return response.data;
    } catch (error) {
      console.error("Error saving AI-generated meal plan:", error);
      throw this.handleError(error);
    }
  }

  async matchFoodsWithDatabase(foodNames: string[]) {
    try {
      const response = await api.post(`${this.baseUrl}/food-matching`, {
        foods: foodNames,
      });
      return response.data;
    } catch (error) {
      console.error("Error matching foods with database:", error);
      throw this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          return new Error(data.message || "Dados inválidos fornecidos");
        case 401:
          return new Error("Não autorizado. Faça login novamente.");
        case 403:
          return new Error("Acesso negado");
        case 404:
          return new Error("Recurso não encontrado");
        case 429:
          return new Error("Muitas solicitações. Tente novamente em alguns minutos.");
        case 500:
          return new Error("Erro interno do servidor. Tente novamente.");
        default:
          return new Error(data.message || "Erro desconhecido");
      }
    } else if (error.request) {
      // Network error
      return new Error("Erro de conexão. Verifique sua internet.");
    } else {
      // Other error
      return new Error(error.message || "Erro inesperado");
    }
  }

  // Mock generation for development (will be removed when backend is ready)
  async mockGenerateMealPlan(request: AiMealPlanRequest): Promise<AiMealPlanResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    return {
      id: "mock-ai-plan-" + Date.now(),
      mealPlan: {
        title: `Plano IA - ${new Date().toLocaleDateString()}`,
        description: "Plano gerado pela SmartNutri AI",
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        meals: [
          {
            name: "Café da Manhã",
            time: "08:00",
            foods: [
              {
                foodId: "mock-food-1",
                name: "Aveia em flocos",
                quantity: 40,
                unit: "g",
                calories: 152,
                protein: 5.4,
                carbohydrates: 27.6,
                fat: 2.8,
              },
              {
                foodId: "mock-food-2",
                name: "Banana nanica",
                quantity: 100,
                unit: "g",
                calories: 87,
                protein: 1.1,
                carbohydrates: 22.3,
                fat: 0.1,
              },
            ],
          },
          {
            name: "Almoço",
            time: "12:30",
            foods: [
              {
                foodId: "mock-food-3",
                name: "Arroz integral",
                quantity: 80,
                unit: "g",
                calories: 280,
                protein: 7.2,
                carbohydrates: 56.0,
                fat: 2.4,
              },
              {
                foodId: "mock-food-4",
                name: "Peito de frango grelhado",
                quantity: 120,
                unit: "g",
                calories: 200,
                protein: 37.2,
                carbohydrates: 0,
                fat: 4.8,
              },
            ],
          },
        ],
      },
      nutritionalSummary: {
        totalCalories: 1800,
        protein: 135,
        carbohydrates: 202,
        fat: 60,
      },
      alternatives: [
        {
          mealName: "Café da Manhã",
          alternatives: ["Granola sem açúcar", "Quinoa em flocos"],
        },
      ],
      notes: [
        "Beber 2L de água ao longo do dia",
        "Consumir refeições nos horários indicados",
      ],
      aiInsights: [
        "Plano balanceado com distribuição adequada de macronutrientes",
        "Alimentos selecionados com base nas preferências do paciente",
        "Horários ajustados conforme rotina informada",
      ],
    };
  }
}

export const aiMealPlanService = new AiMealPlanService();