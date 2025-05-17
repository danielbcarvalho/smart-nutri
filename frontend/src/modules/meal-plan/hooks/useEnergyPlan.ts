import { useQuery } from "@tanstack/react-query";
import { energyPlanService } from "@/modules/energy-plan/services/energyPlanService";

export interface EnergyPlan {
  id: string;
  patientId: string;
  calculatedTmbKcal: number;
  calculatedGetKcal: number;
  macronutrientDistribution: {
    protein: number;
    fat: number;
    carbohydrates: number;
  };
  createdAt: string;
  updatedAt: string;
}

export const useEnergyPlan = (patientId: string) => {
  return useQuery({
    queryKey: ["energyPlan", patientId],
    queryFn: async () => {
      const allPlans = await energyPlanService.getAllByPatient(patientId);
      if (!allPlans || allPlans.length === 0) return undefined;
      // Ordena por data de criação (ou atualização) decrescente e pega o mais recente
      const sorted = allPlans.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return sorted[0];
    },
    enabled: !!patientId,
  });
};
