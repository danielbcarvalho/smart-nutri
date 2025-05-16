import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  energyPlanService,
  QueryEnergyPlanDto,
  EnergyPlanResponseDto,
  CreateEnergyPlanDto,
  UpdateEnergyPlanDto,
} from "../services/energyPlanService";

export const usePatientEnergyPlans = (
  patientId: string,
  queryParams?: QueryEnergyPlanDto
) => {
  return useQuery<EnergyPlanResponseDto[]>({
    queryKey: ["energyPlans", patientId, queryParams],
    queryFn: () => energyPlanService.getAllByPatient(patientId, queryParams),
    enabled: !!patientId,
  });
};

export const useCreateEnergyPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      patientId,
      data,
    }: {
      patientId: string;
      data: CreateEnergyPlanDto;
    }) => energyPlanService.create(patientId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["energyPlans", variables.patientId],
      });
    },
  });
};

export const useDeleteEnergyPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patientId }: { id: string; patientId: string }) =>
      energyPlanService.delete(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["energyPlans", variables.patientId],
      });
    },
  });
};

export const useUpdateEnergyPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
      patientId,
    }: {
      id: string;
      data: UpdateEnergyPlanDto;
      patientId: string;
    }) => energyPlanService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["energyPlans", variables.patientId],
      });
    },
  });
};
