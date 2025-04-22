// PhotoUpload.tsx:

import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  LinearProgress, // Added
  IconButton, // Added
  Paper, // Added
  Fade, // Added
  Tooltip, // Added for icon button labels
  styled, // Added for potentially keeping StyledDropzone if needed
} from "@mui/material";
import { useDropzone, Accept } from "react-dropzone";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import DeleteIcon from "@mui/icons-material/Delete"; // Added
import EditIcon from "@mui/icons-material/Edit"; // Added
// Keep existing imports if they were used in types/styles
import { PhotoUploadProps, PhotoUploadState } from "./types";
// Keep StyledDropzone if it has specific base styles you want to retain, otherwise remove.
// Example: If StyledDropzone only set basic border/display, we can do that in Paper now.
// import { StyledDropzone, PreviewContainer } from "./styles"; // PreviewContainer might be redundant now
import { usePhotoUpload } from "../../hooks/usePhotoUpload";
import { AssessmentPhoto } from "../../../../services/photoService"; // Ensure correct path

// Define PhotoType if not globally available
type PhotoType = "front" | "back" | "left" | "right";

// Extend props to include onRemove
interface ExtendedPhotoUploadProps extends PhotoUploadProps {
  onRemove?: (type: PhotoType) => Promise<void>; // Make it async if needed
}

const DEFAULT_MAX_SIZE_MB = 5;
const DEFAULT_FORMATS = [".jpg", ".jpeg", ".png"];

// --- StyledDropzone Definition (Optional - Keep if needed, otherwise remove) ---
// If you keep this, ensure it doesn't conflict with Paper styling.
// It might be better to apply styles directly via sx on Paper/Box.
const StyledDropzone = styled(Box)(({ theme }) => ({
  // Minimal styles if kept, e.g., basic display setup
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "100%",
  textAlign: "center",
  outline: "none", // Remove default focus outline
  position: "relative",
  // Remove border, background etc. - let Paper handle it
}));
// --- PreviewContainer Definition (Likely Redundant) ---
// Remove this if using inline styles or Box for the preview image container

function getAcceptObject(formats: string[]): Accept {
  const accept: Accept = {};
  formats.forEach((f) => {
    if (f === ".jpg" || f === ".jpeg") accept["image/jpeg"] = [];
    if (f === ".png") accept["image/png"] = [];
  });
  return accept;
}

