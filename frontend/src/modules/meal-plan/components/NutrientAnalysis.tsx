import React from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  useTheme,
  Tooltip as MuiTooltip,
  Button,
  LinearProgress,
  Chip,
} from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { ChartsTooltip } from "@mui/x-charts";

import { alpha } from "@mui/material/styles";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
// Ícones para macros - use os que preferir ou tenha em seu projeto
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord"; // Para simular os pontos coloridos
import { useNavigate } from "react-router-dom";

interface MuiDonutChartProps {
  protein: number;
  fat: number;
  carbohydrates: number;
  calories: number;
  size?: number;
  showLabels?: boolean;
}

const SimpleDonutChart: React.FC<MuiDonutChartProps> = ({
  protein,
  fat,
  carbohydrates,
  calories,
  size = 200,
}) => {
  const theme = useTheme();

  // Caso não haja dados
  if (calories === 0 || (protein === 0 && fat === 0 && carbohydrates === 0)) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: "50%",
          border: `2px dashed ${theme.palette.divider}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Sem dados
        </Typography>
      </Box>
    );
  }

  // Calcula as calorias por macronutriente
  const proteinKcal = Math.max(0, protein) * 4; // 4 kcal por grama de proteína
  const fatKcal = Math.max(0, fat) * 9; // 9 kcal por grama de gordura
  const carbsKcal = Math.max(0, carbohydrates) * 4; // 4 kcal por grama de carboidrato

  // Calcula o total de calorias dos macronutrientes
  const totalMacroKcal = proteinKcal + fatKcal + carbsKcal;

  // Se não houver calorias dos macronutrientes, usa o valor de calories fornecido
  const effectiveCalories = totalMacroKcal > 0 ? totalMacroKcal : calories;

  // Calcula as porcentagens
  const proteinPercentage =
    totalMacroKcal > 0 ? (proteinKcal / totalMacroKcal) * 100 : 0;
  const fatPercentage =
    totalMacroKcal > 0 ? (fatKcal / totalMacroKcal) * 100 : 0;
  const carbsPercentage =
    totalMacroKcal > 0 ? (carbsKcal / totalMacroKcal) * 100 : 0;

  // Prepara os dados para o gráfico
  const data = [
    {
      id: 0,
      value: proteinKcal,
      label: "Proteína/kcal",
      grams: protein,
      percentage: proteinPercentage,
      color: COLORS.protein.main,
    },
    {
      id: 1,
      value: fatKcal,
      label: "Gordura/kcal",
      grams: fat,
      percentage: fatPercentage,
      color: COLORS.fat.main,
    },
    {
      id: 2,
      value: carbsKcal,
      label: "Carboidrato/kcal",
      grams: carbohydrates,
      percentage: carbsPercentage,
      color: COLORS.carbs.main,
    },
  ];

  // Configuração da série de dados
  const series = {
    data,
    innerRadius: size * 0.3,
    outerRadius: size * 0.45,
    paddingAngle: 2,
    cornerRadius: 4,
    startAngle: -90,
  };

  return (
    <Box sx={{ width: size, height: size, position: "relative" }}>
      <PieChart
        series={[series]}
        width={size}
        height={size}
        margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
        slotProps={{
          legend: { hidden: true },
        }}
      >
        <ChartsTooltip
          slotProps={{
            popper: {
              sx: {
                "& .MuiTooltip-tooltip": {
                  p: 1,
                  bgcolor: "background.paper",
                  color: "text.primary",
                  boxShadow: 1,
                  border: "1px solid",
                  borderColor: "divider",
                },
              },
            },
          }}
        />
      </PieChart>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          backgroundColor: theme.palette.background.paper,
          borderRadius: "50%",
          width: size * 0.6,
          height: size * 0.6,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="caption"
          component="div"
          color="text.secondary"
          sx={{ lineHeight: 1 }}
        >
          Total
        </Typography>
        <Typography
          variant="h6"
          component="div"
          sx={{ fontWeight: "bold", lineHeight: 1.2 }}
        >
          {formatNumber(effectiveCalories, 0)}
        </Typography>
        <Typography
          variant="caption"
          component="div"
          color="text.secondary"
          sx={{ lineHeight: 1 }}
        >
          kcal
        </Typography>
      </Box>
    </Box>
  );
};

interface NutrientAnalysisProps {
  protein: number; // gramas
  fat: number; // gramas
  carbohydrates: number; // gramas
  calories: number; // kcal
  totalWeight: number; // gramas
  targetCalories?: number;
  targetProtein?: number; // gramas
  targetFat?: number; // gramas
  targetCarbohydrates?: number; // gramas
  tmb?: number;
  // targetProteinPercentage, targetFatPercentage, targetCarbohydratesPercentage
  // são as metas de distribuição percentual do VET (ex: 30% Proteína do VET)
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
  success: { light: "#4CAF50", main: "#2E7D32", dark: "#1B5E20" },
  warning: { light: "#FFC107", main: "#FFA000", dark: "#FF6F00" },
  error: { light: "#F44336", main: "#D32F2F", dark: "#B71C1C" },
  protein: { light: "#FFCDD2", main: "#E53935", dark: "#C62828" },
  carbs: { light: "#FFF9C4", main: "#FFC107", dark: "#FFA000" },
  fat: { light: "#B2EBF2", main: "#00ACC1", dark: "#00838F" },
  info: { light: "#E8F5E9", main: "#4CAF50", dark: "#2E7D32" },
};

const formatNumber = (value: number | undefined, decimalPlaces: number = 1) => {
  if (value === undefined || Number.isNaN(value))
    return `0,${"0".repeat(decimalPlaces)}`;
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
};

const getAdherenceColor = (current: number, target: number | undefined) => {
  if (target === undefined || target === 0) {
    return current > 0 ? "warning" : "success"; // Se não há meta, ou meta é 0
  }
  const difference = current - target;
  const percentDiff = Math.abs((difference / target) * 100);

  if (difference > 0 && difference / target > 0.1) return "error"; // Mais de 10% acima
  if (difference < 0 && Math.abs(difference) / target > 0.1) return "error"; // Mais de 10% abaixo

  if (percentDiff <= 5) return "success"; // Até 5% de variação
  // if (percentDiff <= 10) return "warning"; // Entre 5% e 10% de variação (removido para simplificar para success/error baseado em +/- 10%)
  return "warning"; // Outros casos (entre 5% e 10%)
};

/**
 * Classifica a densidade calórica de uma dieta completa (valor médio de kcal/g ao longo do dia):
 *   < 0.6 kcal/g  → Muito Baixa Densidade   (dieta que tende a oferecer muita saciedade com poucas calorias,
 *                                             ex.: refeições ricas em vegetais, sopas e frutas, pouco concentradas em gorduras)
 * 0.6–1.5 kcal/g  → Baixa Densidade         (dieta balanceada com ênfase em alimentos ricos em água e fibras,
 *                                             como carnes magras, legumes cozidos, arroz integral e laticínios desnatados)
 * 1.5–4 kcal/g    → Moderada Densidade      (dieta que inclui porções moderadas de fontes calóricas energéticas,
 *                                             como queijos, pães integrais, grãos, pequenas frituras ou molhos leves)
 * ≥ 4 kcal/g      → Alta Densidade          (dieta muito calórica por grama, com itens concentrados em gorduras e açúcares,
 *                                             ex.: oleaginosas em grande quantidade, doces, molhos cremosos ou frituras pesadas)
 *
 * Estes valores se referem ao cálculo total do dia – não a um alimento isolado.
 */
function getCaloricDensityClass(density: number) {
  if (density < 0.6) {
    return {
      label: "Muito Baixa Densidade",
      color: COLORS.success.main,
      bgColor: COLORS.success.light,
      description:
        "A densidade calórica diária está muito baixa, indicando refeições volumosas e ricas em água/fibras, que promovem saciedade com poucas calorias totais no dia.",
    };
  }

  if (density < 1.5) {
    return {
      label: "Baixa Densidade",
      color: COLORS.info.main,
      bgColor: COLORS.info.light,
      description:
        "A densidade calórica diária está baixa, refletindo uma dieta equilibrada com ênfase em alimentos menos concentrados em calorias (carnes magras, legumes, grãos integrais).",
    };
  }

  if (density < 4) {
    return {
      label: "Moderada Densidade",
      color: COLORS.warning.main,
      bgColor: COLORS.warning.light,
      description:
        "A densidade calórica diária está moderada, indicando inclusão de alimentos energéticos (queijos, pães, grãos) sem excesso de gorduras ou açúcares.",
    };
  }

  return {
    label: "Alta Densidade",
    color: COLORS.error.main,
    bgColor: COLORS.error.light,
    description:
      "A densidade calórica diária está alta, sugerindo que as calorias estão muito concentradas (fritos, doces, molhos ricos), e pode dificultar controle de peso.",
  };
}

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
  onEnergyPlanChange,
  patientId,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  /**
   * Cálculo de densidade calórica: kcal por grama de alimento.
   * Fonte dos limites de densidade: Drewnowski A. & Bellisle F. (2007). "Energy density: definition and
   * recommendations for reducing energy intake." *Am J Clin Nutr*.
   */

  const density = totalWeight > 0 && calories > 0 ? calories / totalWeight : 0;
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
    targetCarbohydrates !== undefined;

  // Cálculos para Balanço Calórico
  const caloriesDifference = calories - (targetCalories || 0);
  const caloriesPercentageOfTarget =
    targetCalories && targetCalories > 0
      ? (calories / targetCalories) * 100
      : calories > 0
      ? 100
      : 0;
  const caloriesAdherenceColorKey = getAdherenceColor(calories, targetCalories);
  const caloriesAdherenceColor =
    COLORS[caloriesAdherenceColorKey]?.main || theme.palette.text.secondary;
  const isCaloriesDeficit = calories < (targetCalories || 0);

  // Cálculos para % de contribuição calórica dos macros NO PLANO ATUAL
  const currentProteinKcal = protein * 4;
  const currentFatKcal = fat * 9;
  const currentCarbsKcal = carbohydrates * 4;
  const totalActualMacroKcal =
    currentProteinKcal + currentFatKcal + currentCarbsKcal;

  const actualProteinCaloricPct =
    totalActualMacroKcal > 0
      ? (currentProteinKcal / totalActualMacroKcal) * 100
      : 0;
  const actualFatCaloricPct =
    totalActualMacroKcal > 0
      ? (currentFatKcal / totalActualMacroKcal) * 100
      : 0;
  const actualCarbsCaloricPct =
    totalActualMacroKcal > 0
      ? (currentCarbsKcal / totalActualMacroKcal) * 100
      : 0;

  const macroData = [
    {
      name: "Proteínas",
      color: COLORS.protein.main,
      lightColor: COLORS.protein.light,
      currentValue: protein,
      targetValue: targetProtein,
      kcalFactor: 4,
      currentCaloricPct: actualProteinCaloricPct,
      targetCaloricPct: targetProteinPercentage,
    },
    {
      name: "Lipídios",
      color: COLORS.fat.main,
      lightColor: COLORS.fat.light,
      currentValue: fat,
      targetValue: targetFat,
      kcalFactor: 9,
      currentCaloricPct: actualFatCaloricPct,
      targetCaloricPct: targetFatPercentage,
    },
    {
      name: "Carboidratos",
      color: COLORS.carbs.main,
      lightColor: COLORS.carbs.light,
      currentValue: carbohydrates,
      targetValue: targetCarbohydrates,
      kcalFactor: 4,
      currentCaloricPct: actualCarbsCaloricPct,
      targetCaloricPct: targetCarbohydratesPercentage,
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        backgroundColor: theme.palette.grey[50],
        mb: 3,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2.5,
          position: "relative",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: "600",
            color: theme.palette.primary.main,
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
        <MuiTooltip
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
        </MuiTooltip>
      </Box>

      {!hasTargetData && (
        <Box sx={{ textAlign: "center", mt: 3, mb: 2 }}>
          <Typography color="text.secondary" variant="body1" sx={{ mb: 2 }}>
            Para uma análise completa com comparação de metas, adicione um Plano
            Energético.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="medium"
            onClick={() => navigate(`/patient/${patientId}/energy-plans/new`)}
            sx={{
              mb: 3,
              px: 2.5,
              py: 1,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Adicionar Plano Energético
          </Button>
          {hasBasicData ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                mt: 2,
                p: 2,
                borderRadius: 2,
                background: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 500, color: theme.palette.text.primary }}
              >
                Distribuição Calórica (Plano Atual)
              </Typography>
              <SimpleDonutChart
                protein={protein}
                fat={fat}
                carbohydrates={carbohydrates}
                calories={calories}
                size={150}
              />
              <Stack direction="row" spacing={2} justifyContent="center" mt={1}>
                {macroData.map((m) => (
                  <Box
                    key={m.name}
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <FiberManualRecordIcon
                      sx={{ color: m.color, fontSize: 14, mr: 0.5 }}
                    />
                    <Typography variant="caption">
                      {m.name}: {formatNumber(m.currentCaloricPct, 0)}%
                    </Typography>
                  </Box>
                ))}
              </Stack>
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
        <Stack spacing={2.5} sx={{ mt: 2.5 }}>
          {/* BALANÇO CALÓRICO TOTAL */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                },
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Esse Plano
                </Typography>
                <Typography
                  variant="h4"
                  color="primary"
                  sx={{ fontWeight: "bold", lineHeight: 1.1 }}
                >
                  {formatNumber(calories, 1)}{" "}
                  <Typography component="span" variant="h6" color="primary">
                    kcal
                  </Typography>
                </Typography>
              </Box>
              <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Meta (GET)
                </Typography>
                <Typography
                  variant="h5"
                  color="text.primary"
                  sx={{ fontWeight: "bold", lineHeight: 1.1 }}
                >
                  {formatNumber(targetCalories, 1)}{" "}
                  <Typography
                    component="span"
                    variant="body1"
                    color="text.primary"
                  >
                    kcal
                  </Typography>
                </Typography>
              </Box>
            </Box>

            <Box mb={tmb && tmb > 0 ? 1.5 : 0}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: caloriesAdherenceColor, fontWeight: "medium" }}
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
                  {formatNumber(caloriesPercentageOfTarget, 0)}% da meta
                </Typography>
              </Box>
              <Box sx={{ position: "relative" }}>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(caloriesPercentageOfTarget, 120)}
                  color={"primary"}
                  sx={{
                    height: 8,
                    borderRadius: 5,
                    bgcolor: theme.palette.grey[200],
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    left: "100%",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 2,
                    height: 12,
                    bgcolor: alpha(theme.palette.common.black, 0.5),
                    borderRadius: 1,
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
                  bgcolor: alpha(theme.palette.grey[100], 0.5),
                  p: 1,
                  borderRadius: 1.5,
                  border: `1px solid ${theme.palette.grey[200]}`,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="caption" color="text.secondary">
                    Taxa Metabólica Basal (TMB)
                  </Typography>
                  <MuiTooltip
                    title="Energia mínima para funções vitais em repouso."
                    arrow
                  >
                    <InfoOutlinedIcon
                      sx={{
                        ml: 0.5,
                        color: theme.palette.text.secondary,
                        fontSize: 14,
                        cursor: "pointer",
                      }}
                    />
                  </MuiTooltip>
                </Box>
                <Typography
                  variant="subtitle1"
                  color="text.primary"
                  sx={{ fontWeight: "medium", lineHeight: 1.2 }}
                >
                  {formatNumber(tmb, 1)} kcal
                </Typography>
              </Box>
            )}
          </Box>

          {/* DISTRIBUIÇÃO DE MACRONUTRIENTES */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              width: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 1.5,
                width: "100%",
              }}
            >
              <LocalFireDepartmentIcon
                color="primary"
                sx={{ mr: 0.8, fontSize: 22 }}
              />
              <Typography variant="h6" color="primary" fontWeight="medium">
                Distribuição de Macronutrientes
              </Typography>
              <MuiTooltip
                title="Distribuição percentual de calorias e comparação em gramas com as metas."
                arrow
              >
                <InfoOutlinedIcon
                  sx={{
                    ml: 1,
                    color: theme.palette.text.secondary,
                    fontSize: 18,
                    cursor: "pointer",
                  }}
                />
              </MuiTooltip>
            </Box>
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: { xs: "1fr", md: "0.9fr 2fr" },
                alignItems: "center",
                width: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mb: { xs: 2, md: 0 },
                }}
              >
                <SimpleDonutChart
                  protein={protein}
                  fat={fat}
                  carbohydrates={carbohydrates}
                  calories={calories}
                  size={130}
                />
              </Box>
              <Box sx={{ width: "100%" }}>
                <Stack spacing={1.5}>
                  {macroData.map((macro) => {
                    const macroCurrentGrams = macro.currentValue;
                    const macroTargetGrams = macro.targetValue;
                    const percentageOfTargetGrams =
                      macroTargetGrams && macroTargetGrams > 0
                        ? (macroCurrentGrams / macroTargetGrams) * 100
                        : macroCurrentGrams > 0
                        ? 100
                        : 0;

                    const currentMacroKcal =
                      macroCurrentGrams * macro.kcalFactor;
                    const targetMacroKcal =
                      targetCalories && macro.targetCaloricPct
                        ? (targetCalories * macro.targetCaloricPct) / 100
                        : macroTargetGrams
                        ? macroTargetGrams * macro.kcalFactor
                        : undefined;
                    const kcalDifference =
                      targetMacroKcal !== undefined
                        ? currentMacroKcal - targetMacroKcal
                        : undefined;

                    return (
                      <Box key={macro.name}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            mb: 0.25,
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <FiberManualRecordIcon
                              sx={{
                                color: macro.color,
                                fontSize: 16,
                                mr: 0.75,
                              }}
                            />
                            <Typography
                              variant="subtitle1"
                              fontWeight="medium"
                              sx={{ color: macro.color }}
                            >
                              {macro.name}:{" "}
                              <Typography component="span" fontWeight="bold">
                                {formatNumber(macro.currentCaloricPct, 0)}%
                              </Typography>
                            </Typography>
                            {macro.targetCaloricPct !== undefined && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ ml: 0.5 }}
                              >
                                (Meta: {formatNumber(macro.targetCaloricPct, 0)}
                                %)
                              </Typography>
                            )}
                          </Box>
                          {kcalDifference !== undefined && (
                            <Typography
                              variant="caption"
                              sx={{
                                color:
                                  kcalDifference === 0
                                    ? "text.secondary"
                                    : kcalDifference > 0
                                    ? COLORS.error.main
                                    : COLORS.success.main,
                                fontWeight: 500,
                              }}
                            >
                              {kcalDifference === 0
                                ? "Meta kcal atingida"
                                : `${
                                    kcalDifference > 0 ? "+" : ""
                                  }${formatNumber(kcalDifference, 0)} kcal`}
                            </Typography>
                          )}
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            mb: 0.25,
                            pl: "22px",
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Esse Plano:{" "}
                            <Typography component="span" fontWeight="bold">
                              {formatNumber(macroCurrentGrams, 1)}g
                            </Typography>
                            {macroTargetGrams !== undefined && (
                              <Typography component="span">
                                {" "}
                                / Meta: {formatNumber(macroTargetGrams, 1)}g
                              </Typography>
                            )}
                          </Typography>
                          {macroTargetGrams !== undefined && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatNumber(percentageOfTargetGrams, 0)}%
                            </Typography>
                          )}
                        </Box>
                        {macroTargetGrams !== undefined &&
                          macroTargetGrams > 0 && (
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(percentageOfTargetGrams, 120)}
                              sx={{
                                height: 5,
                                borderRadius: 2.5,
                                bgcolor: alpha(macro.lightColor, 0.5),
                                ml: "22px",
                                "& .MuiLinearProgress-bar": {
                                  backgroundColor: macro.color,
                                },
                              }}
                            />
                          )}
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            </Box>
          </Box>

          {/* DENSIDADE CALÓRICA */}
          {totalWeight > 0 && calories > 0 && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    display: { xs: "none", sm: "flex" },
                    alignItems: "center",
                    justifyContent: "center",
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    bgcolor: alpha(densityClass.bgColor, 0.3),
                    color: densityClass.color,
                  }}
                >
                  <LocalFireDepartmentIcon sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography
                      variant="subtitle1"
                      color="text.primary"
                      fontWeight="medium"
                    >
                      Densidade Calórica
                    </Typography>
                    <MuiTooltip title={densityClass.description} arrow>
                      <InfoOutlinedIcon
                        sx={{
                          ml: 0.5,
                          color: theme.palette.text.secondary,
                          fontSize: 16,
                          cursor: "pointer",
                        }}
                      />
                    </MuiTooltip>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Relação Kcal/g da dieta.
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
                <Typography
                  variant="h5"
                  sx={{ color: densityClass.color, fontWeight: "bold" }}
                >
                  {formatNumber(density)}{" "}
                  <Typography component="span" variant="body1">
                    kcal/g
                  </Typography>
                </Typography>
                <Chip
                  label={densityClass.label}
                  size="small"
                  sx={{
                    backgroundColor: alpha(densityClass.color, 0.15),
                    color: densityClass.color,
                    fontWeight: 500,
                    height: "auto",
                    "& .MuiChip-label": { py: "2px", px: "6px" },
                  }}
                />
              </Box>
            </Box>
          )}
        </Stack>
      )}

      {selectedEnergyPlan && (
        <Box
          sx={{
            mt: 2.5,
            pt: 1.5,
            borderTop: `1px solid ${theme.palette.divider}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Plano Energético de Referência: {selectedEnergyPlan.name}
            {selectedEnergyPlan.createdAt && (
              <Typography
                component="span"
                variant="caption"
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
                fontSize: "0.75rem",
                py: 0,
                px: 0.5,
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
