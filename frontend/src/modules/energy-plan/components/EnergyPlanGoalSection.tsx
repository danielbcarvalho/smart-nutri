import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Slider,
  TextField,
} from "@mui/material";

interface EnergyPlanGoalSectionProps {
  goalWeight: number; // Variação de peso desejada (pode ser negativo para perda)
  setGoalWeight: (value: number) => void;
  goalDays: number; // Dias para atingir a meta
  setGoalDays: (value: number) => void;
}

const EnergyPlanGoalSection: React.FC<EnergyPlanGoalSectionProps> = ({
  goalWeight,
  setGoalWeight,
  goalDays,
  setGoalDays,
}) => {
  const handleGoalWeightChange = (value: string) => {
    const numericValue = parseFloat(value.replace(",", "."));
    if (!isNaN(numericValue)) {
      setGoalWeight(numericValue);
    } else if (value === "" || value === "-") {
      // Permite limpar o campo ou iniciar com sinal negativo
      setGoalWeight(0); // Ou algum outro valor padrão se "" não for ideal
    }
  };

  const handleGoalDaysChange = (value: string) => {
    const numericValue = parseInt(value, 10);
    if (!isNaN(numericValue) && numericValue >= 0) {
      setGoalDays(numericValue);
    } else if (value === "") {
      setGoalDays(0); // Ou 1, se 0 não for um estado válido
    }
  };

  // Calcula as calorias diárias necessárias para atingir a meta
  const dailyKcalChange = React.useMemo(() => {
    if (goalWeight !== 0 && goalDays > 0) {
      return Math.round((goalWeight * 7700) / goalDays);
    }
    return null; // Retorna null se não for possível calcular
  }, [goalWeight, goalDays]);

  return (
    <Card variant="outlined" sx={{ mt: 3 }}>
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Meta
        </Typography>

        {/* Seção de Meta de Peso */}
        <Box sx={{ mb: 3 }}>
          {" "}
          {/* Aumentei um pouco a margem inferior */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Quantos kg o paciente precisa ganhar ou perder?
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              width: "100%",
            }}
          >
            <Slider
              value={goalWeight}
              onChange={(_, v) => setGoalWeight(Number(v))}
              min={-40} // Ex: Limite de perda de 40kg
              max={40} // Ex: Limite de ganho de 40kg
              step={0.1}
              sx={{
                flex: 1,
                color: "success.main",
                height: 6,
                mr: 1 /* Pequena margem para não colar no input */,
              }}
              valueLabelDisplay="auto"
              marks={[
                { value: -20, label: "-20kg" },
                { value: 0, label: "0kg" },
                { value: 20, label: "+20kg" },
              ]}
            />
            <TextField
              value={goalWeight.toFixed(1).replace(".", ",")}
              onChange={(e) => handleGoalWeightChange(e.target.value)}
              // type="number" // Usar text para melhor controle de formatação e entrada com vírgula
              inputMode="decimal" // Melhora a experiência mobile
              size="small"
              inputProps={{
                // min: -40, // Removido pois type="text"
                // max: 40,
                // step: 0.1,
                style: { textAlign: "right", width: "50px" }, // Largura direto no inputProps
              }}
              sx={{ width: 95 /* Largura total do TextField wrapper */ }}
            />
            <Typography sx={{ width: "auto", minWidth: 25, textAlign: "left" }}>
              Kg
            </Typography>{" "}
            {/* Ajuste para unidade */}
          </Box>
        </Box>

        {/* Seção de Tempo Estimado */}
        <Box sx={{ mb: 3 }}>
          {" "}
          {/* Aumentei um pouco a margem inferior */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Qual o tempo estimado para esta meta?
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              width: "100%",
            }}
          >
            <Slider
              value={goalDays}
              onChange={(_, v) => setGoalDays(Number(v))}
              min={0}
              max={365} // Ex: Limite de 1 ano
              step={1}
              sx={{ flex: 1, color: "success.main", height: 6, mr: 1 }}
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
              type="number"
              size="small"
              inputProps={{
                min: 0,
                max: 365,
                step: 1,
                style: { textAlign: "right", width: "50px" },
              }}
              sx={{ width: 95 }}
            />
            <Typography sx={{ width: "auto", minWidth: 45, textAlign: "left" }}>
              Dia(s)
            </Typography>{" "}
            {/* Ajuste para unidade */}
          </Box>
        </Box>

        {/* Seção de Resultado */}
        <Box sx={{ bgcolor: "success.lightest", borderRadius: 2, p: 2, mt: 2 }}>
          {/* Usando cor do tema para fundo, ex: theme.palette.success.lightest
            Se não tiver lightest, pode ser: alpha(theme.palette.success.main, 0.1) 
            Ou manter a cor original: bgcolor: "#e8f5e9" */}
          <Typography
            variant="body2" // Alterado para body2 para ser menos proeminente que o resultado principal
            color="text.secondary"
            sx={{ mb: 0.5 }}
          >
            Resultado Estimado:
          </Typography>
          <Typography variant="h6" fontWeight="fontWeightBold">
            {" "}
            {/* Usando fontWeightBold do tema */}
            {goalWeight >= 0 ? "Ganho" : "Perda"} de{" "}
            {Math.abs(goalWeight).toFixed(1).replace(".", ",")} Kg em {goalDays}{" "}
            dia(s)
          </Typography>
          <Typography variant="body1" color="text.primary" fontWeight="500">
            {" "}
            {/* Destaque para o Kcal/dia */}(
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
