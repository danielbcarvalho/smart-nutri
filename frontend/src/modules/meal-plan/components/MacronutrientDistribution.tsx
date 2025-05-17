import React from "react";
import { Box, Typography, Stack, useTheme, Tooltip } from "@mui/material";
import { alpha } from "@mui/material/styles";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import GrainIcon from "@mui/icons-material/Grain";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";

interface MacronutrientDistributionProps {
  protein: number;
  fat: number;
  carbohydrates: number;
  calories: number;
  targetProtein?: number;
  targetFat?: number;
  targetCarbohydrates?: number;
  targetProteinPercentage?: number;
  targetFatPercentage?: number;
  targetCarbohydratesPercentage?: number;
}

const COLORS = {
  protein: {
    light: "#FFCDD2",
    main: "#E53935",
    dark: "#C62828",
  },
  carbs: {
    light: "#FFF9C4",
    main: "#FFC107",
    dark: "#FFA000",
  },
  fat: {
    light: "#B2EBF2",
    main: "#00ACC1",
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

export const MacronutrientDistribution: React.FC<
  MacronutrientDistributionProps
> = ({
  protein,
  fat,
  carbohydrates,
  calories,
  targetProtein,
  targetFat,
  targetCarbohydrates,
  targetProteinPercentage,
  targetFatPercentage,
  targetCarbohydratesPercentage,
}) => {
  const theme = useTheme();

  const percentages = {
    proteinPercentage: ((protein * 4) / calories) * 100,
    fatPercentage: ((fat * 9) / calories) * 100,
    carbohydratesPercentage: ((carbohydrates * 4) / calories) * 100,
  };

  const pieData = [
    {
      name: "Proteínas",
      value: protein * 4,
      actualGrams: protein,
      color: COLORS.protein.main,
      lightColor: COLORS.protein.light,
      percentage: percentages.proteinPercentage,
      icon: <FitnessCenterIcon />,
      targetValue: (targetProtein || 0) * 4,
      targetGrams: targetProtein || 0,
      targetPercentage: targetProteinPercentage || 0,
    },
    {
      name: "Lipídios",
      value: fat * 9,
      actualGrams: fat,
      color: COLORS.fat.main,
      lightColor: COLORS.fat.light,
      percentage: percentages.fatPercentage,
      icon: <LocalFireDepartmentIcon />,
      targetValue: (targetFat || 0) * 9,
      targetGrams: targetFat || 0,
      targetPercentage: targetFatPercentage || 0,
    },
    {
      name: "Carboidratos",
      value: carbohydrates * 4,
      actualGrams: carbohydrates,
      color: COLORS.carbs.main,
      lightColor: COLORS.carbs.light,
      percentage: percentages.carbohydratesPercentage,
      icon: <GrainIcon />,
      targetValue: (targetCarbohydrates || 0) * 4,
      targetGrams: targetCarbohydrates || 0,
      targetPercentage: targetCarbohydratesPercentage || 0,
    },
  ];

  const pieDataFiltered = pieData.filter((p) => p.value > 0);
  const hasPieData = pieDataFiltered.length > 0;

  return (
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
      <Box sx={{ display: "flex", alignItems: "center", mb: 2.5 }}>
        <Typography variant="h5" fontWeight="600">
          Distribuição de Macronutrientes
        </Typography>
        <Tooltip
          title="Distribuição dos macronutrientes (g e %VET) comparados às metas."
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

      {/* Pie Chart and Custom Legend Row */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 3,
          mb: 3,
        }}
      >
        <Box sx={{ flex: { sm: "0 0 41.666667%" } }}>
          {hasPieData ? (
            <Box sx={{ height: { xs: 200, sm: 220 }, width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieDataFiltered}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="85%"
                    paddingAngle={pieDataFiltered.length > 1 ? 5 : 0}
                    stroke={theme.palette.background.paper}
                    strokeWidth={2}
                  >
                    {pieDataFiltered.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        opacity={0.95}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value: number, name: string, props) => [
                      `${formatNumber(value, 0)} kcal (${formatNumber(
                        props.payload.percentage
                      )}%)`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          ) : null}
        </Box>
        <Box sx={{ flex: { sm: "0 0 58.333333%" } }}>
          <Stack
            spacing={1.5}
            justifyContent="center"
            sx={{ height: "100%", pl: { sm: 2 } }}
          >
            {pieDataFiltered.map((entry) => (
              <Box
                key={entry.name}
                sx={{ display: "flex", alignItems: "center" }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    bgcolor: entry.color,
                    mr: 1.5,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="body1"
                  component="span"
                  sx={{
                    fontWeight: 500,
                    color: theme.palette.text.primary,
                  }}
                >
                  {entry.name}:{" "}
                  <Typography
                    component="span"
                    sx={{ fontWeight: 500, color: entry.color }}
                  >
                    {formatNumber(entry.percentage)}%
                  </Typography>
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* Individual Macronutrient Details */}
      <Stack spacing={2.5}>
        {pieData.map((item) => {
          const kcalDifference = item.value - item.targetValue;
          const progressPercentageGrams =
            item.targetGrams > 0
              ? (item.actualGrams / item.targetGrams) * 100
              : item.actualGrams > 0
              ? 100
              : 0;

          return (
            <Box
              key={item.name}
              sx={{
                p: 2,
                borderRadius: "12px",
                bgcolor: alpha(item.color, 0.08),
              }}
            >
              {/* Header: Icon, Name, Kcal Difference */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: item.color,
                      color: theme.palette.common.white,
                      mr: 1.5,
                      boxShadow: `0 1px 3px ${alpha(item.color, 0.4)}`,
                    }}
                  >
                    {React.cloneElement(item.icon, {
                      sx: { fontSize: "1.3rem" },
                    })}
                  </Box>
                  <Typography
                    variant="h6"
                    fontWeight="500"
                    color="text.primary"
                  >
                    {item.name}
                  </Typography>
                </Box>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: "500",
                    color:
                      kcalDifference < 0
                        ? theme.palette.error.main
                        : theme.palette.text.secondary,
                  }}
                >
                  {kcalDifference !== 0 ? (kcalDifference > 0 ? "+" : "") : ""}
                  {formatNumber(kcalDifference, 0)} kcal
                </Typography>
              </Box>

              {/* Content: Valor Absoluto & Percentual */}
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: theme.palette.background.paper,
                      borderRadius: "8px",
                      border: `1px solid ${theme.palette.divider}`,
                      height: "100%",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ mb: 0.5 }}
                    >
                      Valor Absoluto
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                      }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color="text.primary"
                      >
                        {formatNumber(item.actualGrams)} g
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Meta: {formatNumber(item.targetGrams)} g
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: theme.palette.background.paper,
                      borderRadius: "8px",
                      border: `1px solid ${theme.palette.divider}`,
                      height: "100%",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ mb: 0.5 }}
                    >
                      Percentual
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                      }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color="text.primary"
                      >
                        {formatNumber(item.percentage)}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Meta: {formatNumber(item.targetPercentage)}%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Progress Bar */}
              <Box sx={{ position: "relative", height: 8, width: "100%" }}>
                <Box
                  sx={{
                    position: "absolute",
                    left: 0,
                    width: "100%",
                    height: "100%",
                    bgcolor: theme.palette.grey[200],
                    borderRadius: 4,
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    left: 0,
                    height: "100%",
                    width: `${Math.min(progressPercentageGrams, 120)}%`,
                    bgcolor: item.color,
                    borderRadius: 4,
                    transition: "width 0.8s ease-out",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    left: "100%",
                    top: "50%",
                    transform: "translateY(-50%) translateX(-1.5px)",
                    height: 12,
                    width: 3,
                    bgcolor: alpha(theme.palette.text.primary, 0.7),
                    borderRadius: 1.5,
                    zIndex: 1,
                    display: item.targetGrams > 0 ? "block" : "none",
                  }}
                />
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};

export default MacronutrientDistribution;
