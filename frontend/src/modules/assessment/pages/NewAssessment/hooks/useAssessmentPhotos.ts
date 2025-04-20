import { useState, useEffect, useRef, useCallback } from "react";
import { AssessmentPhoto, PhotoService } from "@services/photoService";
import { Measurement } from "@/modules/patient/services/patientService";

interface AssessmentPhotos {
  front: AssessmentPhoto | null;
  back: AssessmentPhoto | null;
  left: AssessmentPhoto | null;
  right: AssessmentPhoto | null;
}

// Keep MeasurementPhoto definition as provided in the original code
interface MeasurementPhoto {
  id: string;
  type: string;
  url: string;
  thumbnailUrl?: string;
  assessmentId?: string;
  createdAt?: string;
  updatedAt?: string;
  storagePath?: string;
}

const initialPhotosState: AssessmentPhotos = {
  front: null,
  back: null,
  left: null,
  right: null,
};

export const useAssessmentPhotos = (
  measurementId?: string,
  initialPhotos?: AssessmentPhotos,
  measurementData?: Measurement // Keep this for potential optimization
) => {
  const [photos, setPhotos] = useState<AssessmentPhotos>(
    initialPhotos || initialPhotosState
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  // This ref tracks if photos have been loaded *for the current measurementId*
  const hasLoadedForCurrentId = useRef(false);
  // Ref to store the previous measurementId to detect changes accurately
  const prevMeasurementIdRef = useRef<string | undefined>(measurementId);

  useEffect(() => {
    // --- 1. Handle Measurement ID Change ---
    // If the measurementId has changed, reset everything.
    if (measurementId !== prevMeasurementIdRef.current) {
      setPhotos(initialPhotos || initialPhotosState); // Reset photos (or use new initialPhotos if provided)
      setError(null); // Clear previous errors
      setLoading(false); // Reset loading state
      hasLoadedForCurrentId.current = false; // Mark as not loaded for the new ID
      prevMeasurementIdRef.current = measurementId; // Update the ref
    }

    // --- 2. Early Exits ---
    // If no measurement ID is provided, do nothing.
    if (!measurementId) {
      // Ensure state is reset if ID becomes undefined after being defined
      if (hasLoadedForCurrentId.current) {
        setPhotos(initialPhotosState);
        setError(null);
        setLoading(false);
        hasLoadedForCurrentId.current = false;
      }
      return;
    }

    // If photos have already been loaded for this specific measurementId, do nothing.
    if (hasLoadedForCurrentId.current) {
      return;
    }

    // --- 3. Attempt to Load from measurementData (Optimization) ---
    // Check if measurementData is provided and contains photos.
    // This is the primary source if available to avoid API calls.
    if (
      measurementData &&
      measurementData.id === measurementId && // Ensure data matches the current ID
      measurementData.photos &&
      Array.isArray(measurementData.photos) &&
      measurementData.photos.length > 0
    ) {
      try {
        const photosByType: AssessmentPhotos = { ...initialPhotosState };
        const processedTypes = new Set<string>();

        measurementData.photos.forEach((photo: MeasurementPhoto) => {
          if (
            photo.type &&
            ["front", "back", "left", "right"].includes(photo.type) &&
            !processedTypes.has(photo.type)
          ) {
            processedTypes.add(photo.type);
            const createdAt = photo.createdAt
              ? new Date(photo.createdAt)
              : new Date();
            const updatedAt = photo.updatedAt
              ? new Date(photo.updatedAt)
              : new Date();

            photosByType[photo.type as keyof AssessmentPhotos] = {
              id: photo.id,
              type: photo.type as keyof AssessmentPhotos,
              url: photo.url,
              thumbnailUrl: photo.thumbnailUrl || "",
              storagePath: photo.storagePath || "",
              createdAt,
              updatedAt,
            };
          }
        });

        // Only update state if we actually found photos relevant to the assessment
        if (processedTypes.size > 0) {
          setPhotos(photosByType);
          setError(null); // Clear any previous error
          hasLoadedForCurrentId.current = true; // Mark as loaded for this ID
          setLoading(false); // Ensure loading is false
          return; // IMPORTANT: Exit after successfully using measurementData
        }
        // If no photos were found, proceed to API fetch below
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Error processing measurement data photos")
        );
        // Do not set hasLoaded = true; proceed to API fetch as fallback.
      }
    }

    // --- 4. Fetch Photos from API if not loaded from measurementData ---
    const fetchPhotosFromAPI = async () => {
      if (!measurementId || hasLoadedForCurrentId.current) return;

      setLoading(true);
      try {
        const fetchedPhotos = await PhotoService.getAssessmentPhotos(
          measurementId
        );
        const photosByType: AssessmentPhotos = { ...initialPhotosState };

        fetchedPhotos.forEach((photo) => {
          if (["front", "back", "left", "right"].includes(photo.type)) {
            photosByType[photo.type as keyof AssessmentPhotos] = photo;
          }
        });

        setPhotos(photosByType);
        hasLoadedForCurrentId.current = true;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch photos")
        );
      } finally {
        setLoading(false);
      }
    };

    // Only fetch from API if we didn't get photos from measurementData
    if (!hasLoadedForCurrentId.current) {
      fetchPhotosFromAPI();
    }
  }, [measurementId, measurementData, initialPhotos]);

  // --- 5. Callback for Updating Photos ---
  // Memoize the update function using useCallback
  const updatePhoto = useCallback(
    (type: keyof AssessmentPhotos, photo: AssessmentPhoto | null) => {
      setPhotos((prevPhotos) => ({
        ...prevPhotos,
        [type]: photo,
      }));
    },
    [] // No dependencies needed as it only uses setPhotos
  );

  // --- 6. Return Values ---
  return {
    photos,
    setPhotos, // Keep setPhotos if direct state manipulation is needed externally
    updatePhoto,
    loading,
    error,
  };
};
