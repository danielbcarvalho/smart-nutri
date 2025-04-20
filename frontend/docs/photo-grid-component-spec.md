# PhotoGrid Component Technical Specification

## Overview

The PhotoGrid component provides a 2x2 grid layout for managing the four types of assessment photos (front, back, left, right). It integrates with the PhotoUpload component and provides a cohesive interface for photo management.

## Component Interface

```typescript
interface PhotoGridProps {
  // Required props
  assessmentId: string;
  patientId: string;
  onPhotosChange: (photos: AssessmentPhoto[]) => void;

  // Optional props
  initialPhotos?: AssessmentPhoto[];
  readOnly?: boolean;
  gridSize?: {
    width: number;
    height: number;
  };
  showLabels?: boolean;
  enableFullscreen?: boolean;
}

interface PhotoGridState {
  photos: Record<PhotoType, AssessmentPhoto | null>;
  activePhoto: PhotoType | null;
  isFullscreen: boolean;
  loading: boolean;
  error: string | null;
}

type PhotoType = "front" | "back" | "left" | "right";

interface PhotoPosition {
  type: PhotoType;
  label: string;
  description: string;
  position: {
    row: number;
    col: number;
  };
}
```

## Grid Layout Configuration

```typescript
const PHOTO_POSITIONS: PhotoPosition[] = [
  {
    type: "front",
    label: "Frente",
    description: "Foto frontal do paciente",
    position: { row: 0, col: 0 },
  },
  {
    type: "back",
    label: "Costas",
    description: "Foto posterior do paciente",
    position: { row: 0, col: 1 },
  },
  {
    type: "left",
    label: "Lado Esquerdo",
    description: "Foto lateral esquerda do paciente",
    position: { row: 1, col: 0 },
  },
  {
    type: "right",
    label: "Lado Direito",
    description: "Foto lateral direita do paciente",
    position: { row: 1, col: 1 },
  },
];
```

## Component Structure

```tsx
// PhotoGrid/index.tsx
import React, { useState, useEffect } from "react";
import { Grid, Box, Typography } from "@mui/material";
import { PhotoUpload } from "../PhotoUpload";
import { PhotoPreviewModal } from "../PhotoPreviewModal";
import { usePhotoGrid } from "./usePhotoGrid";
import { PhotoGridProps, PhotoGridState, PhotoType } from "./types";
import { StyledGridContainer, PhotoCell } from "./styles";

export const PhotoGrid: React.FC<PhotoGridProps> = ({
  assessmentId,
  patientId,
  onPhotosChange,
  initialPhotos = [],
  readOnly = false,
  gridSize = { width: 600, height: 600 },
  showLabels = true,
  enableFullscreen = true,
}) => {
  // Component implementation
};
```

## Custom Hook

```typescript
// usePhotoGrid.ts
interface UsePhotoGridProps {
  assessmentId: string;
  patientId: string;
  initialPhotos?: AssessmentPhoto[];
  onPhotosChange: (photos: AssessmentPhoto[]) => void;
}

interface UsePhotoGridReturn {
  photos: Record<PhotoType, AssessmentPhoto | null>;
  loading: boolean;
  error: string | null;
  handlePhotoUpload: (type: PhotoType, photo: AssessmentPhoto) => void;
  handlePhotoDelete: (type: PhotoType) => Promise<void>;
  handlePhotoView: (type: PhotoType) => void;
}

export const usePhotoGrid = ({
  assessmentId,
  patientId,
  initialPhotos,
  onPhotosChange,
}: UsePhotoGridProps): UsePhotoGridReturn => {
  // Hook implementation
};
```

## Styles

```typescript
// styles.ts
import { styled } from "@mui/material/styles";
import { Box, Paper } from "@mui/material";

export const StyledGridContainer = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gridTemplateRows: "repeat(2, 1fr)",
  gap: theme.spacing(2),
  width: "100%",
  height: "100%",
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));

export const PhotoCell = styled(Paper)(({ theme }) => ({
  position: "relative",
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  cursor: "pointer",
  transition: "all 0.2s ease",

  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: theme.shadows[4],
  },

  "&.empty": {
    backgroundColor: theme.palette.grey[100],
    border: `2px dashed ${theme.palette.grey[300]}`,
  },

  "&.active": {
    borderColor: theme.palette.primary.main,
    boxShadow: theme.shadows[4],
  },
}));
```

