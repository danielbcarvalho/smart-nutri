import { useMutation } from "@tanstack/react-query";
import { aiMealPlanService, AiMealPlanRequest } from "../services/aiMealPlanService";

export const useAiMealPlanGeneration = () => {
  return useMutation({
    mutationFn: (request: AiMealPlanRequest) => {
      // Use mock generation for now - will switch to real service when backend is ready
      return aiMealPlanService.mockGenerateMealPlan(request);
    },
    onError: (error) => {
      console.error("AI meal plan generation failed:", error);
    },
  });
};

export const useSaveAiMealPlan = () => {
  return useMutation({
    mutationFn: (mealPlanData: any) => {
      return aiMealPlanService.saveMealPlan(mealPlanData);
    },
    onError: (error) => {
      console.error("Failed to save AI meal plan:", error);
    },
  });
};

export const useFoodMatching = () => {
  return useMutation({
    mutationFn: (foodNames: string[]) => {
      return aiMealPlanService.matchFoodsWithDatabase(foodNames);
    },
    onError: (error) => {
      console.error("Food matching failed:", error);
    },
  });
};