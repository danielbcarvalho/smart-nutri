import { api } from "@services/api";

export type MonitoringStatus = "in_progress" | "paused" | "completed";
export type ConsultationFrequency =
  | "weekly"
  | "biweekly"
  | "monthly"
  | "custom";

export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  gender: "M" | "F" | "OTHER";
  status: "active" | "inactive";
  photoUrl?: string;
  instagram?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  height?: number;
  weight?: number;
  lastConsultationAt?: string;
  nextConsultationAt?: string;
  monitoringStatus: MonitoringStatus;
  consultationFrequency: ConsultationFrequency;
  customConsultationDays?: number;
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
  monitoringStatus?: MonitoringStatus;
  consultationFrequency?: ConsultationFrequency;
  customConsultationDays?: number;
  lastConsultationAt?: string;
  nextConsultationAt?: string;
}

export type UpdatePatientDto = Partial<CreatePatientDto>;

export interface BodyMeasurements {
  chest?: number;
  waist?: number;
  hip?: number;
  arm?: number;
  thigh?: number;
  neck?: number;
  shoulder?: number;
  abdomen?: number;
  relaxedArm?: number;
  contractedArm?: number;
  forearm?: number;
  proximalThigh?: number;
  medialThigh?: number;
  distalThigh?: number;
  calf?: number;
}

export interface Skinfolds {
  tricipital?: number;
  bicipital?: number;
  abdominal?: number;
  subscapular?: number;
  axillaryMedian?: number;
  thigh?: number;
  thoracic?: number;
  suprailiac?: number;
  calf?: number;
  supraspinal?: number;
}

export interface BoneDiameters {
  humerus?: number;
  wrist?: number;
  femur?: number;
}

export interface Measurement {
  id: string;
  patientId: string;
  date: string;
  weight: string | number;
  height?: string | number;
  sittingHeight?: string | number;
  kneeHeight?: string | number;
  bodyFat?: string | number | null;
  fatMass?: string | number | null;
  muscleMassPercentage?: string | number | null;
  muscleMass?: string | number | null;
  fatFreeMass?: string | number | null;
  boneMass?: string | number | null;
  bodyWater?: string | number | null;
  visceralFat?: string | number | null;
  metabolicAge?: string | number | null;
  skinfolds?: Skinfolds;
  measurements: BodyMeasurements;
  boneDiameters?: BoneDiameters;
  skinfoldFormula?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  photos?: Array<{
    id: string;
    type: string;
    url: string;
    thumbnailUrl?: string;
    assessmentId?: string;
    createdAt?: string;
    updatedAt?: string;
    storagePath?: string;
  }>;
}

export interface CreateMeasurementDto {
  weight: number;
  height?: number;
  sittingHeight?: number;
  kneeHeight?: number;
  bodyFat?: number;
  fatMass?: number;
  muscleMassPercentage?: number;
  muscleMass?: number;
  fatFreeMass?: number;
  boneMass?: number;
  bodyWater?: number;
  visceralFat?: number;
  metabolicAge?: number;
  notes?: string;
  date: string;
  measurements?: BodyMeasurements;
  skinfolds?: Skinfolds;
  boneDiameters?: BoneDiameters;
  skinfoldFormula?: string;
  patientId?: string;
  sharePhotos?: boolean;
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
    const response = await api.patch(`/patients/${id}`, patient);
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

  // Alias para getMeasurements, para compatibilidade com código existente
  findMeasurements: async (patientId: string): Promise<Measurement[]> => {
    const response = await api.get(`/patients/${patientId}/measurements`);
    return response.data;
  },

  findMeasurementsEvolution: async (
    patientId: string,
    startDate?: string,
    endDate?: string,
    limit?: number
  ): Promise<Measurement[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (limit) params.append("limit", limit.toString());

    const response = await api.get(
      `/patients/${patientId}/measurements/evolution`,
      {
        params,
      }
    );
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

  // Excluir uma medição/avaliação
  deleteMeasurement: async (
    patientId: string,
    measurementId: string
  ): Promise<void> => {
    await api.delete(`/patients/${patientId}/measurements/${measurementId}`);
  },

  // Atualizar uma medição/avaliação
  updateMeasurement: async (
    patientId: string,
    measurementId: string,
    measurement: Partial<CreateMeasurementDto>
  ): Promise<Measurement> => {
    const response = await api.patch(
      `/patients/${patientId}/measurements/${measurementId}`,
      measurement
    );
    return response.data;
  },

  // Upload de foto de perfil do paciente
  uploadProfilePhoto: async (id: string, file: File): Promise<Patient> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post(`/patients/${id}/photo`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};
