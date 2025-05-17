import React from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  useTheme,
  Tooltip,
  Button,
  LinearProgress,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import MacronutrientDistribution from "./MacronutrientDistribution";
import { useNavigate } from "react-router-dom";

interface NutrientAnalysisProps {
  protein: number;
  fat: number;
  carbohydrates: number;
  calories: number;
  totalWeight: number;
  targetCalories?: number;
  targetProtein?: number;
  targetFat?: number;
  targetCarbohydrates?: number;
  tmb?: number;
  targetProteinPercentage?: number;
  targetFatPercentage?: number;
  targetCarbohydratesPercentage?: number;
  selectedEnergyPlan?: {
    id: string;
    name: string;
    createdAt: string;
  };
  energyPlans?: Array<{
    id: string;
    name: string;
    createdAt: string;
  }>;
  onEnergyPlanChange?: () => void;
  patientId: string;
}

const COLORS = {
  success: {
    light: "#4CAF50", // Usado por getAdherenceColor
    main: "#2E7D32",
    dark: "#1B5E20",
  },
  warning: {
    light: "#FFC107", // Usado por getAdherenceColor
    main: "#FFA000",
    dark: "#FF6F00",
  },
  error: {
    light: "#F44336", // Usado por getAdherenceColor
    main: "#D32F2F",
    dark: "#B71C1C",
  },
  protein: {
    light: "#FFCDD2", // Lighter shade for background from image
    main: "#E53935", // Vermelho para proteínas (from image: #F44336)
    dark: "#C62828",
  },
  carbs: {
    light: "#FFF9C4", // Lighter shade for background from image
    main: "#FFC107", // Amarelo para carboidratos (from image: #FFEB3B)
    dark: "#FFA000",
  },
  fat: {
    light: "#B2EBF2", // Lighter shade for background from image
    main: "#00ACC1", // Azul/Ciano para lipídios (from image: #00BCD4)
    dark: "#00838F",
  },
};

const formatNumber = (value: number | undefined, decimalPlaces: number = 1) => {
  if (value === undefined || Number.isNaN(value))
    return `0,${"0".repeat(decimalPlaces)}`;
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
};

const getAdherenceColor = (difference: number, target: number) => {
  if (target === 0 && difference === 0) return "success"; // Se meta é 0 e atingiu 0, está ok
  if (target === 0 && difference !== 0) return "error"; // Se meta é 0 e tem valor, está fora

  const percentDiff = Math.abs((difference / target) * 100);
  if (percentDiff <= 5) return "success";
  if (percentDiff <= 10) return "warning";
  return "error";
};

const getCaloricDensityClass = (density: number) => {
  if (density < 1) {
    return {
      label: "Baixa Densidade",
      color: COLORS.success.main,
      bgColor: COLORS.success.light,
      description:
        "Alimentos com baixa densidade calórica ajudam na saciedade com menos calorias.",
    };
  } else if (density < 2) {
    return {
      label: "Média Densidade",
      color: COLORS.warning.main,
      bgColor: COLORS.warning.light,
      description:
        "Densidade calórica moderada, equilibra nutrientes e saciedade.",
    };
  } else {
    return {
      label: "Alta Densidade",
      color: COLORS.error.main,
      bgColor: COLORS.error.light,
      description:
        "Alimentos calóricos concentrados. Use com moderação no plano alimentar.",
    };
  }
};

