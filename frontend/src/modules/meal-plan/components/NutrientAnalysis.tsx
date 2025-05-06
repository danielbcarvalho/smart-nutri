import React from "react";
import {
  Box,
  Typography,
  Stack,
  Paper,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import InfoIcon from "@mui/icons-material/Info";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import ScaleIcon from "@mui/icons-material/Scale";

interface NutrientAnalysisProps {
  protein: number;
  fat: number;
  carbohydrates: number;
  calories: number;
  totalWeight: number;
}

const COLORS = ["#FF6B6B", "#FFD93F", "#4ECDC4"];

function getCaloricDensityClass(density: number) {
  if (density <= 0.6) return { label: "Muito Baixa", color: "#4ECDC4" };
  if (density <= 1.5) return { label: "Baixa", color: "#45B7AA" };
  if (density <= 3.9) return { label: "Média", color: "#96CEB4" };
  if (density <= 5.0) return { label: "Alta", color: "#FFD93F" };
  return { label: "Muito Alta", color: "#FF6B6B" };
}

export const NutrientAnalysis: React.FC<NutrientAnalysisProps> = ({
  protein,
  fat,
  carbohydrates,
  calories,
  totalWeight,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isMedium = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const density = totalWeight ? calories / totalWeight : 0;
  const densityClass = getCaloricDensityClass(density);

  // Distribuição calórica dos macronutrientes
  const kcalProtein = protein * 4;
  const kcalFat = fat * 9;
  const kcalCarb = carbohydrates * 4;

  const totalKcalMacros = kcalProtein + kcalFat + kcalCarb;
  const macroData = [
    { name: "Proteínas", value: kcalProtein },
    { name: "Lipídios", value: kcalFat },
    { name: "Carboidratos", value: kcalCarb },
  ];

  // Legenda customizada mais limpa e alinhada
  const renderCustomLegend = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: 1,
        width: "100%",
      }}
    >
      {macroData.map((entry, idx) => {
        const percent =
          totalKcalMacros > 0 ? (entry.value / totalKcalMacros) * 100 : 0;
        return (
          <Box
            key={entry.name}
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              px: 1,
            }}
          >
            <Box
              component="span"
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: COLORS[idx],
                marginRight: 1.5,
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.primary,
                fontWeight: 400,
                fontSize: "0.875rem",
              }}
            >
              {entry.name}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                marginLeft: 1,
                color: COLORS[idx],
                fontWeight: "500",
                fontSize: "0.875rem",
              }}
            >
              {Math.round(entry.value)} kcal
            </Typography>
            <Typography
              variant="body2"
              sx={{
                marginLeft: 1,
                color: COLORS[idx],
                fontWeight: 400,
                fontSize: "0.875rem",
              }}
            >
              ({percent.toFixed(0)}%)
            </Typography>
          </Box>
        );
      })}
    </Box>
  );

  const hasMacroData = totalKcalMacros > 0;
  const hasBasicData =
    protein > 0 ||
    fat > 0 ||
    carbohydrates > 0 ||
    calories > 0 ||
    totalWeight > 0;

  // Common card styles
  const cardStyle = {
    p: { xs: 1.5, sm: 2.5 },
    borderRadius: { xs: 2, sm: 3 },
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
    border: `1px solid ${theme.palette.divider}`,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    [theme.breakpoints.down("sm")]: {
      boxShadow: "none",
      borderRadius: 2,
      border: `1px solid ${theme.palette.grey[200]}`,
    },
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        backgroundColor: theme.palette.background.paper,
        mb: 2,
        boxShadow: theme.shadows[1],
        border: `1px solid ${theme.palette.divider}`,
        transition: "none",
        "&:hover": { transform: "none" },
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 3,
          fontWeight: "bold",
          color: theme.palette.primary.main,
          textAlign: "center",
        }}
      >
        Análise de Nutrientes
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: isMedium ? "column" : isMobile ? "column" : "row",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          justifyContent="space-between"
          sx={{
            width: "100%",
            gap: 3,
          }}
        >
          {/* Seção 1: Macronutrientes com gradiente e ícones */}
          <Box
            sx={{
              ...cardStyle,
              flex: isMedium ? "0 0 100%" : isMobile ? "0 0 100%" : "1 1 0",
              mb: isMedium ? 3 : 0,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: "bold",
                color: theme.palette.text.primary,
                mb: 2,
                textAlign: "left",
              }}
            >
              Macronutrientes
            </Typography>
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {hasBasicData ? (
                <Stack spacing={2} sx={{ width: "100%" }}>
                  {[
                    {
                      label: "Proteínas",
                      value: protein.toFixed(1) + "g",
                      color: COLORS[0],
                      icon: (
                        <FitnessCenterIcon
                          sx={{ fontSize: 16, color: COLORS[0] }}
                        />
                      ),
                    },
                    {
                      label: "Lipídios",
                      value: fat.toFixed(1) + "g",
                      color: COLORS[1],
                      icon: (
                        <LocalFireDepartmentIcon
                          sx={{ fontSize: 16, color: COLORS[1] }}
                        />
                      ),
                    },
                    {
                      label: "Carboidratos",
                      value: carbohydrates.toFixed(1) + "g",
                      color: COLORS[2],
                      icon: (
                        <RestaurantIcon
                          sx={{ fontSize: 16, color: COLORS[2] }}
                        />
                      ),
                    },
                    {
                      label: "Calorias",
                      value: Math.round(calories) + " Kcal",
                      color: theme.palette.primary.main,
                      icon: (
                        <LocalFireDepartmentIcon
                          sx={{
                            fontSize: 16,
                            color: theme.palette.primary.main,
                          }}
                        />
                      ),
                    },
                    {
                      label: "Peso Total",
                      value: Math.round(totalWeight) + "g",
                      color: theme.palette.grey[600],
                      icon: (
                        <ScaleIcon
                          sx={{ fontSize: 16, color: theme.palette.grey[600] }}
                        />
                      ),
                    },
                  ].map((item, index) => (
                    <Stack
                      key={index}
                      direction="row"
                      alignItems="center"
                      spacing={1.5}
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        backgroundColor: "rgba(255, 255, 255, 0.5)",
                        transition: "background-color 0.3s ease",
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 0.8)",
                        },
                      }}
                    >
                      {item.icon}
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {item.label}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: "bold", color: item.color }}
                      >
                        {item.value}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 3,
                    color: theme.palette.text.secondary,
                  }}
                >
                  <RestaurantIcon
                    sx={{ fontSize: 40, mb: 1, color: theme.palette.grey[400] }}
                  />
                  <Typography variant="body2">
                    Nenhum dado de nutrientes disponível
                  </Typography>
                  <Typography variant="caption">
                    Adicione alimentos para ver a análise
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Seção 2 and 3: Wrapper for middle columns in medium screens */}
          <Stack
            direction={isMedium ? "row" : "column"}
            sx={{
              flex: isMedium ? "0 0 100%" : isMobile ? "0 0 100%" : "2 1 0",
              gap: 3,
              width: "100%",
            }}
          >
            {/* Seção 2: Densidade Calórica */}
            <Box
              sx={{
                ...cardStyle,
                flex: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: "bold",
                    color: theme.palette.text.primary,
                    textAlign: "left",
                  }}
                >
                  Densidade Calórica
                </Typography>
                <Tooltip
                  title="Relação entre calorias totais e o peso da refeição (Kcal/g). Indica quão calórica é a refeição por unidade de peso."
                  arrow
                  placement="top"
                >
                  <InfoIcon
                    fontSize="small"
                    sx={{
                      color: theme.palette.text.disabled,
                      cursor: "pointer",
                      transition: "transform 0.2s",
                      ml: 1,
                      "&:hover": {
                        transform: "scale(1.1)",
                        color: theme.palette.primary.main,
                      },
                    }}
                  />
                </Tooltip>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {hasBasicData && totalWeight > 0 ? (
                  <>
                    <Box sx={{ width: "100%", maxWidth: 220, mb: 2 }}>
                      <Box
                        sx={{
                          height: 24,
                          width: "100%",
                          bgcolor: theme.palette.grey[200],
                          borderRadius: 2,
                          position: "relative",
                          overflow: "hidden",
                          boxShadow: "inset 0 0 4px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        <Box
                          sx={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            height: "100%",
                            width: `${Math.min((density / 5) * 100, 100)}%`,
                            bgcolor: densityClass.color,
                            borderRadius: 2,
                            transition: "width 0.8s ease-out",
                            background: `linear-gradient(to right, ${densityClass.color}cc, ${densityClass.color})`,
                            boxShadow: "0 0 8px rgba(0, 0, 0, 0.2)",
                          }}
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        align="center"
                        sx={{
                          mt: 0.5,
                          display: "block",
                          color: theme.palette.text.secondary,
                          fontWeight: "bold",
                        }}
                      >
                        {density.toFixed(2)} Kcal/g
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        px: 2.5,
                        py: 1.2,
                        borderRadius: 2,
                        bgcolor: densityClass.color,
                        color: theme.palette.getContrastText(
                          densityClass.color
                        ),
                        fontWeight: "bold",
                        textAlign: "center",
                        boxShadow: `0 2px 4px ${densityClass.color}66`,
                        transition: "transform 0.3s ease",
                        "&:hover": {
                          transform: "scale(1.03)",
                        },
                      }}
                    >
                      {densityClass.label}
                    </Box>
                  </>
                ) : (
                  <Box
                    sx={{
                      textAlign: "center",
                      color: theme.palette.text.secondary,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      py: 3,
                    }}
                  >
                    <LocalFireDepartmentIcon
                      sx={{
                        fontSize: 40,
                        mb: 1,
                        color: theme.palette.grey[400],
                      }}
                    />
                    <Typography variant="body2">
                      Dados de densidade não disponíveis
                    </Typography>
                    <Typography variant="caption">
                      Adicione alimentos com peso para calcular
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Seção 3: Distribuição Calórica */}
            <Box
              sx={{
                ...cardStyle,
                flex: 1,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: "bold",
                  color: theme.palette.text.primary,
                  textAlign: "left",
                }}
              >
                Distribuição Calórica
              </Typography>

              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {hasMacroData ? (
                  <>
                    <Box
                      sx={{
                        height: isMedium ? 150 : isMobile ? 120 : 160,
                        width: "100%",
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={macroData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={isMedium ? 30 : 38}
                            outerRadius={isMedium ? 55 : 65}
                            paddingAngle={2}
                            labelLine={false}
                            stroke="#fff"
                            strokeWidth={2}
                          >
                            {macroData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            formatter={(value: number) =>
                              `${Math.round(value)} kcal (${(
                                (value / totalKcalMacros) *
                                100
                              ).toFixed(0)}%)`
                            }
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>

                    <Box sx={{ width: "100%" }}>{renderCustomLegend()}</Box>
                  </>
                ) : (
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 3,
                      color: theme.palette.text.secondary,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <LocalDiningIcon
                      sx={{
                        fontSize: 40,
                        mb: 1,
                        color: theme.palette.grey[400],
                      }}
                    />
                    <Typography variant="body2">
                      Sem dados de distribuição calórica
                    </Typography>
                    <Typography variant="caption">
                      Adicione alimentos para visualizar o gráfico
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
};

export default NutrientAnalysis;
