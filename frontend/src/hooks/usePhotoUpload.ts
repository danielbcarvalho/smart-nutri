import { useState, useCallback } from "react";
import {
  PhotoService,
  UploadPhotoParams,
  AssessmentPhoto,
} from "../services/photoService";

interface UsePhotoUploadReturn {
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadPhoto: (params: UploadPhotoParams) => Promise<AssessmentPhoto>;
  reset: () => void;
}

export function usePhotoUpload(): UsePhotoUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadPhoto = useCallback(async (params: UploadPhotoParams) => {
    setIsUploading(true);
    setProgress(0);
    setError(null);
    try {
      // Futuramente: implementar progresso real
      const photo = await PhotoService.uploadPhoto(params);
      setProgress(100);
      setIsUploading(false);
      return photo;
    } catch (err: unknown) {
      let message = "Erro ao fazer upload da foto";
      if (err && typeof err === "object" && "message" in err) {
        const maybeError = err as { message?: unknown };
        if (typeof maybeError.message === "string") {
          message = maybeError.message;
        }
      }
      setError(message);
      setIsUploading(false);
      throw err;
    }
  }, []);

  const reset = () => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
  };

  return {
    isUploading,
    progress,
    error,
    uploadPhoto,
    reset,
  };
}
