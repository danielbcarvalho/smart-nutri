import { api } from "./api";

export interface UploadPhotoParams {
  file: File;
  type: "front" | "back" | "left" | "right";
  patientId: string;
  assessmentId: string;
}

export interface AssessmentPhoto {
  id: string;
  type: "front" | "back" | "left" | "right";
  url: string;
  thumbnailUrl: string;
  storagePath: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface para dados da foto recebidos da API
export interface RawPhotoData {
  id: string;
  type: string;
  url: string;
  thumbnailUrl?: string;
  thumbnail_url?: string;
  storagePath?: string;
  storage_path?: string;
  createdAt?: string | Date;
  created_at?: string | Date;
  updatedAt?: string | Date;
  updated_at?: string | Date;
  patientId?: string;
  assessmentId?: string;
  deletedAt?: string | Date | null;
  [key: string]: string | Date | null | undefined; // Tipo mais específico para indexação
}

export class PhotoService {
  static async uploadPhoto({
    file,
    type,
    patientId,
    assessmentId,
  }: UploadPhotoParams): Promise<AssessmentPhoto> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    formData.append("patientId", patientId);
    if (assessmentId) formData.append("assessmentId", assessmentId);
    const { data } = await api.post("/photos", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return this.transformPhotoData(data);
  }

  static async getAssessmentPhotos(
    assessmentId: string
  ): Promise<AssessmentPhoto[]> {
    const { data } = await api.get("/photos", {
      params: { assessmentId },
    });

    // Garantir que temos um array para processar
    const photosData = Array.isArray(data.data) ? data.data : [];
    return photosData.map((photo: RawPhotoData) =>
      this.transformPhotoData(photo)
    );
  }

  static async deletePhoto(photoId: string): Promise<void> {
    await api.delete(`/photos/${photoId}`);
  }

  static transformPhotoData(photo: RawPhotoData): AssessmentPhoto {
    // Garantir que o tipo seja válido
    const validType = (
      type: string
    ): type is "front" | "back" | "left" | "right" => {
      return ["front", "back", "left", "right"].includes(type);
    };

    const photoType = photo.type;
    if (!validType(photoType)) {
      console.warn(
        `Tipo de foto inválido: ${photoType}. Usando "front" como padrão.`
      );
    }

    return {
      id: photo.id,
      type: validType(photoType) ? photoType : "front",
      url: photo.url,
      thumbnailUrl: photo.thumbnailUrl || photo.thumbnail_url || photo.url,
      storagePath: photo.storagePath || photo.storage_path || "",
      createdAt:
        photo.createdAt instanceof Date
          ? photo.createdAt
          : photo.created_at instanceof Date
          ? photo.created_at
          : new Date(photo.createdAt || photo.created_at || Date.now()),
      updatedAt:
        photo.updatedAt instanceof Date
          ? photo.updatedAt
          : photo.updated_at instanceof Date
          ? photo.updated_at
          : new Date(photo.updatedAt || photo.updated_at || Date.now()),
    };
  }
}
