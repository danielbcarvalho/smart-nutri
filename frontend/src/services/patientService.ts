import axios from "axios";

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
  goals?: string[];
  allergies?: string[];
  healthConditions?: string[];
  medications?: string[];
  observations?: string;
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
  date: string;
  weight: number;
  bodyFat?: number;
  muscleMass?: number;
  bodyWater?: number;
  visceralFat?: number;
  measurements: BodyMeasurements;
  patientId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMeasurementDto {
  date: string;
  weight: number;
  bodyFat?: number;
  muscleMass?: number;
  bodyWater?: number;
  visceralFat?: number;
  measurements?: BodyMeasurements;
}

class PatientService {
  private readonly baseUrl = `${API_URL}/patients`;

  async getAll(): Promise<Patient[]> {
    const response = await axios.get<Patient[]>(this.baseUrl);
    return response.data;
  }

  async getById(id: string): Promise<Patient> {
    const response = await axios.get<Patient>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async create(data: CreatePatientDto): Promise<Patient> {
    const response = await axios.post<Patient>(this.baseUrl, data);
    return response.data;
  }

  async update(id: string, data: UpdatePatientDto): Promise<Patient> {
    const response = await axios.patch<Patient>(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/${id}`);
  }

  async getMeasurements(id: string): Promise<Measurement[]> {
    const response = await axios.get<Measurement[]>(
      `${this.baseUrl}/${id}/measurements`
    );
    return response.data;
  }

  async createMeasurement(
    id: string,
    data: CreateMeasurementDto
  ): Promise<Measurement> {
    const response = await axios.post<Measurement>(
      `${this.baseUrl}/${id}/measurements`,
      data
    );
    return response.data;
  }
}

export const patientService = new PatientService();
