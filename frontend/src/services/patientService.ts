import { api } from "./api";

export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  gender: "M" | "F" | "OTHER";
  status: "active" | "inactive";
  avatar?: string;
  instagram?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientDto {
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  gender: Patient["gender"];
  instagram?: string;
  status: Patient["status"];
  height?: number;
  weight?: number;
  goals?: string[];
  allergies?: string[];
  healthConditions?: string[];
  medications?: string[];
  observations?: string;
}

export type UpdatePatientDto = Partial<CreatePatientDto>;

export interface BodyMeasurements {
  chest?: number;
  waist?: number;
  hip?: number;
  arm?: number;
  thigh?: number;
}

export interface Measurement {
  id: string;
  patientId: string;
  date: string;
  weight: string | number;
  bodyFat?: string | number | null;
  muscleMass?: string | number | null;
  bodyWater?: string | number | null;
  visceralFat?: string | number | null;
  measurements: BodyMeasurements;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMeasurementDto {
  weight: number;
  height: number;
  bodyFat?: number;
  muscleMass?: number;
  bodyWater?: number;
  visceralFat?: number;
  notes?: string;
  date: string;
  measurements: BodyMeasurements;
}

export const patientService = {
  // Buscar todos os pacientes
  getAll: async (): Promise<Patient[]> => {
    const response = await api.get("/patients");
    return response.data;
  },

  // Buscar paciente por ID
  getById: async (id: string): Promise<Patient> => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  // Criar novo paciente
  create: async (
    patient: Omit<Patient, "id" | "createdAt" | "updatedAt">
  ): Promise<Patient> => {
    const response = await api.post("/patients", patient);
    return response.data;
  },

  // Atualizar paciente
  update: async (
    id: string,
    patient: Partial<Omit<Patient, "id" | "createdAt" | "updatedAt">>
  ): Promise<Patient> => {
    const response = await api.put(`/patients/${id}`, patient);
    return response.data;
  },

  // Excluir paciente
  delete: async (id: string): Promise<void> => {
    await api.delete(`/patients/${id}`);
  },

  getMeasurements: async (patientId: string): Promise<Measurement[]> => {
    const response = await api.get(`/patients/${patientId}/measurements`);
    return response.data;
  },

  createMeasurement: async (
    patientId: string,
    measurement: CreateMeasurementDto
  ): Promise<Measurement> => {
    const response = await api.post(
      `/patients/${patientId}/measurements`,
      measurement
    );
    return response.data;
  },
};