export const PhotoUpload: React.FC<ExtendedPhotoUploadProps> = ({
  type,
  assessmentId,
  patientId,
  onUploadComplete,
  onUploadError,
  onUploadStart,
  initialPhotoUrl,
  onRemove, // Added prop
  maxFileSizeMB = DEFAULT_MAX_SIZE_MB,
  acceptedFormats = DEFAULT_FORMATS,
  showPreview = true, // Keep prop if needed, but preview is central now
  previewSize = { width: 200, height: 250 }, // Default matches PhotosSection usage
}) => {
  const [state, setState] = useState<PhotoUploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    selectedFile: null,
    previewUrl: initialPhotoUrl || null,
  });
  const [isHovering, setIsHovering] = useState(false); // Track hover state

  // Hook for upload logic
  const {
    isUploading: hookIsUploading, // Rename to avoid conflict
    progress: hookProgress,
    error: hookUploadError,
    uploadPhoto,
  } = usePhotoUpload();

  // Sync hook state with local component state
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      isUploading: hookIsUploading,
      progress: hookProgress,
      // Prefer local error state first, then hook's error
      error: prev.error || hookUploadError,
    }));
  }, [hookIsUploading, hookProgress, hookUploadError]);

  // Update previewUrl when initialPhotoUrl changes externally (e.g., loaded from measurement)
  useEffect(() => {
    // Only update if the external prop changes *and* differs from current preview
    // and we are not currently uploading (to avoid flicker during upload process)
    if (initialPhotoUrl !== state.previewUrl && !state.isUploading) {
      setState((prev) => ({
        ...prev,
        previewUrl: initialPhotoUrl || null,
        error: null, // Clear previous errors when initial photo loads
      }));
    }
  }, [initialPhotoUrl, state.isUploading]); // Removed state.previewUrl dependency here to prevent loops

  // --- File Validation ---
  const validateFile = (file: File): string | null => {
    // ... (validation logic remains the same)
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

  // --- File Processing & Upload ---
  const processFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setState((prev) => ({
        ...prev,
        error: validationError,
        isUploading: false,
      }));
      onUploadError?.(new Error(validationError));
      return;
    }

    // Clear previous errors and reset progress before starting
    setState((prev) => ({
      ...prev,
      error: null,
      progress: 0,
      selectedFile: file,
    }));

    // Call onUploadStart (prepare step in parent)
    let canProceed = true;
    if (onUploadStart) {
      try {
        // Set uploading state *before* calling onUploadStart
        // This prevents rapid clicks/drops from triggering multiple preparations
        setState((prev) => ({ ...prev, isUploading: true }));
        canProceed = await onUploadStart();
        if (!canProceed) {
          setState((prev) => ({
            ...prev,
            isUploading: false,
            selectedFile: null,
          })); // Reset state if cancelled
          return;
        }
      } catch (err) {
        console.error(
          `Error PhotoUpload (${type}): Error during onUploadStart:`,
          err
        );
        const error =
          err instanceof Error ? err : new Error("Erro ao preparar upload");
        setState((prev) => ({
          ...prev,
          isUploading: false,
          error: error.message,
          selectedFile: null,
        }));
        onUploadError?.(error);
        return;
      }
    } else {
      // If no onUploadStart, set uploading state here
      setState((prev) => ({ ...prev, isUploading: true }));
    }

    // Generate temporary local preview URL *before* upload starts
    const localPreviewUrl = URL.createObjectURL(file);
    setState((prev) => ({ ...prev, previewUrl: localPreviewUrl }));

    // Perform the actual upload using the hook
    try {
      const photo: AssessmentPhoto = await uploadPhoto({
        // Ensure AssessmentPhoto type is correct
        file,
        type,
        assessmentId,
        patientId,
      });

      // Clean up temporary URL
      URL.revokeObjectURL(localPreviewUrl);

      // Update state with final URL from successful upload
      setState((prev) => ({
        ...prev,
        previewUrl: photo.url, // Use URL from backend response
        isUploading: false,
        progress: 100,
        error: null,
        selectedFile: null, // Clear selected file after successful upload
      }));

      // Pass the AssessmentPhoto object up
      onUploadComplete(photo); // Pass the correct type
    } catch (err) {
      console.error(`Error PhotoUpload (${type}): Upload failed:`, err);
      // Clean up temporary URL on error too
      URL.revokeObjectURL(localPreviewUrl);

      const errorMsg =
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao fazer upload";
      setState((prev) => ({
        ...prev,
        isUploading: false,
        error: errorMsg,
        // Keep selectedFile on error? Maybe allow retry? For now, clear preview.
        // previewUrl: null, // Optionally clear preview on error
        selectedFile: null,
      }));
      onUploadError?.(err instanceof Error ? err : new Error(errorMsg));
    }
  };

  // --- Dropzone Handler ---
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (state.isUploading) {
        return; // Don't allow drop while uploading
      }
      if (acceptedFiles && acceptedFiles[0]) {
        console.log(
          `PhotoUpload (${type}): File dropped:`,
          acceptedFiles[0].name
        );
        processFile(acceptedFiles[0]);
      } else {
        // Handle rejected files (e.g., wrong type/size)
        console.log(`PhotoUpload (${type}): File rejected or no file dropped.`);
        // Optionally set an error message based on rejection reasons if provided by react-dropzone
      }
    },
    [state.isUploading, processFile]
  ); // Add dependencies

  // --- Action Button Handlers ---
  const handleRemoveClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering dropzone
    setIsHovering(false); // Hide overlay immediately

    // Clear local state first for instant UI feedback
    setState((prev) => ({
      ...prev,
      previewUrl: null,
      selectedFile: null,
      error: null,
      isUploading: false,
      progress: 0,
    }));

    // Call the parent's remove handler (which should handle API calls)
    if (onRemove) {
      try {
        await onRemove(type);
      } catch (error) {
        console.error(
          `error PhotoUpload (${type}): Error in parent onRemove handler:`,
          error
        );
        // Decide how to handle error - maybe show a message?
      }
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Simply trigger the file input click again via the dropzone's root props
    // Find the input element via ref if necessary, but getRootProps usually handles it.
    // This relies on the <input> being part of the DOM generated by getInputProps().
    const inputElement = document.getElementById(`${type}-photo-input`); // Assuming input has an ID
    if (inputElement) {
      inputElement.click();
    } else {
      console.warn(
        `error PhotoUpload (${type}): Could not find input element to trigger edit.`
      );
    }
    setIsHovering(false);
  };

  // --- Dropzone Setup ---
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isFocused, // For keyboard focus indication
    isDragAccept, // File type/size is acceptable
    isDragReject, // File type/size is rejected
  } = useDropzone({
    onDrop,
    multiple: false,
    accept: getAcceptObject(acceptedFormats),
    maxSize: maxFileSizeMB * 1024 * 1024,
    disabled: state.isUploading, // Disable dropzone when uploading
    noClick: state.isUploading || !!state.previewUrl, // Disable click on area if uploading or has preview (use buttons instead)
    noKeyboard: state.isUploading,
  });

  // --- Dynamic Styling based on State ---
  const hasError = !!state.error; // Use local error state
  const effectivePreviewUrl = state.previewUrl; // Use local state for preview

  // --- Render ---
  return (
    <Box>
      <Paper
        variant="outlined"
        elevation={0} // Use elevation 0 for outlined, or 1+ for shadow
        sx={{
          width: previewSize.width,
          height: previewSize.height,
          position: "relative",
          overflow: "hidden",
          bgcolor: isDragAccept
            ? "success.light"
            : isDragReject
            ? "error.light"
            : hasError
            ? "error.lighter"
            : "grey.100", // Lighter error bg
          borderColor: hasError
            ? "error.main"
            : isDragActive || isFocused
            ? "primary.main"
            : "divider", // Use theme divider color
          borderWidth: isDragActive || isFocused || hasError ? "2px" : "1px",
          borderStyle: isDragActive && !isDragReject ? "dashed" : "solid", // Dashed on active drag, solid otherwise/error
          transition: (theme) =>
            theme.transitions.create(
              [
                "border-color",
                "background-color",
                "border-width",
                "border-style",
              ],
              {
                duration: theme.transitions.duration.shortest,
              }
            ),
          "&:hover": {
            borderColor:
              !hasError && !isDragActive ? "primary.light" : undefined,
            bgcolor:
              !isDragActive && !hasError && !effectivePreviewUrl
                ? "grey.200"
                : undefined, // Only change bg on hover if empty
          },
          // Apply cursor style here based on state
          cursor: state.isUploading
            ? "default"
            : effectivePreviewUrl
            ? "default"
            : "pointer",
        }}
        onMouseEnter={() =>
          effectivePreviewUrl && !state.isUploading && setIsHovering(true)
        } // Show overlay only if preview exists and not uploading
        onMouseLeave={() => setIsHovering(false)}
        // Spread dropzone props here - allows Paper to be the drop target
        {...getRootProps()}
        role="button" // Keep role for accessibility
        aria-label={`Upload area for ${type} photo`}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${type}-error-message` : undefined}
        tabIndex={state.isUploading ? -1 : 0} // Manage focusability
      >
        {/* We apply getRootProps to the Paper now, StyledDropzone is mainly for content layout */}
        <StyledDropzone // Use this Box/Styled component for centering content within Paper
          sx={{ cursor: "inherit" }} // Inherit cursor from Paper
        >
          {/* Input MUST be inside the element with getRootProps */}
          <input {...getInputProps()} id={`${type}-photo-input`} />

          {/* === Loading Overlay === */}
          {state.isUploading && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                bgcolor: "rgba(255, 255, 255, 0.85)", // Slightly more opaque
                zIndex: 3, // Above preview/placeholder and buttons
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                p: 1,
              }}
            >
              <CircularProgress size={40} />
              <LinearProgress
                variant="determinate"
                value={state.progress}
                sx={{ width: "80%", mt: 1.5 }}
              />
              <Typography
                variant="caption"
                color="textSecondary"
                mt={1}
                sx={{ fontWeight: "medium" }}
              >
                Enviando...{" "}
                {state.progress > 0 && `${Math.round(state.progress)}%`}
              </Typography>
            </Box>
          )}

          {/* === Preview or Placeholder === */}
          {/* Condition: Not uploading AND has a preview URL */}
          {!state.isUploading && effectivePreviewUrl && showPreview ? (
            <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
              <img
                // Add onError handler for broken images
                onError={(e) => {
                  console.warn(
                    `Error PhotoUpload (${type}): Failed to load image ${effectivePreviewUrl}`
                  );
                  // Optionally clear the preview or show a placeholder image on error
                  // e.currentTarget.src = '/path/to/placeholder-image.png';
                  // Or set state error:
                  // setState(prev => ({...prev, error: "Erro ao carregar imagem", previewUrl: null}));
                }}
                src={`${effectivePreviewUrl}${
                  effectivePreviewUrl.includes("?") ? "&" : "?"
                }t=${Date.now()}`} // Cache buster
                alt={`Preview for ${type}`}
                style={{
                  display: "block",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }} // block display removes small gap below image
              />
              {/* Action Buttons Overlay */}
              <Fade in={isHovering && !state.isUploading} timeout={200}>
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    bgcolor: "rgba(0,0,0,0.6)",
                    zIndex: 2, // Below loading overlay
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
                  <Tooltip title="Alterar Foto">
                    {/* IconButton needs stopPropagation to prevent Paper's click */}
                    <IconButton
                      size="small"
                      sx={{ color: "white" }}
                      onClick={handleEditClick}
                      aria-label={`Change ${type} photo`}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  {onRemove && ( // Only show remove if handler is provided
                    <Tooltip title="Remover Foto">
                      <IconButton
                        size="small"
                        sx={{ color: "white" }}
                        onClick={handleRemoveClick}
                        aria-label={`Remove ${type} photo`}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Fade>
            </Box>
          ) : (
            // === Placeholder Content ===
            // Condition: Not uploading AND no preview URL
            !state.isUploading &&
            !effectivePreviewUrl && (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                p={1}
                sx={{ color: hasError ? "error.main" : "text.secondary" }} // Adjust color based on error state
              >
                <InsertPhotoIcon
                  sx={{
                    fontSize: 48,
                    mb: 1,
                    color: hasError ? "error.light" : "action",
                  }}
                />
                <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                  {isDragActive
                    ? isDragReject
                      ? "Arquivo inválido"
                      : "Solte a foto aqui"
                    : "Arraste ou clique"}
                </Typography>
                <Typography variant="caption">
                  (JPG, PNG até {maxFileSizeMB}MB)
                </Typography>
              </Box>
            )
          )}
        </StyledDropzone>
      </Paper>

      {/* === Error Message Below Component === */}
      {hasError &&
        !state.isUploading && ( // Only show if not uploading (avoid showing during upload failures until finalized)
          <Box
            mt={1}
            display="flex"
            alignItems="center"
            color="error.main"
            id={`${type}-error-message`}
          >
            <ErrorOutlineIcon fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="caption">{state.error}</Typography>
          </Box>
        )}
    </Box>
  );
};