## Features

### 1. Grid Layout

- 2x2 responsive grid
- Maintains aspect ratio
- Equal cell sizes
- Consistent spacing
- Responsive to container size

### 2. Photo Management

- Upload interface for each position
- Preview of uploaded photos
- Delete functionality
- Fullscreen preview
- Loading states
- Error handling

### 3. Navigation

- Click to upload/preview
- Keyboard navigation
- Focus management
- Touch support

### 4. Visual Feedback

- Upload progress
- Success/error states
- Loading indicators
- Hover effects
- Active states

## Component Methods

```typescript
// Photo management
const handlePhotoUpload = (type: PhotoType, photo: AssessmentPhoto) => {
  setPhotos((prev) => ({
    ...prev,
    [type]: photo,
  }));
  onPhotosChange(Object.values(photos).filter(Boolean));
};

// Photo deletion
const handlePhotoDelete = async (type: PhotoType) => {
  try {
    setLoading(true);
    const photo = photos[type];
    if (photo) {
      await PhotoService.deletePhoto(photo.id);
      setPhotos((prev) => ({
        ...prev,
        [type]: null,
      }));
      onPhotosChange(Object.values(photos).filter(Boolean));
    }
  } catch (error) {
    setError("Failed to delete photo");
  } finally {
    setLoading(false);
  }
};

// Fullscreen preview
const handlePhotoView = (type: PhotoType) => {
  if (photos[type]) {
    setActivePhoto(type);
    setIsFullscreen(true);
  }
};
```

## Error Handling

1. Upload Errors

   - File selection failed
   - Upload failed
   - Invalid file type
   - Size limits exceeded

2. Display Errors

   - Image loading failed
   - Invalid URL
   - Missing permissions

3. Delete Errors
   - Delete failed
   - Network errors
   - Permission errors

## Accessibility

1. Keyboard Navigation

   - Tab through grid cells
   - Space/Enter to trigger actions
   - Escape to exit fullscreen
   - Arrow keys navigation

2. Screen Reader Support

   - Descriptive labels
   - Status announcements
   - Error notifications
   - ARIA attributes

3. Focus Management
   - Trap focus in modals
   - Restore focus on close
   - Focus indicators

## Usage Example

```tsx
<PhotoGrid
  assessmentId="123"
  patientId="456"
  onPhotosChange={(photos) => {
    console.log("Photos updated:", photos);
  }}
  initialPhotos={[
    {
      id: "1",
      type: "front",
      url: "https://...",
      thumbnailUrl: "https://...",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]}
  gridSize={{ width: 600, height: 600 }}
  showLabels={true}
  enableFullscreen={true}
/>
```

## Testing Strategy

1. Unit Tests

   - Grid layout
   - Photo management
   - Event handlers
   - State management

2. Integration Tests

   - PhotoUpload integration
   - Modal interactions
   - Error handling
   - Photo service integration

3. Visual Tests
   - Layout consistency
   - Responsive behavior
   - Loading states
   - Error states

## Performance Considerations

1. Image Loading

   - Lazy loading
   - Progressive loading
   - Thumbnail usage
   - Caching strategy

2. Interaction Optimization

   - Debounced actions
   - Throttled events
   - Memoized callbacks
   - Optimized re-renders

3. Memory Management
   - Cleanup on unmount
   - Resource disposal
   - Event listener cleanup

## Dependencies

- @mui/material: ^5.x
- @mui/icons-material: ^5.x
- react-image-lightbox: ^5.x (optional, for enhanced fullscreen)

## Future Enhancements

1. Advanced Features

   - Drag and drop reordering
   - Batch upload
   - Comparison view
   - Timeline view

2. UI Improvements

   - Custom animations
   - Advanced transitions
   - Grid customization
   - Theme integration

3. Integration Options
   - Export functionality
   - Share capabilities
   - Print layout
   - Report generation
