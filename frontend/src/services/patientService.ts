import { api } from "../lib/axios";

const API_URL = "http://localhost:8000";

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: "M" | "F" | "OTHER";
  height: number;
  weight: number;
  goals: string[];
  allergies: string[];
  healthConditions: string[];
  medications: string[];
  observations: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientDto {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: "M" | "F" | "OTHER";
  height: number;
  weight: number;
  goals?: string[];
  allergies?: string[];
  healthConditions?: string[];
  medications?: string[];
  observations?: string;
}

export interface UpdatePatientDto extends Partial<CreatePatientDto> {}

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

class PatientService {
  private readonly baseUrl = `${API_URL}/patients`;

  async getAll(): Promise<Patient[]> {
    const response = await api.get<Patient[]>("/patients");
    return response.data;
  }

  async getById(id: string): Promise<Patient> {
    const response = await api.get<Patient>(`/patients/${id}`);
    return response.data;
  }

  async create(data: CreatePatientDto): Promise<Patient> {
    const response = await api.post<Patient>("/patients", data);
    return response.data;
  }

  async update(id: string, data: UpdatePatientDto): Promise<Patient> {
    const response = await api.patch<Patient>(`/patients/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/patients/${id}`);
  }

  async getMeasurements(patientId: string): Promise<Measurement[]> {
    const response = await api.get<Measurement[]>(
      `/patients/${patientId}/measurements`
    );
    return response.data;
  }

  async createMeasurement(
    patientId: string,
    data: CreateMeasurementDto
  ): Promise<Measurement> {
    const response = await api.post<Measurement>(
      `/patients/${patientId}/measurements`,
      data
    );
    return response.data;
  }
}

export const patientService = new PatientService();
