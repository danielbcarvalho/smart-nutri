import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogContent,
  IconButton,
  Checkbox,
  Tabs,
  Tab,
  Tooltip,
  Chip,
  Button,
  Divider,
  Slide,
  CircularProgress,
  useTheme,
  alpha,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ImageIcon from "@mui/icons-material/Image";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CompareIcon from "@mui/icons-material/Compare";
import GridViewIcon from "@mui/icons-material/GridView";
import TimelineIcon from "@mui/icons-material/Timeline";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ShareIcon from "@mui/icons-material/Share";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
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

interface ImageComparisonProps {
  leftImage: string;
  rightImage: string;
  leftLabel: string;
  rightLabel: string;
}

interface PhotoTimelineProps {
  photos: Array<{
    photo: MeasurementPhoto;
    date: string;
    measurementId: string;
    measurementData: {
      weight?: number;
      bodyFat?: number;
    };
  }>;
  onPhotoClick: (item: {
    photo: MeasurementPhoto;
    date: string;
    measurementId: string;
    measurementData: {
      weight?: number;
      bodyFat?: number;
    };
  }) => void;
}

// Componente para exibir uma miniatura de foto com melhor feedback visual
const PhotoThumbnail = ({
  photo,
  date,
  measurementData,
  isSelected,
  onSelect,
  onClick,
}: {
  photo: MeasurementPhoto;
  date: string;
  measurementData?: { weight?: number; bodyFat?: number };
  isSelected: boolean;
  onSelect: () => void;
  onClick: () => void;
}) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={isSelected ? 8 : 2}
      sx={{
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: 320,
        width: 280,
        maxWidth: "100%",
        transition: "all 0.3s ease",
        transform: isSelected ? "scale(1.02)" : "scale(1)",
        border: isSelected ? `2px solid ${theme.palette.primary.main}` : "none",
      }}
    >
      <Box
        sx={{
          bgcolor: isSelected ? "primary.main" : "primary.light",
          color: isSelected ? "white" : "primary.dark",
          p: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          variant="subtitle2"
          fontWeight={isSelected ? "bold" : "normal"}
        >
          {date}
        </Typography>
        <Checkbox
          checked={isSelected}
          onChange={onSelect}
          sx={{
            color: isSelected ? "white" : "primary.dark",
            padding: 0,
            "&.Mui-checked": {
              color: "white",
            },
          }}
        />
      </Box>
      <Box
        sx={{
          position: "relative",
          cursor: "pointer",
          flex: 1,
          "&:hover .overlay": {
            opacity: 1,
          },
        }}
      >
        <Box
          component="img"
          src={photo.url}
          alt={`Foto ${photo.type} - ${date}`}
          sx={{
            width: "100%",
            height: 240,
            objectFit: "cover",
          }}
          onClick={onClick}
        />
        <Box
          className="overlay"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0, 0, 0, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0,
            transition: "opacity 0.2s",
          }}
        >
          <Tooltip title="Ampliar imagem">
            <IconButton
              sx={{
                color: "white",
                bgcolor: alpha(theme.palette.primary.main, 0.7),
                "&:hover": {
                  bgcolor: theme.palette.primary.main,
                },
              }}
            >
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {measurementData && (
        <Box sx={{ p: 1, bgcolor: "#f5f5f5", borderTop: "1px solid #eee" }}>
          <Stack direction="row" spacing={1} justifyContent="center">
            {measurementData.weight && (
              <Chip
                size="small"
                label={`${measurementData.weight} kg`}
                color="primary"
                variant="outlined"
              />
            )}
            {measurementData.bodyFat && (
              <Chip
                size="small"
                label={`${measurementData.bodyFat}% G.C.`}
                color="secondary"
                variant="outlined"
              />
            )}
          </Stack>
        </Box>
      )}
    </Paper>
  );
};

