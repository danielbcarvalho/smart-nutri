import React, { useState, useCallback } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { useDropzone, Accept } from "react-dropzone";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { PhotoUploadProps, PhotoUploadState } from "./types";
import { StyledDropzone, PreviewContainer } from "./styles";
import { usePhotoUpload } from "../../hooks/usePhotoUpload";

const DEFAULT_MAX_SIZE_MB = 5;
const DEFAULT_FORMATS = [".jpg", ".jpeg", ".png"];

function getAcceptObject(formats: string[]): Accept {
  // Exemplo: ['.jpg', '.jpeg', '.png'] => { 'image/jpeg': [], 'image/png': [] }
  const accept: Accept = {};
  formats.forEach((f) => {
    if (f === ".jpg" || f === ".jpeg") accept["image/jpeg"] = [];
    if (f === ".png") accept["image/png"] = [];
  });
  return accept;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  type,
  assessmentId,
  patientId,
  onUploadComplete,
  onUploadError,
  initialPhotoUrl,
  maxFileSizeMB = DEFAULT_MAX_SIZE_MB,
  acceptedFormats = DEFAULT_FORMATS,
  showPreview = true,
  previewSize = { width: 200, height: 200 },
}) => {
  const [state, setState] = useState<PhotoUploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    selectedFile: null,
    previewUrl: initialPhotoUrl || null,
  });

  const {
    isUploading,
    progress,
    error: uploadError,
    uploadPhoto,
  } = usePhotoUpload();

  // Validação do arquivo
  const validateFile = (file: File): string | null => {
    if (!file) return "Nenhum arquivo selecionado";
    if (file.size > maxFileSizeMB * 1024 * 1024) {
      return `O arquivo deve ter menos de ${maxFileSizeMB}MB`;
    }
    const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!acceptedFormats.includes(fileExtension)) {
      return `Formato inválido. Aceitos: ${acceptedFormats.join(", ")}`;
    }
    return null;
  };

  // Processamento do arquivo selecionado e upload
  const processFile = async (file: File) => {
    const error = validateFile(file);
    if (error) {
      setState((prev) => ({ ...prev, error }));
      onUploadError?.(new Error(error));
      return;
    }
    setState((prev) => ({
      ...prev,
      error: null,
      isUploading: true,
      selectedFile: file,
    }));
    try {
      const photo = await uploadPhoto({
        file,
        type,
        assessmentId,
        patientId,
      });
      setState((prev) => ({
        ...prev,
        previewUrl: photo.url,
        isUploading: false,
        progress: 100,
        error: null,
      }));
      // Adaptar para incluir assessmentId, conforme esperado pelo tipo AssessmentPhoto do componente
      onUploadComplete({ ...photo, assessmentId });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isUploading: false,
        error: uploadError || "Erro ao fazer upload",
      }));
      onUploadError?.(
        err instanceof Error ? err : new Error("Erro ao fazer upload")
      );
    }
  };

  // Dropzone config
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles[0]) {
      processFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: getAcceptObject(acceptedFormats),
    maxSize: maxFileSizeMB * 1024 * 1024,
  });

  // Renderização
  return (
    <Box>
      <StyledDropzone
        {...getRootProps()}
        className={[
          isDragActive ? "dragging" : "",
          state.error || uploadError ? "error" : "",
        ].join(" ")}
        sx={{
          width: previewSize.width,
          height: previewSize.height,
          position: "relative",
        }}
        aria-label="Área de upload de foto"
        role="button"
        tabIndex={0}
      >
        <input {...getInputProps()} />
        {isUploading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              bgcolor: "rgba(255,255,255,0.7)",
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <CircularProgress
              size={40}
              value={progress}
              variant="determinate"
            />
            <Typography variant="caption" color="textSecondary" mt={1}>
              Enviando...
            </Typography>
          </Box>
        )}
        {state.previewUrl && showPreview ? (
          <PreviewContainer sx={{ width: "100%", height: "100%" }}>
            <img
              src={state.previewUrl}
              alt={`Pré-visualização da foto ${type}`}
            />
          </PreviewContainer>
        ) : (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100%"
          >
            <InsertPhotoIcon color="action" sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="body2" color="textSecondary">
              Arraste ou clique para selecionar uma foto
            </Typography>
            <Typography variant="caption" color="textSecondary">
              (JPG, JPEG, PNG até {maxFileSizeMB}MB)
            </Typography>
          </Box>
        )}
      </StyledDropzone>
      {(state.error || uploadError) && (
        <Box mt={1} display="flex" alignItems="center" color="error.main">
          <ErrorOutlineIcon fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="caption">
            {state.error || uploadError}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// Exemplo de uso (comentado):
// <PhotoUpload
//   type="front"
//   assessmentId="123"
//   patientId="456"
//   onUploadComplete={(photo) => console.log(photo)}
//   onUploadError={(err) => console.error(err)}
// />
