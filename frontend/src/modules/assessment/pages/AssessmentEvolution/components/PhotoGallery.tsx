import React, { useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Slide,
  CircularProgress,
  useTheme,
  alpha,
} from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ImageIcon from "@mui/icons-material/Image";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  MeasurementPhoto,
  MeasurementData,
  PhotoWithData,
  SelectedPhotos,
} from "../types";

interface PhotoGalleryProps {
  photos: PhotoWithData[];
  selectedPhotos: SelectedPhotos;
  viewMode: "grid" | "timeline";
  isLoading: boolean;
  onPhotoSelect: (
    photo: MeasurementPhoto,
    date: string,
    measurementData: MeasurementData
  ) => void;
  onPhotoClick: (
    photo: MeasurementPhoto,
    date: string,
    measurementData: MeasurementData
  ) => void;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("pt-BR");
};

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
  measurementData?: MeasurementData;
  isSelected: boolean;
  onSelect: () => void;
  onClick: () => void;
}) => {
  const theme = useTheme();

  const handleZoomClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <Paper
      elevation={2}
      sx={{
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderRadius: 2,
        position: "relative",
        transition: "transform 0.2s, box-shadow 0.2s",
        transform: isSelected ? "translateY(-4px)" : "none",
        boxShadow: isSelected
          ? `0 6px 20px -5px ${alpha(theme.palette.primary.main, 0.4)}`
          : "0 2px 8px rgba(0,0,0,0.05)",
        border: isSelected ? `2px solid ${theme.palette.primary.main}` : "none",
        "&:hover": {
          boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
          transform: "translateY(-4px)",
        },
        cursor: "pointer",
      }}
      onClick={onSelect}
    >
      {/* Date header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Typography variant="h6" fontWeight={500}>
          {date}
        </Typography>

        {isSelected && (
          <CheckCircleIcon color="primary" sx={{ fontSize: 28 }} />
        )}
      </Box>

      {/* Image container */}
      <Box
        sx={{
          position: "relative",
          width: 220,
          height: 260,
          backgroundColor: "#f8f9fa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto",
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
            width: 220,
            height: 260,
            objectFit: "contain",
            display: "block",
          }}
        />
        <Box
          className="overlay"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0,
            transition: "opacity 0.3s ease",
          }}
        >
          <Tooltip title="Ampliar imagem">
            <IconButton
              onClick={handleZoomClick}
              sx={{
                color: "white",
                bgcolor: alpha(theme.palette.primary.main, 0.9),
                "&:hover": {
                  bgcolor: theme.palette.primary.main,
                },
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
              }}
            >
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Measurements */}
      {measurementData && (
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid rgba(0,0,0,0.06)",
            backgroundColor: alpha(theme.palette.background.default, 0.5),
          }}
        >
          <Stack direction="row" spacing={1} justifyContent="center">
            {measurementData.weight && (
              <Chip
                label={`${measurementData.weight} kg`}
                color="primary"
                sx={{
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  height: 32,
                  px: 1,
                }}
              />
            )}
          </Stack>
        </Box>
      )}
    </Paper>
  );
};

