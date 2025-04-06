import { api } from "../lib/axios";

export interface SearchResult {
  id: string;
  type: "patient" | "mealPlan";
  name: string;
  subtitle?: string;
}

export async function searchAll(query: string): Promise<SearchResult[]> {
  try {
    // Busca pacientes
    const patientsResponse = await api.get(`/patients?search=${query}`);
    const patients: SearchResult[] = patientsResponse.data.map(
      (patient: any) => ({
        id: patient.id,
        type: "patient",
        name: patient.name,
        subtitle: "Paciente",
      })
    );

    // Busca planos de alimentação
    const mealPlansResponse = await api.get(`/meal-plans?search=${query}`);
    const mealPlans: SearchResult[] = mealPlansResponse.data.map(
      (plan: any) => ({
        id: plan.id,
        type: "mealPlan",
        name: plan.name,
        subtitle: `Plano de ${plan.patient?.name || "Paciente"}`,
      })
    );

    // Combina e retorna os resultados
    return [...patients, ...mealPlans];
  } catch (error) {
    console.error("Erro ao buscar:", error);
    return [];
  }
}
