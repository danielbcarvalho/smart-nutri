# PhotoUpload Component Technical Specification

## Overview

The PhotoUpload component is responsible for handling photo uploads in the assessment photo evolution feature. It provides a user-friendly interface for selecting, previewing, and uploading photos with proper validation and error handling.

## Component Interface

```typescript
interface PhotoUploadProps {
  // Required props
  type: "front" | "back" | "left" | "right";
  assessmentId: string;
  patientId: string;
  onUploadComplete: (photoData: AssessmentPhoto) => void;
  onUploadError: (error: Error) => void;

  // Optional props
  initialPhotoUrl?: string;
  maxFileSizeMB?: number; // defaults to 5
  acceptedFormats?: string[]; // defaults to ['.jpg', '.jpeg', '.png']
  showPreview?: boolean; // defaults to true
  previewSize?: {
    width: number;
    height: number;
  };
}

interface AssessmentPhoto {
  id: string;
  type: "front" | "back" | "left" | "right";
  url: string;
  assessmentId: string;
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PhotoUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  selectedFile: File | null;
  previewUrl: string | null;
}
```

## Component Structure

```tsx
// PhotoUpload/index.tsx
import React, { useState, useRef, useCallback } from "react";
import { Box, Typography, CircularProgress, IconButton } from "@mui/material";
import { useDropzone } from "react-dropzone";
import { usePhotoUpload } from "../../hooks/usePhotoUpload";
import { PhotoUploadProps, PhotoUploadState } from "./types";
import { StyledDropzone, PreviewContainer } from "./styles";

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  type,
  assessmentId,
  patientId,
  onUploadComplete,
  onUploadError,
  initialPhotoUrl,
  maxFileSizeMB = 5,
  acceptedFormats = [".jpg", ".jpeg", ".png"],
  showPreview = true,
  previewSize = { width: 200, height: 200 },
}) => {
  // Component implementation
};
```

## State Management

The component will use React's useState hook for local state management:

```typescript
// Local state
const [state, setState] = useState<PhotoUploadState>({
  isUploading: false,
  progress: 0,
  error: null,
  selectedFile: null,
  previewUrl: initialPhotoUrl || null,
});

// Custom hook for upload logic
const { uploadPhoto, cancelUpload } = usePhotoUpload();
```

## Key Features

### 1. File Selection

- Drag and drop support
- Click to select file
- File type validation
- File size validation
- Image dimension validation

### 2. Preview

- Immediate preview after selection
- Responsive preview container
- Maintain aspect ratio
- Placeholder for empty state
- Error state visualization

### 3. Upload Progress

- Progress indicator
- Cancel upload option
- Error handling with retry
- Success confirmation

## Component Methods

```typescript
// File validation
const validateFile = (file: File): string | null => {
  if (!file) return "No file selected";

  if (file.size > maxFileSizeMB * 1024 * 1024) {
    return `File size must be less than ${maxFileSizeMB}MB`;
  }

  const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
  if (!acceptedFormats.includes(fileExtension)) {
    return `File type must be one of: ${acceptedFormats.join(", ")}`;
  }

  return null;
};

// File processing
const processFile = async (file: File): Promise<void> => {
  const error = validateFile(file);
  if (error) {
    setState((prev) => ({ ...prev, error }));
    return;
  }

  // Create preview
  const previewUrl = URL.createObjectURL(file);
  setState((prev) => ({
    ...prev,
    selectedFile: file,
    previewUrl,
    error: null,
  }));
};

// Upload handling
const handleUpload = async (): Promise<void> => {
  if (!state.selectedFile) return;

  setState((prev) => ({ ...prev, isUploading: true, error: null }));

  try {
    const photo = await uploadPhoto({
      file: state.selectedFile,
      type,
      assessmentId,
      patientId,
      onProgress: (progress) => {
        setState((prev) => ({ ...prev, progress }));
      },
    });

    onUploadComplete(photo);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Upload failed";
    setState((prev) => ({ ...prev, error: errorMessage }));
    onUploadError(error as Error);
  } finally {
    setState((prev) => ({ ...prev, isUploading: false, progress: 0 }));
  }
};
```

## Styles

```typescript
// styles.ts
import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

export const StyledDropzone = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.grey[300]}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  textAlign: "center",
  cursor: "pointer",
  transition: "border-color 0.2s ease",

  "&:hover": {
    borderColor: theme.palette.primary.main,
  },

  "&.error": {
    borderColor: theme.palette.error.main,
  },

  "&.dragging": {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

export const PreviewContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  height: "100%",
  overflow: "hidden",
  borderRadius: theme.shape.borderRadius,

  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
}));
```

## Error Handling

1. Validation Errors

   - File size exceeded
   - Invalid file type
   - Image dimensions invalid
   - No file selected

2. Upload Errors

   - Network errors
   - Server errors
   - Storage quota exceeded
   - Invalid file format

3. Runtime Errors
   - Preview generation failed
   - File reading failed
   - Component unmounted during upload

## Accessibility

1. Keyboard Navigation

   - Tab focus support
   - Space/Enter to trigger file selection
   - Escape to cancel upload

2. ARIA Attributes

   - aria-label for upload area
   - aria-busy during upload
   - aria-invalid for error states
   - role="button" for clickable areas

3. Screen Reader Support
   - Meaningful alt text
   - Status announcements
   - Error notifications

## Usage Example

```tsx
<PhotoUpload
  type="front"
  assessmentId="123"
  patientId="456"
  onUploadComplete={(photo) => {}}
  onUploadError={(error) => {
    console.error("Upload failed:", error);
  }}
  maxFileSizeMB={5}
  acceptedFormats={[".jpg", ".jpeg", ".png"]}
  showPreview={true}
  previewSize={{ width: 200, height: 200 }}
/>
```

## Testing Strategy

1. Unit Tests

   - File validation
   - State management
   - Error handling
   - Component lifecycle

2. Integration Tests

   - File selection flow
   - Upload process
   - Error scenarios
   - Preview generation

3. E2E Tests
   - Complete upload flow
   - Cancellation
   - Error recovery
   - Multiple file handling

## Performance Considerations

1. Image Optimization

   - Client-side compression
   - Thumbnail generation
   - Lazy loading of previews

2. Memory Management

   - Cleanup of preview URLs
   - Proper unmounting
   - Cancel in-progress uploads

3. Network Optimization
   - Chunk uploads
   - Progress tracking
   - Retry mechanism

## Dependencies

- @mui/material: ^5.x
- react-dropzone: ^11.x
- @supabase/supabase-js: ^2.x

## Future Enhancements

1. Image Editing

   - Basic cropping
   - Rotation
   - Filters

2. Batch Upload

   - Multiple file selection
   - Queue management
   - Bulk progress tracking

3. Advanced Preview
   - Zoom controls
   - Pan functionality
   - Full-screen view