// Timeline component (simplificado e melhorado)
const PhotoTimeline = ({
  photos,
  onPhotoClick,
  selectedPhotos,
}: {
  photos: PhotoWithData[];
  onPhotoClick: (item: PhotoWithData) => void;
  selectedPhotos: SelectedPhotos;
}) => {
  const theme = useTheme();

  const isSelected = (photoId: string) => {
    return (
      selectedPhotos.reference?.id === photoId ||
      selectedPhotos.compare?.id === photoId
    );
  };

  return (
    <Box sx={{ position: "relative", my: 3, px: 2 }}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          width: "100%",
          height: 2,
          bgcolor: "divider",
          zIndex: 0,
        }}
      />

      <Stack
        direction="row"
        spacing={3}
        justifyContent="space-between"
        alignItems="center"
        sx={{ overflowX: "auto", py: 3 }}
      >
        {photos.map((item) => (
          <Box
            key={item.photo.id}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              zIndex: 1,
              minWidth: 120,
            }}
          >
            <Box
              sx={{
                position: "relative",
                mb: 2,
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
                  border: isSelected(item.photo.id)
                    ? `3px solid ${theme.palette.primary.main}`
                    : "3px solid white",
                  boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
                  transition: "all 0.2s",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 5px 15px rgba(0,0,0,0.15)",
                  },
                }}
                onClick={() => onPhotoClick(item)}
              />
              {isSelected(item.photo.id) && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: -5,
                    bgcolor: theme.palette.primary.main,
                    borderRadius: "50%",
                    width: 24,
                    height: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid white",
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 20, color: "white" }} />
                </Box>
              )}
            </Box>

            <Box
              sx={{
                bgcolor: "background.paper",
                px: 2,
                py: 1,
                borderRadius: 1,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                textAlign="center"
              >
                {formatDate(item.date)}
              </Typography>
              {item.measurementData && item.measurementData.weight && (
                <Typography
                  variant="caption"
                  textAlign="center"
                  display="block"
                >
                  {item.measurementData.weight} kg
                </Typography>
              )}
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

// Estado vazio melhorado
const EmptyState = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      py: 6,
      px: 2,
      textAlign: "center",
    }}
  >
    <Box
      sx={{
        width: 100,
        height: 100,
        borderRadius: "50%",
        bgcolor: "primary.lighter",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mb: 3,
      }}
    >
      <ImageIcon sx={{ fontSize: 48, color: "primary.main" }} />
    </Box>
    <Typography variant="h6" gutterBottom>
      Nenhuma foto disponível
    </Typography>
    <Typography color="text.secondary" sx={{ maxWidth: 450, mb: 3 }}>
      Não encontramos fotos para o período e tipo selecionados. Tente ajustar o
      filtro de datas ou adicione novas fotos nas avaliações.
    </Typography>
  </Box>
);

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  selectedPhotos,
  viewMode,
  isLoading,
  onPhotoSelect,
  onPhotoClick,
}) => {
  const isPhotoSelected = (photoId: string) => {
    return (
      selectedPhotos.reference?.id === photoId ||
      selectedPhotos.compare?.id === photoId
    );
  };

  // Group photos by type when in "all" mode
  const groupedPhotos = useMemo(() => {
    if (viewMode === "timeline") return photos;

    const groups: { [key: string]: PhotoWithData[] } = {};
    photos.forEach((photo) => {
      const type = photo.photo.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(photo);
    });
    return groups;
  }, [photos, viewMode]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (photos.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          border: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <EmptyState />
      </Paper>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {viewMode === "grid" ? "Galeria de Fotos" : "Linha do Tempo"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {selectedPhotos.reference && !selectedPhotos.compare
            ? "Selecione mais uma foto para comparação"
            : "Selecione até duas fotos para comparar resultados"}
        </Typography>
      </Box>

      {viewMode === "timeline" ? (
        <PhotoTimeline
          photos={photos}
          selectedPhotos={selectedPhotos}
          onPhotoClick={(item) =>
            onPhotoClick(item.photo, item.date, item.measurementData)
          }
        />
      ) : (
        <Box>
          {Object.entries(groupedPhotos).map(([type, typePhotos]) => (
            <Box key={type} sx={{ mb: 4 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  mb: 2,
                  px: 2,
                  py: 1,
                  bgcolor: "primary.lighter",
                  borderRadius: 1,
                  color: "primary.dark",
                }}
              >
                {type === "front"
                  ? "Frente"
                  : type === "back"
                  ? "Costas"
                  : type === "left"
                  ? "Lateral Esquerda"
                  : "Lateral Direita"}
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gap: 3,
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                  },
                }}
              >
                {typePhotos.map(
                  ({ photo, date, measurementData }, index: number) => (
                    <Box key={photo.id}>
                      <Slide
                        direction="up"
                        in={true}
                        timeout={300}
                        style={{ transitionDelay: `${index * 50}ms` }}
                      >
                        <Box>
                          <PhotoThumbnail
                            photo={photo}
                            date={formatDate(date)}
                            measurementData={measurementData}
                            isSelected={isPhotoSelected(photo.id)}
                            onSelect={() =>
                              onPhotoSelect(photo, date, measurementData)
                            }
                            onClick={() =>
                              onPhotoClick(photo, date, measurementData)
                            }
                          />
                        </Box>
                      </Slide>
                    </Box>
                  )
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};
