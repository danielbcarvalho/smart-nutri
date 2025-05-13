import React, { useState, useRef, useEffect } from "react";
import { Box, Typography, Paper, Chip, alpha, useTheme } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { MeasurementPhoto, MeasurementData } from "../types";

interface PhotoComparisonProps {
  selectedPhotos: {
    reference?: MeasurementPhoto & {
      date?: string;
      measurementData?: MeasurementData;
    };
    compare?: MeasurementPhoto & {
      date?: string;
      measurementData?: MeasurementData;
    };
  };
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("pt-BR");
};

interface ImageComparisonProps {
  leftImage: string;
  rightImage: string;
  leftLabel: string;
  rightLabel: string;
}

const ImageComparison: React.FC<ImageComparisonProps> = ({
  leftImage,
  rightImage,
  leftLabel,
  rightLabel,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const theme = useTheme();

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateSliderPosition(e);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      updateSliderPosition(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updateSliderPosition = (e: MouseEvent) => {
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
        borderRadius: 1,
        boxShadow: "none",
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
          alt="Imagem anterior"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            backgroundColor: "#f5f5f5",
          }}
        />
        <Typography
          variant="caption"
          sx={{
            position: "absolute",
            bottom: 8,
            left: 8,
            bgcolor: alpha(theme.palette.primary.main, 0.8),
            color: "white",
            padding: "4px 10px",
            borderRadius: 1,
            fontSize: "0.75rem",
            fontWeight: 500,
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
          alt="Imagem atual"
          sx={{
            width: `${(100 / sliderPosition) * 100}%`,
            height: "100%",
            objectFit: "contain",
            backgroundColor: "#f5f5f5",
          }}
        />
        <Typography
          variant="caption"
          sx={{
            position: "absolute",
            bottom: 8,
            right: 8,
            bgcolor: alpha(theme.palette.primary.main, 0.8),
            color: "white",
            padding: "4px 10px",
            borderRadius: 1,
            fontSize: "0.75rem",
            fontWeight: 500,
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
          zIndex: 10,
          "&::after": {
            content: '""',
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 32,
            height: 32,
            bgcolor: theme.palette.primary.main,
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            border: "3px solid white",
          },
        }}
      />
    </Box>
  );
};

export const PhotoComparison: React.FC<PhotoComparisonProps> = ({
  selectedPhotos,
}) => {
  const theme = useTheme();

  const calculateDifferences = () => {
    if (!selectedPhotos.reference || !selectedPhotos.compare) return null;

    // Obter as datas para garantir a ordem cronológica correta
    const refDate = new Date(selectedPhotos.reference.date || "");
    const compDate = new Date(selectedPhotos.compare.date || "");

    // Determinar qual é a foto mais antiga e qual é a mais recente
    const isRefOlder = refDate < compDate;

    // Decidir qual será a "antes" e qual será a "depois" com base nas datas
    const olderData = isRefOlder
      ? selectedPhotos.reference.measurementData
      : selectedPhotos.compare.measurementData;

    const newerData = isRefOlder
      ? selectedPhotos.compare.measurementData
      : selectedPhotos.reference.measurementData;

    if (!olderData || !newerData) return null;

    // Calcular as diferenças (sempre: valor mais recente - valor mais antigo)
    const weightDiff =
      olderData.weight && newerData.weight
        ? (newerData.weight - olderData.weight).toFixed(1)
        : null;

    const fatDiff =
      olderData.bodyFat && newerData.bodyFat
        ? (newerData.bodyFat - olderData.bodyFat).toFixed(1)
        : null;

    return {
      weightDiff,
      fatDiff,
      isReduction: {
        weight: weightDiff ? parseFloat(weightDiff) < 0 : false,
        fat: fatDiff ? parseFloat(fatDiff) < 0 : false,
      },
      // Retorna também a informação de qual é a mais antiga para uso na exibição
      olderPhotoIsReference: isRefOlder,
    };
  };

  const differences = calculateDifferences();

  // Determinar qual foto mostrar à esquerda (antes) e à direita (depois)
  const getOrderedPhotos = () => {
    if (!differences || !selectedPhotos.reference || !selectedPhotos.compare) {
      return {
        before: selectedPhotos.reference,
        after: selectedPhotos.compare,
      };
    }

    return {
      before: differences.olderPhotoIsReference
        ? selectedPhotos.reference
        : selectedPhotos.compare,
      after: differences.olderPhotoIsReference
        ? selectedPhotos.compare
        : selectedPhotos.reference,
    };
  };

  const orderedPhotos =
    selectedPhotos.reference && selectedPhotos.compare
      ? getOrderedPhotos()
      : { before: undefined, after: undefined };

  return (
    <Box id="comparison-section">
      <Paper
        elevation={2}
        sx={{
          mb: 4,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {/* Header apenas com a data centralizada */}
        <Box
          sx={{
            bgcolor: theme.palette.primary.main,
            color: "white",
            p: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {orderedPhotos.before && orderedPhotos.after && (
            <Typography
              component="span"
              variant="body2"
              sx={{
                color: "white",
                fontWeight: 500,
                textAlign: "center",
                width: "100%",
              }}
            >
              {formatDate(orderedPhotos.before.date || "")} →{" "}
              {formatDate(orderedPhotos.after.date || "")}
            </Typography>
          )}
        </Box>

        {/* Conteúdo do card */}
        <Box sx={{ p: 2 }}>
          {!selectedPhotos.reference && !selectedPhotos.compare ? (
            <Box sx={{ textAlign: "center", py: 5, px: 2 }}>
              <InfoOutlinedIcon
                sx={{ fontSize: 36, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                Selecione duas fotos do grid abaixo para comparar
              </Typography>
            </Box>
          ) : selectedPhotos.reference && selectedPhotos.compare ? (
            <>
              {differences && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mb: 2,
                    gap: 1.5,
                  }}
                >
                  {differences.weightDiff && (
                    <Chip
                      label={`${Math.abs(
                        parseFloat(differences.weightDiff)
                      )} kg ${
                        differences.isReduction.weight ? "redução" : "aumento"
                      }`}
                      color="default"
                      size="medium"
                      sx={{
                        fontWeight: 500,
                      }}
                    />
                  )}

                  {differences.fatDiff && (
                    <Chip
                      label={`${Math.abs(
                        parseFloat(differences.fatDiff)
                      )}% G.C. ${
                        differences.isReduction.fat ? "redução" : "aumento"
                      }`}
                      color="default"
                      size="medium"
                      sx={{
                        fontWeight: 500,
                      }}
                    />
                  )}
                </Box>
              )}

              <ImageComparison
                leftImage={orderedPhotos.before?.url || ""}
                rightImage={orderedPhotos.after?.url || ""}
                leftLabel={formatDate(orderedPhotos.before?.date || "")}
                rightLabel={formatDate(orderedPhotos.after?.date || "")}
              />
            </>
          ) : (
            <Box sx={{ textAlign: "center", py: 5, px: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Selecione mais uma foto para completar a comparação
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};