// Componente Timeline para visualização cronológica
const PhotoTimeline: React.FC<PhotoTimelineProps> = ({
  photos,
  onPhotoClick,
}) => {
  return (
    <Box sx={{ position: "relative", my: 4, px: 2 }}>
      <Divider
        sx={{ position: "absolute", top: "50%", width: "100%", zIndex: 0 }}
      />

      <Stack
        direction="row"
        spacing={1}
        justifyContent="space-between"
        alignItems="center"
        sx={{ overflowX: "auto", pb: 2 }}
      >
        {photos.map((item) => (
          <Box
            key={item.photo.id}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              zIndex: 1,
              minWidth: 140,
            }}
          >
            <Box
              component="img"
              src={item.photo.url}
              alt={`Foto ${item.date}`}
              sx={{
                width: 100,
                height: 100,
                objectFit: "cover",
                borderRadius: "50%",
                border: "4px solid white",
                boxShadow: 2,
                mb: 1,
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  transform: "scale(1.1)",
                  boxShadow: 4,
                },
              }}
              onClick={() => onPhotoClick(item)}
            />
            <Typography
              variant="caption"
              fontWeight="bold"
              sx={{ bgcolor: "white", px: 1 }}
            >
              {formatDate(item.date)}
            </Typography>
            {item.measurementData && (
              <Typography variant="caption" sx={{ bgcolor: "white", px: 1 }}>
                {item.measurementData.weight} kg
              </Typography>
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

// Componente EmptyState mais amigável
const EmptyState = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      py: 8,
      px: 2,
      textAlign: "center",
    }}
  >
    <Box
      sx={{
        width: 120,
        height: 120,
        borderRadius: "50%",
        bgcolor: "primary.light",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mb: 3,
      }}
    >
      <ImageIcon sx={{ fontSize: 60, color: "primary.main" }} />
    </Box>
    <Typography variant="h6" gutterBottom>
      Nenhuma foto disponível
    </Typography>
    <Typography color="text.secondary" sx={{ maxWidth: 500, mb: 3 }}>
      Não encontramos fotos para o período e tipo selecionados. Tente ajustar o
      filtro de datas ou adicione novas fotos nas avaliações.
    </Typography>
    <Stack direction="row" spacing={2}>
      <Button variant="outlined" startIcon={<CalendarTodayIcon />}>
        Alterar período
      </Button>
    </Stack>
  </Box>
);

// Função auxiliar para formatar datas
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("pt-BR");
};

// Add this new component before the PhotoEvolutionSection component
const ImageComparison = ({ leftImage, rightImage, leftLabel, rightLabel }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    updateSliderPosition(e);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      updateSliderPosition(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updateSliderPosition = (e) => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;

    setSliderPosition(Math.min(Math.max(percentage, 0), 100));
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <Box
      ref={containerRef}
      sx={{
        height: 500,
        position: "relative",
        overflow: "hidden",
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Left Image */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <Box
          component="img"
          src={leftImage}
          alt="Before"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <Typography
          variant="caption"
          sx={{
            position: "absolute",
            bottom: 8,
            left: 8,
            bgcolor: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "4px 8px",
            borderRadius: 1,
          }}
        >
          {leftLabel}
        </Typography>
      </Box>

      {/* Right Image */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `${sliderPosition}%`,
          height: "100%",
          overflow: "hidden",
        }}
      >
        <Box
          component="img"
          src={rightImage}
          alt="After"
          sx={{
            width: `${(100 / sliderPosition) * 100}%`,
            height: "100%",
            objectFit: "cover",
          }}
        />
        <Typography
          variant="caption"
          sx={{
            position: "absolute",
            bottom: 8,
            right: 8,
            bgcolor: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "4px 8px",
            borderRadius: 1,
          }}
        >
          {rightLabel}
        </Typography>
      </Box>

      {/* Slider */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: `${sliderPosition}%`,
          width: 2,
          height: "100%",
          bgcolor: "white",
          cursor: "ew-resize",
          transform: "translateX(-50%)",
          "&::after": {
            content: '""',
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 40,
            height: 40,
            bgcolor: "white",
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            boxShadow: 2,
          },
        }}
      />
    </Box>
  );
};

