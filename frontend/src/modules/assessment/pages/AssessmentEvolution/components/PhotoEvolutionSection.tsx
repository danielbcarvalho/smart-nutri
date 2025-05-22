import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  IconButton,
  Button,
  Divider,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CompareIcon from "@mui/icons-material/Compare";
import GridViewIcon from "@mui/icons-material/GridView";
import TimelineIcon from "@mui/icons-material/Timeline";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { Measurement } from "@/modules/patient/services/patientService";
import { PhotoComparison } from "./PhotoComparison";
import { PhotoGallery } from "./PhotoGallery";
import { MeasurementPhoto, PhotoWithData, SelectedPhotos } from "../types";

interface PhotoEvolutionSectionProps {
  measurements: Measurement[];
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

type PhotoType = "all" | "front" | "back" | "left" | "right";
type ViewMode = "grid" | "compare" | "timeline";

// Função auxiliar para formatar datas
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("pt-BR");
};

// Componente principal com melhorias
export const PhotoEvolutionSection: React.FC<PhotoEvolutionSectionProps> = ({
  measurements,
  dateRange,
}) => {
  const [selectedPhotoType, setSelectedPhotoType] = useState<PhotoType>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhotos>({});
  const [selectedPhoto, setSelectedPhoto] = useState<{
    url: string;
    date: string;
    measurementData?: {
      weight?: number;
      bodyFat?: number;
    };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter measurements within date range
  const filteredMeasurements = useMemo(() => {
    return measurements
      .filter((measurement) => {
        const measurementDate = new Date(measurement.date);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        return measurementDate >= startDate && measurementDate <= endDate;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [measurements, dateRange]);

  // Get available photo types from measurements
  const availablePhotoTypes = useMemo(() => {
    const types = new Set<PhotoType>();
    types.add("all"); // Add "all" type
    filteredMeasurements.forEach((measurement) => {
      measurement.photos?.forEach((photo: MeasurementPhoto) => {
        if (["front", "back", "left", "right"].includes(photo.type)) {
          types.add(photo.type as PhotoType);
        }
      });
    });
    return Array.from(types);
  }, [filteredMeasurements]);

  // Get all photos of selected type with measurement data
  const availablePhotos = useMemo(() => {
    const photos: PhotoWithData[] = [];
    filteredMeasurements.forEach((measurement) => {
      measurement.photos?.forEach((photo: MeasurementPhoto) => {
        if (selectedPhotoType === "all" || photo.type === selectedPhotoType) {
          photos.push({
            photo,
            date: measurement.date,
            measurementId: measurement.id,
            measurementData: {
              weight: measurement.weight
                ? Number(measurement.weight)
                : undefined,
              bodyFat: measurement.bodyFat
                ? Number(measurement.bodyFat)
                : undefined,
            },
          });
        }
      });
    });
    return photos;
  }, [filteredMeasurements, selectedPhotoType]);

  // Auto-select the two most recent photos when changing type
  useEffect(() => {
    if (availablePhotos.length >= 2) {
      // Encontrar o tipo mais comum entre as fotos disponíveis
      const photoTypes = availablePhotos.map((p) => p.photo.type);
      const typeCount = photoTypes.reduce((acc, type) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostCommonType = Object.entries(typeCount).sort(
        (a, b) => b[1] - a[1]
      )[0][0];

      // Filtrar fotos do tipo mais comum
      const photosOfType = availablePhotos.filter(
        (p) => p.photo.type === mostCommonType
      );

      if (photosOfType.length >= 2) {
        setSelectedPhotos({
          reference: {
            ...photosOfType[0].photo,
            date: photosOfType[0].date,
            measurementData: photosOfType[0].measurementData,
          },
          compare: {
            ...photosOfType[1].photo,
            date: photosOfType[1].date,
            measurementData: photosOfType[1].measurementData,
          },
        });
      } else {
        setSelectedPhotos({
          reference: {
            ...availablePhotos[0].photo,
            date: availablePhotos[0].date,
            measurementData: availablePhotos[0].measurementData,
          },
        });
      }
    } else if (availablePhotos.length === 1) {
      setSelectedPhotos({
        reference: {
          ...availablePhotos[0].photo,
          date: availablePhotos[0].date,
          measurementData: availablePhotos[0].measurementData,
        },
      });
    } else {
      setSelectedPhotos({});
    }
  }, [selectedPhotoType, availablePhotos]);

  // Handle photo type change
  const handlePhotoTypeChange = (
    _: React.MouseEvent<HTMLElement>,
    newType: PhotoType | null
  ) => {
    if (newType) {
      setIsLoading(true);
      setTimeout(() => {
        setSelectedPhotoType(newType);
        setIsLoading(false);
      }, 500);
    }
  };

  // Handle view mode change
  const handleViewModeChange = (
    _: React.MouseEvent<HTMLElement>,
    newMode: ViewMode | null
  ) => {
    if (newMode) {
      setIsLoading(true);
      setTimeout(() => {
        setViewMode(newMode);
        setIsLoading(false);
      }, 300);
    }
  };

  // Handle photo selection
  const handlePhotoSelect = (
    photo: MeasurementPhoto,
    date: string,
    measurementData: {
      weight?: number;
      bodyFat?: number;
    }
  ) => {
    setSelectedPhotos((prev) => {
      const newState = { ...prev };

      // If this photo is already selected as reference, remove it
      if (prev.reference?.id === photo.id) {
        delete newState.reference;
      }
      // If already selected as compare, remove it
      else if (prev.compare?.id === photo.id) {
        delete newState.compare;
      }
      // If no reference photo yet, make this the reference
      else if (!prev.reference) {
        newState.reference = { ...photo, date, measurementData };
      }
      // If we have reference but no compare, make this the compare
      else if (!prev.compare) {
        newState.compare = { ...photo, date, measurementData };
      }
      // If both slots filled, replace the compare photo
      else {
        newState.compare = { ...photo, date, measurementData };
      }

      return newState;
    });
  };

  // Funções para navegação entre fotos no modal
  const handlePrevPhoto = () => {
    if (!selectedPhoto) return;
    const currentIndex = availablePhotos.findIndex(
      (item) => item.photo.url === selectedPhoto.url
    );
    if (currentIndex > 0) {
      const prev = availablePhotos[currentIndex - 1];
      setSelectedPhoto({
        url: prev.photo.url,
        date: formatDate(prev.date),
        measurementData: prev.measurementData,
      });
    }
  };

  const handleNextPhoto = () => {
    if (!selectedPhoto) return;
    const currentIndex = availablePhotos.findIndex(
      (item) => item.photo.url === selectedPhoto.url
    );
    if (currentIndex < availablePhotos.length - 1) {
      const next = availablePhotos[currentIndex + 1];
      setSelectedPhoto({
        url: next.photo.url,
        date: formatDate(next.date),
        measurementData: next.measurementData,
      });
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          gutterBottom
          fontWeight="medium"
          color="primary.main"
        >
          Evolução Fotográfica
        </Typography>
        <Divider sx={{ mb: 3 }} />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr",
              md: "1fr",
            },
          }}
        >
          <Box>
            <Typography variant="subtitle1" gutterBottom fontWeight="medium">
              Tipo de Foto
            </Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {availablePhotoTypes.map((type) => (
                <Button
                  key={type}
                  variant={
                    selectedPhotoType === type ? "contained" : "outlined"
                  }
                  color="primary"
                  size="small"
                  onClick={() =>
                    handlePhotoTypeChange(
                      {} as React.MouseEvent<HTMLElement>,
                      type
                    )
                  }
                  disabled={!availablePhotoTypes.includes(type)}
                  sx={{
                    borderRadius: 2,
                    px: 2,
                    transition: "all 0.2s",
                    minWidth: 100,
                  }}
                >
                  {type === "all"
                    ? "Todos os tipos"
                    : type === "front"
                    ? "Frente"
                    : type === "back"
                    ? "Costas"
                    : type === "left"
                    ? "Lateral Esquerda"
                    : "Lateral Direita"}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight="medium">
            Modo de Visualização
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Button
              variant={viewMode === "grid" ? "contained" : "outlined"}
              color="primary"
              size="small"
              onClick={() =>
                handleViewModeChange(
                  {} as React.MouseEvent<HTMLElement>,
                  "grid"
                )
              }
              startIcon={<GridViewIcon />}
              sx={{ borderRadius: 2 }}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === "compare" ? "contained" : "outlined"}
              color="primary"
              size="small"
              onClick={() =>
                handleViewModeChange(
                  {} as React.MouseEvent<HTMLElement>,
                  "compare"
                )
              }
              startIcon={<CompareIcon />}
              sx={{ borderRadius: 2 }}
            >
              Comparar
            </Button>
            <Button
              variant={viewMode === "timeline" ? "contained" : "outlined"}
              color="primary"
              size="small"
              onClick={() =>
                handleViewModeChange(
                  {} as React.MouseEvent<HTMLElement>,
                  "timeline"
                )
              }
              startIcon={<TimelineIcon />}
              sx={{ borderRadius: 2 }}
            >
              Timeline
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Comparação de fotos */}
      {viewMode === "compare" && (
        <PhotoComparison selectedPhotos={selectedPhotos} />
      )}

      {/* Galeria/Timeline */}
      <PhotoGallery
        photos={availablePhotos}
        selectedPhotos={selectedPhotos}
        viewMode={viewMode === "timeline" ? "timeline" : "grid"}
        isLoading={isLoading}
        onPhotoSelect={handlePhotoSelect}
        onPhotoClick={(photo, date, measurementData) =>
          setSelectedPhoto({
            url: photo.url,
            date: formatDate(date),
            measurementData,
          })
        }
      />

      {/* Photo Modal Ampliada */}
      <Dialog
        open={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: "relative", bgcolor: "#000" }}>
          <IconButton
            onClick={() => setSelectedPhoto(null)}
            sx={{
              position: "absolute",
              right: 16,
              top: 16,
              zIndex: 10,
              bgcolor: "rgba(255, 255, 255, 0.15)",
              color: "white",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.25)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          {selectedPhoto && (
            <>
              <Box
                sx={{
                  position: "absolute",
                  left: 16,
                  top: 16,
                  zIndex: 10,
                  bgcolor: "rgba(0, 0, 0, 0.7)",
                  color: "white",
                  p: 1.5,
                  borderRadius: 2,
                  maxWidth: "80%",
                }}
              >
                <Typography variant="subtitle1" fontWeight="medium">
                  {selectedPhoto.date}
                </Typography>
                {selectedPhoto.measurementData && (
                  <Stack direction="row" spacing={2} mt={0.5}>
                    {selectedPhoto.measurementData.weight && (
                      <Typography variant="body2">
                        Peso: {selectedPhoto.measurementData.weight} kg
                      </Typography>
                    )}
                    {selectedPhoto.measurementData.bodyFat && (
                      <Typography variant="body2">
                        Gordura: {selectedPhoto.measurementData.bodyFat}%
                      </Typography>
                    )}
                  </Stack>
                )}
              </Box>
              <Box
                sx={{
                  height: "90vh",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#000",
                }}
              >
                <Box
                  component="img"
                  src={selectedPhoto.url}
                  alt="Foto ampliada"
                  sx={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              </Box>

              {/* Navegação entre fotos */}
              {availablePhotos.length > 1 && (
                <>
                  <IconButton
                    sx={{
                      position: "absolute",
                      left: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      bgcolor: "rgba(255, 255, 255, 0.15)",
                      color: "white",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.25)",
                      },
                    }}
                    onClick={handlePrevPhoto}
                    disabled={
                      availablePhotos.findIndex(
                        (item) => item.photo.url === selectedPhoto?.url
                      ) === 0
                    }
                  >
                    <ChevronLeftIcon fontSize="large" />
                  </IconButton>
                  <IconButton
                    sx={{
                      position: "absolute",
                      right: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      bgcolor: "rgba(255, 255, 255, 0.15)",
                      color: "white",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.25)",
                      },
                    }}
                    onClick={handleNextPhoto}
                    disabled={
                      availablePhotos.findIndex(
                        (item) => item.photo.url === selectedPhoto?.url
                      ) ===
                      availablePhotos.length - 1
                    }
                  >
                    <ChevronRightIcon fontSize="large" />
                  </IconButton>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};
