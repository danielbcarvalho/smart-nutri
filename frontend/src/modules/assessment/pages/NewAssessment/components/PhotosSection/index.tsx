import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { PhotoUpload } from "../../../../../../components/PhotoUpload";
import {
  AssessmentPhoto,
  PhotoService,
} from "../../../../../../services/photoService";
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

interface PhotosSectionProps {
  measurementId?: string;
  patientId: string;
  sharePhotos: boolean;
  onSharePhotosChange: (checked: boolean) => void;
  onPhotosChange?: (photos: PhotosState) => void; // Type already correct
  measurement?: Measurement;
  onRefreshMeasurement?: () => Promise<void>; // Make async if it returns promise
  expanded: boolean;
  onAccordionChange: (
    panel: string
  ) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
}

type PhotosState = {
  front: AssessmentPhoto | null;
  back: AssessmentPhoto | null;
  left: AssessmentPhoto | null;
  right: AssessmentPhoto | null;
};

type PhotoType = "front" | "back" | "left" | "right";

export const PhotosSection: React.FC<PhotosSectionProps> = ({
  measurementId,
  patientId,
  sharePhotos,
  onSharePhotosChange,
  onPhotosChange,
  measurement,
  onRefreshMeasurement,
  expanded,
  onAccordionChange,
}) => {
  const [photos, setPhotos] = useState<PhotosState>({
    front: null,
    back: null,
    left: null,
    right: null,
  });

  // State for initial loading of photos from measurement
  const [isLoadingMeasurementPhotos, setIsLoadingMeasurementPhotos] =
    useState(true); // Start true
  // State for managing deletion/preparation status
  const [isProcessing, setIsProcessing] = useState<Record<PhotoType, boolean>>({
    front: false,
    back: false,
    left: false,
    right: false,
  });

  // Ref to track photos marked for deletion from the initial load (if replaced)
  const initialPhotosToDeleteRef = useRef<Record<PhotoType, string[]>>({
    front: [],
    back: [],
    left: [],
    right: [],
  });

  // --- Effect to Process Initial Measurement Photos ---
  useEffect(() => {
    setIsLoadingMeasurementPhotos(true); // Set loading true when measurement changes
    setPhotos({ front: null, back: null, left: null, right: null }); // Clear previous photos
    initialPhotosToDeleteRef.current = {
      front: [],
      back: [],
      left: [],
      right: [],
    }; // Reset delete list

    if (!measurement?.photos || measurement.photos.length === 0) {
      setIsLoadingMeasurementPhotos(false);
      return;
    }

    const processedPhotos: PhotosState = {
      front: null,
      back: null,
      left: null,
      right: null,
    };
    const photoIdsToDelete: Record<PhotoType, string[]> = {
      front: [],
      back: [],
      left: [],
      right: [],
    };
    const photosByType: Record<string, MeasurementPhoto> = {};

    // Filter for the most recent, non-deleted photo of each valid type
    (measurement.photos as unknown as MeasurementPhoto[]).forEach((photo) => {
      if (photo.deletedAt) return; // Skip soft-deleted

      const photoType = photo.type as PhotoType;
      const validTypes: PhotoType[] = ["front", "back", "left", "right"];
      if (!validTypes.includes(photoType)) return; // Skip invalid types

      const currentPhotoInMap = photosByType[photoType];
      const currentPhotoTimestamp = currentPhotoInMap?.createdAt
        ? new Date(currentPhotoInMap.createdAt).getTime()
        : 0;
      const newPhotoTimestamp = photo.createdAt
        ? new Date(photo.createdAt).getTime()
        : 0;

      if (!currentPhotoInMap || newPhotoTimestamp > currentPhotoTimestamp) {
        // If we're replacing an older photo of the same type, mark the older one for potential deletion
        if (currentPhotoInMap) {
          photoIdsToDelete[photoType].push(currentPhotoInMap.id);
        }
        photosByType[photoType] = photo; // Keep the newest one
      } else {
        // This photo is older than the one we already have, mark it for potential deletion
        photoIdsToDelete[photoType].push(photo.id);
      }
    });

    // Convert the selected latest photos
    const convertToAssessmentPhoto = (
      mPhoto: MeasurementPhoto
    ): AssessmentPhoto => ({
      id: mPhoto.id,
      type: mPhoto.type as PhotoType, // Already validated
      url: mPhoto.url,
      thumbnailUrl: mPhoto.thumbnailUrl || mPhoto.url,
      storagePath: mPhoto.storagePath || "",
      createdAt: mPhoto.createdAt ? new Date(mPhoto.createdAt) : new Date(),
      updatedAt: mPhoto.updatedAt ? new Date(mPhoto.updatedAt) : new Date(),
    });

    // Populate the state object
    (Object.keys(photosByType) as PhotoType[]).forEach((type) => {
      processedPhotos[type] = convertToAssessmentPhoto(photosByType[type]);
    });

    setPhotos(processedPhotos);
    initialPhotosToDeleteRef.current = photoIdsToDelete; // Store IDs that *weren't* the latest
    setIsLoadingMeasurementPhotos(false); // Loading finished
  }, [measurement]); // Dependency: measurement

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
        return true; // Nothing to delete
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
        // Handle error appropriately - maybe show a notification
        return false;
      } finally {
        setIsProcessing((prev) => ({ ...prev, [type]: false }));
      }
    },
    []
  );

  // --- Handler for Upload Start (Prepare Step) ---
  // This is called by PhotoUpload *before* it starts the actual upload.
  // It should delete any *previously existing* photo of the same type.
  const handleUploadStart = useCallback(
    async (type: PhotoType): Promise<boolean> => {
      if (isProcessing[type]) {
        return false; // Prevent concurrent operations for the same type
      }

      // Check if there's an *existing* photo in the current state that needs deleting
      const currentPhotoId = photos[type]?.id;
      // Also check the initial list of deletable photos (older ones from measurement load)
      const initialDeletableIds = initialPhotosToDeleteRef.current[type] || [];

      const idsToDelete = [...initialDeletableIds];
      if (currentPhotoId) {
        // Ensure we don't add the same ID twice if it was also in the initial list
        if (!idsToDelete.includes(currentPhotoId)) {
          idsToDelete.push(currentPhotoId);
        }
      }

      if (idsToDelete.length > 0) {
        const success = await deletePhotoByIds(idsToDelete, type);
        if (!success) {
          console.error(
            `PhotosSection (${type}): Failed to delete existing photos. Aborting upload start.`
          );
          return false; // Abort if deletion failed
        }
        // Clear the list for this type after successful deletion
        initialPhotosToDeleteRef.current[type] = [];
        // Clear the photo from state if its ID was deleted
        if (currentPhotoId && idsToDelete.includes(currentPhotoId)) {
          setPhotos((prev) => ({ ...prev, [type]: null }));
        }
      } else {
        console.log(
          `PhotosSection (${type}): No existing/old photos to delete.`
        );
      }

      // Optional: Refresh measurement data after deletion, before upload
      if (onRefreshMeasurement) {
        try {
          await onRefreshMeasurement();
        } catch (refreshError) {
          console.error(
            `PhotosSection (${type}): Error refreshing measurement data:`,
            refreshError
          );
          // Decide if this is critical - maybe proceed anyway?
        }
      }

      // Add a small delay to allow backend processing if needed (optional)
      // await new Promise(resolve => setTimeout(resolve, 200));

      return true; // Allow PhotoUpload to proceed
    },
    [photos, isProcessing, deletePhotoByIds, onRefreshMeasurement]
  );

  // --- Handler for Upload Completion ---
  // Called by PhotoUpload when its upload is successful.
  const handlePhotoChange = useCallback(
    (type: PhotoType) => (uploadedPhoto: AssessmentPhoto) => {
      setPhotos((prevPhotos) => ({
        ...prevPhotos,
        [type]: uploadedPhoto, // Update state with the new photo object
      }));
      // No need to refresh measurement here usually, as the upload is the latest action.
      // Parent component might refresh later if needed.
    },
    []
  );

  // --- Handler for Explicit Photo Removal (via Delete Button) ---
  // Called by PhotoUpload's onRemove prop.
  const handleRemovePhoto = useCallback(
    async (type: PhotoType): Promise<void> => {
      if (isProcessing[type]) {
        return; // Prevent concurrent operations
      }
      const photoToRemove = photos[type];

      if (photoToRemove && photoToRemove.id) {
        // No need to clear local state here, PhotoUpload did it for immediate feedback.
        // Just call the delete API.
        const success = await deletePhotoByIds([photoToRemove.id], type);
        if (success) {
          // Clear the initial deletable list for this type as well, just in case
          initialPhotosToDeleteRef.current[type] = [];
          // Ensure local state is definitely null after successful API delete
          setPhotos((prev) => ({ ...prev, [type]: null }));
          // Optionally refresh measurement data
          onRefreshMeasurement?.();
        } else {
          console.error(
            `PhotosSection (${type}): Failed to remove photo via API. UI might be out of sync.`
          );
          // Handle error - maybe try to restore the photo in UI or show message?
          // For now, log it. The UI state is already cleared in PhotoUpload.
        }
      } else {
        // Ensure local state is null if somehow it wasn't cleared by PhotoUpload
        setPhotos((prev) => ({ ...prev, [type]: null }));
      }
    },
    [photos, isProcessing, deletePhotoByIds, onRefreshMeasurement]
  );

  // --- Handler for Upload Error ---
  const handlePhotoError = useCallback(
    (type: PhotoType) => (err: Error) => {
      console.error(
        `PhotosSection (${type}): Upload error reported by PhotoUpload:`,
        err
      );
      // Reset processing state for this type if an error occurs during upload sequence
      setIsProcessing((prev) => ({ ...prev, [type]: false }));
      // Maybe show a general error notification to the user (e.g., using a Snackbar)
    },
    []
  );

  // --- Render Logic ---
  const renderPhotoUpload = (type: PhotoType, label: string) => (
    <Grid item xs={12} sm={6} md={3} key={type}>
      <Typography variant="body2" gutterBottom sx={{ fontWeight: "medium" }}>
        {label}
      </Typography>
      {isLoadingMeasurementPhotos ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 250,
            bgcolor: "grey.100",
            borderRadius: 1,
          }}
        >
          <CircularProgress size={30} />
        </Box>
      ) : (
        <PhotoUpload
          type={type}
          assessmentId={measurementId || ""}
          patientId={patientId}
          // Pass the correct handler for completion
          onUploadComplete={handlePhotoChange(type)}
          // Pass the specific error handler for this type
          onUploadError={handlePhotoError(type)}
          // Pass the prepare handler
          onUploadStart={() => handleUploadStart(type)}
          // Pass the remove handler
          onRemove={handleRemovePhoto}
          // Get URL safely from state
          initialPhotoUrl={photos[type]?.url || ""}
          // Define consistent preview size
          previewSize={{ width: 200, height: 250 }}
        />
      )}
    </Grid>
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
        <Grid container spacing={2}>
          {renderPhotoUpload("front", "Frente")}
          {renderPhotoUpload("back", "Costas")}
          {renderPhotoUpload("left", "Lateral Esquerda")}
          {renderPhotoUpload("right", "Lateral Direita")}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};