export const NutrientAnalysis: React.FC<NutrientAnalysisProps> = ({
  protein,
  fat,
  carbohydrates,
  calories,
  totalWeight,
  targetCalories,
  targetProtein,
  targetFat,
  targetCarbohydrates,
  tmb,
  targetProteinPercentage,
  targetFatPercentage,
  targetCarbohydratesPercentage,
  selectedEnergyPlan,
  energyPlans,
  onEnergyPlanChange,
  patientId,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const density = totalWeight && calories ? calories / totalWeight : 0;
  const densityClass = getCaloricDensityClass(density);

  const hasBasicData =
    protein > 0 ||
    fat > 0 ||
    carbohydrates > 0 ||
    calories > 0 ||
    totalWeight > 0;

  const hasTargetData =
    targetCalories !== undefined &&
    targetProtein !== undefined &&
    targetFat !== undefined &&
    targetCarbohydrates !== undefined &&
    targetProteinPercentage !== undefined &&
    targetFatPercentage !== undefined &&
    targetCarbohydratesPercentage !== undefined;

  const caloriesDifference = calories - (targetCalories || 0);
  const caloriesPercentage =
    targetCalories && targetCalories > 0
      ? (calories / targetCalories) * 100
      : calories > 0
      ? 100
      : 0;
  const caloriesAdherenceColor = getAdherenceColor(
    caloriesDifference,
    targetCalories || 0
  );
  const isCaloriesDeficit = calories < (targetCalories || 0);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        backgroundColor: theme.palette.grey[50],
        mb: 3,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: "600",
            color: theme.palette.primary.main,
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: -8,
              left: "50%",
              transform: "translateX(-50%)",
              width: 60,
              height: 3,
              borderRadius: 1.5,
              backgroundColor: theme.palette.primary.main,
            },
          }}
        >
          Análise de Nutrientes
        </Typography>
        <Tooltip
          title="O Plano Atual se refere aos valores do planejamento alimentar atual, enquanto a Meta foi definida através do planejamento energético."
          arrow
          placement="top"
        >
          <InfoOutlinedIcon
            sx={{
              ml: 1,
              color: theme.palette.text.secondary,
              fontSize: 20,
              cursor: "pointer",
            }}
          />
        </Tooltip>
      </Box>

      {!hasTargetData && (
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography color="text.secondary" variant="body1" sx={{ mb: 2 }}>
            Para uma análise completa com comparação de metas, adicione um Plano
            Energético.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate(`/patient/${patientId}/energy-plans/new`)}
            sx={{
              mb: 4,
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 500,
              boxShadow: theme.shadows[2],
              "&:hover": {
                boxShadow: theme.shadows[4],
              },
            }}
          >
            Adicionar Plano Energético
          </Button>

          {hasBasicData ? (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Box
                sx={{
                  width: "100%",
                  maxWidth: { md: "66.666667%", lg: "50%" },
                }}
              >
                <Box
                  sx={{
                    bgcolor: theme.palette.background.paper,
                    p: 3,
                    borderRadius: 3,
                    boxShadow: theme.shadows[1],
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      fontWeight: 500,
                      textAlign: "center",
                      color: theme.palette.text.primary,
                    }}
                  >
                    Distribuição Calórica (Plano Atual)
                  </Typography>

                  <MacronutrientDistribution
                    protein={protein}
                    fat={fat}
                    carbohydrates={carbohydrates}
                    calories={calories}
                  />
                </Box>
              </Box>
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              Adicione alimentos ao plano para visualizar a análise de
              nutrientes.
            </Typography>
          )}
        </Box>
      )}

      {hasTargetData && (
        <Stack spacing={3}>
          {/* 1. CARD DE BALANÇO CALÓRICO */}
          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              boxShadow: theme.shadows[1],
              border: `1px solid ${theme.palette.divider}`,
              transition: "box-shadow 0.3s ease",
              "&:hover": { boxShadow: theme.shadows[3] },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <LocalFireDepartmentIcon
                color="primary"
                sx={{ mr: 1, fontSize: 28 }}
              />
              <Typography variant="h6" color="primary" fontWeight="medium">
                Balanço Calórico Total
              </Typography>
              <Tooltip
                title="Comparação entre as calorias do plano alimentar e a meta calórica (GET)."
                arrow
              >
                <InfoOutlinedIcon
                  sx={{
                    ml: 1,
                    color: theme.palette.text.secondary,
                    fontSize: 20,
                    cursor: "pointer",
                  }}
                />
              </Tooltip>
            </Box>
            <Stack spacing={3}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Plano Atual
                  </Typography>
                  <Typography
                    variant="h4"
                    color="primary"
                    sx={{ fontWeight: "bold", lineHeight: 1.1 }}
                  >
                    {formatNumber(calories, 0)} kcal
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Meta (GET)
                  </Typography>
                  <Typography
                    variant="h5"
                    color="text.primary"
                    sx={{ fontWeight: "bold", lineHeight: 1.1 }}
                  >
                    {formatNumber(targetCalories, 0)} kcal
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography
                    variant="body2"
                    color={
                      theme.palette[caloriesAdherenceColor]?.main ||
                      theme.palette.text.secondary
                    }
                    fontWeight="medium"
                  >
                    {Math.abs(caloriesDifference) < 0.01
                      ? "Meta atingida"
                      : isCaloriesDeficit
                      ? "Déficit"
                      : "Superávit"}
                    :{" "}
                    {caloriesDifference !== 0
                      ? isCaloriesDeficit
                        ? ""
                        : "+"
                      : ""}
                    {formatNumber(Math.abs(caloriesDifference), 0)} kcal
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatNumber(caloriesPercentage, 0)}% da meta
                  </Typography>
                </Box>
                <Box sx={{ position: "relative" }}>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(caloriesPercentage, 120)}
                    color={caloriesAdherenceColor}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      bgcolor: theme.palette.grey[200],
                      "& .MuiLinearProgress-bar": {
                        transition: "transform 1s ease-out",
                        borderRadius: 5,
                      },
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      left: "100%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      width: 3,
                      height: 14,
                      bgcolor: alpha(theme.palette.common.black, 0.7),
                      borderRadius: 1.5,
                      zIndex: 1,
                      display:
                        targetCalories && targetCalories > 0 ? "block" : "none",
                    }}
                  />
                </Box>
              </Box>
              {tmb && tmb > 0 && (
                <Box
                  sx={{
                    bgcolor: theme.palette.grey[50],
                    p: 1.5,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.grey[200]}`,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Taxa Metabólica Basal (TMB)
                    </Typography>
                    <Tooltip
                      title="Energia mínima para funções vitais em repouso."
                      arrow
                    >
                      <InfoOutlinedIcon
                        sx={{
                          ml: 1,
                          color: theme.palette.text.secondary,
                          fontSize: 16,
                          cursor: "pointer",
                        }}
                      />
                    </Tooltip>
                  </Box>
                  <Typography
                    variant="h6"
                    color="text.primary"
                    sx={{ fontWeight: "medium" }}
                  >
                    {formatNumber(tmb, 0)} kcal
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>

          {/* 2. CARD DE DISTRIBUIÇÃO DE MACRONUTRIENTES */}
          <MacronutrientDistribution
            protein={protein}
            fat={fat}
            carbohydrates={carbohydrates}
            calories={calories}
            targetProtein={targetProtein}
            targetFat={targetFat}
            targetCarbohydrates={targetCarbohydrates}
            targetProteinPercentage={targetProteinPercentage}
            targetFatPercentage={targetFatPercentage}
            targetCarbohydratesPercentage={targetCarbohydratesPercentage}
          />

          {/* 3. CARD DE DENSIDADE CALÓRICA */}
          {totalWeight > 0 && calories > 0 && (
            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.shadows[1],
                border: `1px solid ${theme.palette.divider}`,
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: "center",
                justifyContent: "space-between",
                gap: 3,
                transition: "box-shadow 0.3s ease",
                "&:hover": { boxShadow: theme.shadows[3] },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    display: { xs: "none", sm: "flex" },
                    alignItems: "center",
                    justifyContent: "center",
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    bgcolor: alpha(densityClass.bgColor, 0.3),
                    color: densityClass.color,
                  }}
                >
                  <LocalFireDepartmentIcon sx={{ fontSize: 32 }} />
                </Box>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      variant="h6"
                      color="text.primary"
                      fontWeight="medium"
                    >
                      Densidade Calórica
                    </Typography>
                    <Tooltip
                      title="Relação Kcal/g. Indica quão calórica é a refeição por peso."
                      arrow
                    >
                      <InfoOutlinedIcon
                        sx={{
                          ml: 0.5,
                          color: theme.palette.text.secondary,
                          fontSize: 18,
                          cursor: "pointer",
                        }}
                      />
                    </Tooltip>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {densityClass.description}
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: { xs: "center", md: "flex-end" },
                }}
              >
                <Typography
                  variant="h4"
                  sx={{ color: densityClass.color, fontWeight: "bold" }}
                >
                  {formatNumber(density)} kcal/g
                </Typography>
                <Box
                  sx={{
                    bgcolor: alpha(densityClass.color, 0.2),
                    color: densityClass.color,
                    py: 0.5,
                    px: 2,
                    borderRadius: 10,
                  }}
                >
                  <Typography variant="body2" fontWeight="medium">
                    {densityClass.label}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Stack>
      )}

      {/* Plano Energético de Referência */}
      {selectedEnergyPlan && (
        <Box
          sx={{
            mt: 3,
            pt: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Plano Energético de Referência: {selectedEnergyPlan.name}
            {selectedEnergyPlan.createdAt && (
              <Typography
                component="span"
                variant="body2"
                color="text.secondary"
                sx={{ ml: 0.5 }}
              >
                ({new Date(selectedEnergyPlan.createdAt).toLocaleDateString()})
              </Typography>
            )}
          </Typography>
          {onEnergyPlanChange && (
            <Button
              size="small"
              onClick={onEnergyPlanChange}
              sx={{
                textTransform: "none",
                color: theme.palette.primary.main,
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                },
              }}
            >
              Alterar
            </Button>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default NutrientAnalysis;

// Dummy calculateMacronutrientPercentages - Certifique-se de que o seu real está importado corretamente.
// const calculateMacronutrientPercentages = (protein: number, fat: number, carbohydrates: number, calories: number) => {
//   if (calories === 0) {
//     return { proteinPercentage: 0, fatPercentage: 0, carbohydratesPercentage: 0 };
//   }
//   const proteinKcal = protein * 4;
//   const fatKcal = fat * 9;
//   const carbsKcal = carbohydrates * 4;
//   const totalMacroKcal = proteinKcal + fatKcal + carbsKcal; // Use this for percentages if it's more accurate than total plan calories for VET
//   if (totalMacroKcal === 0) {
//      return { proteinPercentage: 0, fatPercentage: 0, carbohydratesPercentage: 0 };
//   }
//   return {
//     proteinPercentage: (proteinKcal / totalMacroKcal) * 100,
//     fatPercentage: (fatKcal / totalMacroKcal) * 100,
//     carbohydratesPercentage: (carbsKcal / totalMacroKcal) * 100,
//   };
// };
