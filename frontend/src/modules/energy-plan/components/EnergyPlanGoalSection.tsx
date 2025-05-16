import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Slider,
  TextField,
  useTheme, // Para acessar cores do tema de forma mais robusta
  alpha, // Para transparência
} from "@mui/material";

interface EnergyPlanGoalSectionProps {
  goalWeight: number;
  setGoalWeight: (value: number) => void;
  goalDays: number;
  setGoalDays: (value: number) => void;
}

const EnergyPlanGoalSection: React.FC<EnergyPlanGoalSectionProps> = ({
  goalWeight,
  setGoalWeight,
  goalDays,
  setGoalDays,
}) => {
  const theme = useTheme(); // Acesso ao tema

  const handleGoalWeightChange = (value: string) => {
    const cleanedValue = value.replace(",", ".");
    // Permite "-" ou "-." ou "." no início
    if (
      cleanedValue === "" ||
      cleanedValue === "-" ||
      cleanedValue === "." ||
      cleanedValue === "-."
    ) {
      setGoalWeight(0); // Ou algum valor que indique "vazio" se 0 não for ideal
      return;
    }
    const numericValue = parseFloat(cleanedValue);
    if (!isNaN(numericValue)) {
      setGoalWeight(numericValue);
    }
  };

  const handleGoalDaysChange = (value: string) => {
    if (value === "") {
      setGoalDays(0); // Ou 1, se 0 não for um estado válido
      return;
    }
    const numericValue = parseInt(value, 10);
    if (!isNaN(numericValue) && numericValue >= 0) {
      setGoalDays(numericValue);
    }
  };

  const dailyKcalChange = React.useMemo(() => {
    if (goalWeight !== 0 && goalDays > 0) {
      return Math.round((goalWeight * 7700) / goalDays);
    }
    return null;
  }, [goalWeight, goalDays]);

  // Largura consistente para o TextField e a unidade para alinhar os Sliders
  const textFieldWidth = 80;
  const unitWidth = 50; // Suficiente para "Dia(s)"

  return (
    <Card variant="outlined" sx={{ mt: 3 /*, maxWidth: 600, mx: 'auto' */ }}>
      {" "}
      {/* Opcional: limitar largura do card */}
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2.5 }}>
          Meta
        </Typography>

        {/* Seção de Meta de Peso */}
        <Box sx={{ mb: 3, p: 2.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Quantos kg o paciente precisa ganhar ou perder?
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2, // Espaçamento entre Slider, TextField e Unidade
            }}
          >
            <Slider
              value={goalWeight}
              onChange={(_, v) => setGoalWeight(Number(v))}
              min={-40}
              max={40}
              step={0.1}
              sx={{
                flex: 1,
                color: "success.main",
                height: 6,
                m: 2.5,
              }}
              valueLabelDisplay="auto"
              marks={[
                { value: -20, label: "-20kg" },
                { value: 0, label: "0kg" },
                { value: 20, label: "+20kg" },
              ]}
            />
            <TextField
              value={
                goalWeight === 0 &&
                (goalWeight.toString().startsWith("-") ||
                  goalWeight.toString() === "0.0")
                  ? goalWeight.toFixed(1).replace(".", ",")
                  : goalWeight.toString().replace(".", ",")
              }
              onChange={(e) => handleGoalWeightChange(e.target.value)}
              inputMode="decimal"
              size="small"
              inputProps={{
                style: { textAlign: "right" },
              }}
              sx={{
                width: textFieldWidth, // Largura fixa para o TextField
              }}
            />
            <Typography
              sx={{ width: unitWidth, textAlign: "left", minWidth: unitWidth }}
            >
              Kg
            </Typography>
          </Box>
        </Box>

        {/* Seção de Tempo Estimado */}
        <Box sx={{ mb: 3, p: 2.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Qual o tempo estimado para esta meta?
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Slider
              value={goalDays}
              onChange={(_, v) => setGoalDays(Number(v))}
              min={0}
              max={365}
              step={1}
              sx={{
                flex: 1,
                color: "success.main",
                height: 6,
                m: 2.5,
              }}
              valueLabelDisplay="auto"
              marks={[
                { value: 0, label: "0d" },
                { value: 30, label: "30d" },
                { value: 90, label: "90d" },
                { value: 180, label: "180d" },
                { value: 365, label: "365d" },
              ]}
            />
            <TextField
              value={goalDays.toString()}
              onChange={(e) => handleGoalDaysChange(e.target.value)}
              type="number" // Mantém o tipo number para validação e teclado numérico
              size="small"
              inputProps={{
                min: 0,
                max: 365,
                step: 1,
                style: { textAlign: "right" },
              }}
              sx={{
                width: textFieldWidth,
              }}
            />
            <Typography
              sx={{ width: unitWidth, textAlign: "left", minWidth: unitWidth }}
            >
              Dia(s)
            </Typography>
          </Box>
        </Box>

        {/* Seção de Resultado */}
        <Box
          sx={{
            bgcolor:
              theme.palette.success.lightest ||
              alpha(theme.palette.success.main, 0.1), // Fallback se lightest não existir
            borderRadius: 2,
            p: 2,
            mt: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Resultado Estimado:
          </Typography>
          <Typography variant="h6" fontWeight={theme.typography.fontWeightBold}>
            {goalWeight === 0
              ? "Manutenção"
              : goalWeight > 0
              ? "Ganho"
              : "Perda"}{" "}
            de {Math.abs(goalWeight).toFixed(1).replace(".", ",")} Kg em{" "}
            {goalDays} dia(s)
          </Typography>
          <Typography variant="body1" color="text.primary" fontWeight={500}>
            (
            {dailyKcalChange !== null
              ? `${dailyKcalChange > 0 ? "+" : ""}${dailyKcalChange} Kcal/dia`
              : "-- Kcal/dia"}
            )
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1.5, display: "block" }}
          >
            *Baseado em 7700 kcal por kg de peso corporal.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EnergyPlanGoalSection;
