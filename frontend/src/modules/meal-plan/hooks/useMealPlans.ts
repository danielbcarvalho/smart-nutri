import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mealPlanService } from "../services/mealPlanService";
import { MealPlan } from "../services/mealPlanService";

export const usePatientMealPlans = (patientId: string) => {
  return useQuery({
    queryKey: ["mealPlans", patientId],
    queryFn: () => mealPlanService.getPatientPlans(patientId),
    enabled: !!patientId,
  });
};

export const useDeleteMealPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patientId }: { id: string; patientId: string }) =>
      mealPlanService.deletePlan(id),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: ["mealPlans", patientId] });
    },
  });
};
