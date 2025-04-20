// Tipos para o componente PhotoUpload

export type PhotoType = "front" | "back" | "left" | "right";

export interface PhotoUploadProps {
  type: PhotoType;
  assessmentId: string;
  patientId: string;
  onUploadComplete: (photoData: AssessmentPhoto) => void;
  onUploadError: (error: Error) => void;
  onUploadStart?: () => Promise<boolean> | boolean; // Retorna falso para cancelar o upload
  initialPhotoUrl?: string;
  maxFileSizeMB?: number; // defaults to 5
  acceptedFormats?: string[]; // defaults to ['.jpg', '.jpeg', '.png']
  showPreview?: boolean; // defaults to true
  previewSize?: {
    width: number;
    height: number;
  };
}

export interface AssessmentPhoto {
  id: string;
  type: PhotoType;
  url: string;
  assessmentId: string;
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  storagePath?: string; // compatível com o serviço
}

export interface PhotoUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  selectedFile: File | null;
  previewUrl: string | null;
}
