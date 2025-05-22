import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
} from "@mui/material";
import { PhotoUpload } from "../../../../../../components/PhotoUpload";
import { PhotoService } from "../../../../../../services/photoService";
import { Measurement } from "../../../../../patient/services/patientService";
import ExpandMoreIcon from "@mui/icons-material/ArrowDropDown";

// Types remain the same
interface MeasurementPhoto {
  id: string;
  patientId: string;
  assessmentId: string;
  type: string;
  url: string;
  thumbnailUrl?: string;
  storagePath?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: null;
}

// Ensure AssessmentPhoto type matches PhotoUpload component
type AssessmentPhoto = {
  id: string;
  type: PhotoType;
  url: string;
  thumbnailUrl: string;
  storagePath: string;
  createdAt: Date;
  updatedAt: Date;
};

interface PhotosSectionProps {
  measurementId?: string;
  patientId: string;
  sharePhotos: boolean;
  onSharePhotosChange: (checked: boolean) => void;
  onPhotosChange?: (photos: PhotosState) => void;
  measurement?: Measurement;
  onRefreshMeasurement?: () => Promise<void>;
  expanded: boolean;
  onAccordionChange: (
    panel: string
  ) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
}

type PhotosState = {
  front: AssessmentPhoto[];
  back: AssessmentPhoto[];
  left: AssessmentPhoto[];
  right: AssessmentPhoto[];
};

type PhotoType = "front" | "back" | "left" | "right";

