import { api } from "./api";

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  birthDate: string;
  gender: "male" | "female" | "other";
  height?: number;
  weight?: number;
  createdAt: string;
  updatedAt: string;
}

class PatientService {
  async getPatient(id: string): Promise<Patient> {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  }

  async updatePatient(id: string, data: Partial<Patient>): Promise<Patient> {
    const response = await api.patch(`/patients/${id}`, data);
    return response.data;
  }
}

export const patientService = new PatientService();
