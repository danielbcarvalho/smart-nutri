import { api } from "@/lib/axios";
// Tipos DTOs podem ser ajustados depois

export type CreateEnergyPlanDto = object;
export type UpdateEnergyPlanDto = object;
export interface EnergyPlanResponseDto {
  id: string;
  name: string;
  formulaKey: string;
  weightAtCalculationKg: number;
  heightAtCalculationCm: number;
  fatFreeMassAtCalculationKg?: number;
  ageAtCalculationYears: number;
  genderAtCalculation: "male" | "female" | "other";
  activityFactorKey: string;
  injuryFactorKey: string;
  calculatedTmbKcal?: number;
  calculatedGetKcal: number;
  createdAt: string;
  updatedAt: string;
  patientId: string;
  nutritionistId: string;
}
export type QueryEnergyPlanDto = object;

const API_URL = "/energy-plans";

export const energyPlanService = {
  create: async (
    patientId: string,
    data: CreateEnergyPlanDto
  ): Promise<EnergyPlanResponseDto> => {
    const { data: responseData } = await api.post(API_URL, {
      ...data,
      patientId,
    });
    return responseData;
  },

  getAllByPatient: async (
    patientId: string,
    queryParams?: QueryEnergyPlanDto
  ): Promise<EnergyPlanResponseDto[]> => {
    const { data: responseData } = await api.get(
      `${API_URL}/patient/${patientId}`,
      { params: queryParams }
    );
    return responseData;
  },

  getById: async (id: string): Promise<EnergyPlanResponseDto> => {
    const { data: responseData } = await api.get(`${API_URL}/${id}`);
    return responseData;
  },

  update: async (
    id: string,
    data: UpdateEnergyPlanDto
  ): Promise<EnergyPlanResponseDto> => {
    const { data: responseData } = await api.patch(`${API_URL}/${id}`, data);
    return responseData;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${API_URL}/${id}`);
  },
};