// Define the type for uploaded photo from PhotoUpload component
type UploadedPhoto = {
  id: string;
  type: PhotoType;
  url: string;
  thumbnailUrl?: string;
  storagePath?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export const PhotosSection: React.FC<PhotosSectionProps> = ({
  measurementId,
  patientId,
  onPhotosChange,
  measurement,
  onRefreshMeasurement,
  expanded,
  onAccordionChange,
}) => {
  const [photos, setPhotos] = useState<PhotosState>({
    front: [],
    back: [],
    left: [],
    right: [],
  });

  const [isLoadingMeasurementPhotos, setIsLoadingMeasurementPhotos] =
    useState(true);
  const [isProcessing, setIsProcessing] = useState<Record<PhotoType, boolean>>({
    front: false,
    back: false,
    left: false,
    right: false,
  });

  // --- Effect to Process Initial Measurement Photos ---
  useEffect(() => {
    setIsLoadingMeasurementPhotos(true);
    setPhotos({ front: [], back: [], left: [], right: [] });

    if (!measurement?.photos || measurement.photos.length === 0) {
      setIsLoadingMeasurementPhotos(false);
      return;
    }

    const processedPhotos: PhotosState = {
      front: [],
      back: [],
      left: [],
      right: [],
    };
    const photosByType: Record<string, MeasurementPhoto[]> = {};

    // Group photos by type
    (measurement.photos as unknown as MeasurementPhoto[]).forEach((photo) => {
      if (photo.deletedAt) return;

      const photoType = photo.type as PhotoType;
      const validTypes: PhotoType[] = ["front", "back", "left", "right"];
      if (!validTypes.includes(photoType)) return;

      if (!photosByType[photoType]) {
        photosByType[photoType] = [];
      }
      photosByType[photoType].push(photo);
    });

    // Sort photos by creation date and convert to AssessmentPhoto
    const convertToAssessmentPhoto = (
      mPhoto: MeasurementPhoto
    ): AssessmentPhoto => ({
      id: mPhoto.id,
      type: mPhoto.type as PhotoType,
      url: mPhoto.url,
      thumbnailUrl: mPhoto.thumbnailUrl || mPhoto.url,
      storagePath: mPhoto.storagePath || "",
      createdAt: mPhoto.createdAt ? new Date(mPhoto.createdAt) : new Date(),
      updatedAt: mPhoto.updatedAt ? new Date(mPhoto.updatedAt) : new Date(),
    });

    // Process each type of photo
    (Object.keys(photosByType) as PhotoType[]).forEach((type) => {
      const sortedPhotos = photosByType[type].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA; // Most recent first
      });

      processedPhotos[type] = sortedPhotos.map(convertToAssessmentPhoto);
    });

    setPhotos(processedPhotos);
    setIsLoadingMeasurementPhotos(false);
  }, [measurement]);

  // --- Effect to Notify Parent Component of Photo State Changes ---
  useEffect(() => {
    if (onPhotosChange) {
      onPhotosChange(photos);
    }
  }, [photos, onPhotosChange]);

  // --- Function to Delete Specific Photo IDs ---
  const deletePhotoByIds = useCallback(
    async (ids: string[], type: PhotoType): Promise<boolean> => {
      if (!ids || ids.length === 0) {
        return true;
      }

      setIsProcessing((prev) => ({ ...prev, [type]: true }));
      try {
        const deletePromises = ids.map((id) => PhotoService.deletePhoto(id));
        await Promise.all(deletePromises);
        return true;
      } catch (error) {
        console.error(
          `PhotosSection (${type}): Error deleting photo(s) ${ids}:`,
          error
        );
        return false;
      } finally {
        setIsProcessing((prev) => ({ ...prev, [type]: false }));
      }
    },
    []
  );

  // --- Handler for Upload Start ---
  const handleUploadStart = useCallback(
    async (type: PhotoType): Promise<boolean> => {
      if (isProcessing[type]) {
        return false;
      }

      if (onRefreshMeasurement) {
        try {
          await onRefreshMeasurement();
        } catch (refreshError) {
          console.error(
            `PhotosSection (${type}): Error refreshing measurement data:`,
            refreshError
          );
        }
      }

      return true;
    },
    [isProcessing, onRefreshMeasurement]
  );

  // --- Handler for Upload Completion ---
  const handlePhotoChange = useCallback(
    (type: PhotoType) => (uploadedPhoto: UploadedPhoto) => {
      // Ensure thumbnailUrl is always defined
      const photo: AssessmentPhoto = {
        ...uploadedPhoto,
        thumbnailUrl: uploadedPhoto.thumbnailUrl || uploadedPhoto.url,
        storagePath: uploadedPhoto.storagePath || "",
        createdAt: uploadedPhoto.createdAt || new Date(),
        updatedAt: uploadedPhoto.updatedAt || new Date(),
      };
      setPhotos((prevPhotos) => {
        // Não adicionar se já houver 2 fotos
        if (prevPhotos[type].length >= 2) return prevPhotos;
        // Evitar duplicidade pelo id
        if (prevPhotos[type].some((p) => p.id === photo.id)) return prevPhotos;
        const updated = {
          ...prevPhotos,
          [type]: [...prevPhotos[type], photo],
        };

        return updated;
      });
    },
    []
  );

  // --- Handler for Photo Removal ---
  const handleRemovePhoto = useCallback(
    async (type: PhotoType, photoId: string): Promise<void> => {
      if (isProcessing[type]) {
        return;
      }

      const success = await deletePhotoByIds([photoId], type);
      if (success) {
        setPhotos((prev) => ({
          ...prev,
          [type]: prev[type].filter((photo) => photo.id !== photoId),
        }));
        onRefreshMeasurement?.();
      } else {
        console.error(
          `PhotosSection (${type}): Failed to remove photo via API.`
        );
      }
    },
    [isProcessing, deletePhotoByIds, onRefreshMeasurement]
  );

  // --- Handler for Upload Error ---
  const handlePhotoError = useCallback(
    (type: PhotoType) => (err: Error) => {
      console.error(
        `PhotosSection (${type}): Upload error reported by PhotoUpload:`,
        err
      );
      setIsProcessing((prev) => ({ ...prev, [type]: false }));
    },
    []
  );

  // --- Render Logic ---
  const renderPhotoUpload = (type: PhotoType, label: string) => (
    <Box key={type}>
      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
        <Typography variant="body2" sx={{ fontWeight: "medium" }}>
          {label}
        </Typography>
      </Stack>
      {isLoadingMeasurementPhotos ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 190,
            bgcolor: "grey.100",
            borderRadius: 1,
          }}
        >
          <CircularProgress size={30} />
        </Box>
      ) : (
        <Stack direction="row" spacing={2}>
          {photos[type].map((photo) => (
            <Box key={photo.id} sx={{ position: "relative" }}>
              <PhotoUpload
                type={type}
                assessmentId={measurementId || ""}
                patientId={patientId}
                onUploadComplete={handlePhotoChange(type)}
                onUploadError={handlePhotoError(type)}
                onUploadStart={() => handleUploadStart(type)}
                onRemove={() => handleRemovePhoto(type, photo.id)}
                initialPhotoUrl={photo.url}
                previewSize={{ width: 160, height: 190 }}
              />
            </Box>
          ))}
          {/* Placeholder para adicionar nova foto, se menos de 2 fotos */}
          {photos[type].length < 2 && (
            <Box key="placeholder" sx={{ position: "relative" }}>
              <PhotoUpload
                type={type}
                assessmentId={measurementId || ""}
                patientId={patientId}
                onUploadComplete={handlePhotoChange(type)}
                onUploadError={handlePhotoError(type)}
                onUploadStart={() => handleUploadStart(type)}
                onRemove={() => Promise.resolve()}
                initialPhotoUrl=""
                previewSize={{ width: 160, height: 190 }}
              />
            </Box>
          )}
        </Stack>
      )}
    </Box>
  );

  return (
    <Accordion
      expanded={expanded}
      onChange={onAccordionChange("photos")}
      sx={{
        borderBottomRightRadius: 8,
        borderBottomLeftRadius: 8,
        "&:before": {
          display: "none",
        },
        boxShadow: "none",
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Fotos</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(auto-fit, minmax(220px, 1fr))",
              md: "repeat(auto-fit, minmax(200px, 1fr))",
            },
            width: "100%",
            minWidth: 0,
          }}
        >
          {renderPhotoUpload("front", "Frente")}
          {renderPhotoUpload("back", "Costas")}
          {renderPhotoUpload("left", "Lateral Esquerda")}
          {renderPhotoUpload("right", "Lateral Direita")}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};
