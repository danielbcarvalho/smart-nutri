import { useQuery } from "@tanstack/react-query";
import { api } from "../../../services/api";

export interface PatientAiData {
  patient: {
    id: string;
    name: string;
    email: string;
    birthDate: string;
    gender: string;
    occupation?: string;
    phone?: string;
  };
  latestMeasurement?: {
    id: string;
    weight: number;
    height: number;
    bodyFat?: number;
    muscleMass?: number;
    measureDate: string;
    measurements?: Record<string, number>;
  };
  energyPlan?: {
    id: string;
    bmr: number;
    tee: number;
    objective: string;
    formula: string;
    activityFactor: number;
    createdAt: string;
  };
  previousMealPlans?: Array<{
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    createdAt: string;
  }>;
  progressPhotos?: Array<{
    id: string;
    type: string;
    url: string;
    createdAt: string;
  }>;
}

// Service function to aggregate patient data for AI
const fetchPatientAiData = async (patientId: string): Promise<PatientAiData> => {
  if (!patientId) {
    throw new Error("Patient ID is required");
  }

  try {
    // Use the new AI backend endpoint that aggregates all data
    const response = await api.get(`/ai-meal-plans/patient-data/${patientId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching patient AI data:", error);
    throw error;
  }
};

export const usePatientAiData = (patientId?: string) => {
  return useQuery({
    queryKey: ["patient-ai-data", patientId],
    queryFn: () => fetchPatientAiData(patientId!),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry if patient not found
      if (error?.message?.includes("404")) {
        return false;
      }
      return failureCount < 2;
    },
  });
};