// Componente principal com melhorias
export const PhotoEvolutionSection: React.FC<PhotoEvolutionSectionProps> = ({
  measurements,
  dateRange,
}) => {
  const theme = useTheme();
  const [selectedPhotoType, setSelectedPhotoType] =
    useState<PhotoType>("front");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhotos>({});
  const [selectedPhoto, setSelectedPhoto] = useState<{
    url: string;
    date: string;
    measurementData?: any;
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
      setSelectedPhotos({
        reference: {
          ...availablePhotos[0].photo,
          date: availablePhotos[0].date,
          measurementData: availablePhotos[0].measurementData,
        },
        compare: {
          ...availablePhotos[1].photo,
          date: availablePhotos[1].date,
          measurementData: availablePhotos[1].measurementData,
        },
      });
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
  }, [selectedPhotoType]);

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
      }, 500); // Simular carregamento
    }
  };

  // Handle view mode change
  const handleViewModeChange = (
    _: React.MouseEvent<HTMLElement>,
    newMode: ViewMode | null
  ) => {
    if (newMode) {
      setViewMode(newMode);
    }
  };

  // Handle photo selection
  const handlePhotoSelect = (
    photo: MeasurementPhoto,
    date: string,
    measurementData: any
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

    // If in compare mode and we now have two photos, auto-scroll to comparison
    if (
      viewMode === "compare" &&
      ((!selectedPhotos.reference && !selectedPhotos.compare) ||
        (selectedPhotos.reference && !selectedPhotos.compare))
    ) {
      setTimeout(() => {
        document
          .getElementById("comparison-section")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  };

  // Check if photo is selected
  const isPhotoSelected = (photoId: string) => {
    return (
      selectedPhotos.reference?.id === photoId ||
      selectedPhotos.compare?.id === photoId
    );
  };

  // Calculate differences between photos for display
  const calculateDifferences = () => {
    if (!selectedPhotos.reference || !selectedPhotos.compare) return null;

    const refData = selectedPhotos.reference.measurementData;
    const compData = selectedPhotos.compare.measurementData;

    if (!refData || !compData) return null;

    const weightDiff =
      refData.weight && compData.weight
        ? (refData.weight - compData.weight).toFixed(1)
        : null;

    const fatDiff =
      refData.bodyFat && compData.bodyFat
        ? (refData.bodyFat - compData.bodyFat).toFixed(1)
        : null;

    return {
      weightDiff,
      fatDiff,
      isPositive: {
        weight: weightDiff && parseFloat(weightDiff) < 0,
        fat: fatDiff && parseFloat(fatDiff) < 0,
      },
    };
  };

  const differences = calculateDifferences();

  // Verificar se há fotos disponíveis no período
  const hasPhotosInPeriod = useMemo(() => {
    return filteredMeasurements.some((measurement) =>
      measurement.photos?.some((photo: MeasurementPhoto) =>
        ["front", "back", "left", "right"].includes(photo.type)
      )
    );
  }, [filteredMeasurements]);

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
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
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

              {/* Improved styling for photo type selection */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {availablePhotoTypes.map((type) => (
                  <Button
                    key={type}
                    variant={
                      selectedPhotoType === type ? "contained" : "outlined"
                    }
                    color="primary"
                    size="small"
                    onClick={() => handlePhotoTypeChange({} as any, type)}
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

            {/* Improved styling for view mode selection with text and icons */}
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
                onClick={() => handleViewModeChange({} as any, "grid")}
                startIcon={<GridViewIcon />}
                sx={{ borderRadius: 2 }}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === "compare" ? "contained" : "outlined"}
                color="primary"
                size="small"
                onClick={() => handleViewModeChange({} as any, "compare")}
                startIcon={<CompareIcon />}
                sx={{ borderRadius: 2 }}
              >
                Comparar
              </Button>
              <Button
                variant={viewMode === "timeline" ? "contained" : "outlined"}
                color="primary"
                size="small"
                onClick={() => handleViewModeChange({} as any, "timeline")}
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
          <PhotoComparison
            selectedPhotos={selectedPhotos}
            onExport={() => {}}
            onShare={() => {}}
            onAddNote={() => {}}
            onFullscreen={() => {}}
          />
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
      </Paper>

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
