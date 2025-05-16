import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Grid,
  Divider, // Adicionado para consistência visual se necessário
} from "@mui/material";

interface CalculationDetails {
  formula: string;
  activityFactor: string;
  injuryFactor: string; // Mantido como no original, poderia ser "Fator clínico"
  isValid: boolean;
  validationMessage?: string;
}

interface EnergyPlanResultsSectionProps {
  isCalculating: boolean;
  calculatedTMB: number | null;
  calculatedGET: number | null;
  calculationDetails: CalculationDetails | null;
}

const EnergyPlanResultsSection: React.FC<EnergyPlanResultsSectionProps> = ({
  isCalculating,
  calculatedTMB,
  calculatedGET,
  calculationDetails,
}) => {
  return (
    <Card
      variant="outlined" // Alterado para 'outlined' para consistência, ou mantenha 'elevation' se preferir
      // elevation={2} // Se 'variant="elevation"'
      sx={{
        bgcolor: "rgba(46, 125, 50, 0.05)", // Um verde um pouco mais sutil e claro
        mt: 3,
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2, sm: 2.5 },
          "&:last-child": { pb: { xs: 2, sm: 2.5 } },
        }}
      >
        <Typography
          variant="h6"
          fontWeight={600} // Ajustado para 600 para consistência
          sx={{ mb: 2, color: "success.dark" }} // Usar success.dark para o título
        >
          Resultados Estimados
        </Typography>

        <Divider sx={{ mb: 2, display: isCalculating ? "none" : "block" }} />

        {isCalculating ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column", // Para empilhar em telas menores se necessário
              justifyContent: "center",
              alignItems: "center",
              minHeight: 120, // Aumentado para acomodar melhor
            }}
          >
            <CircularProgress
              size={36}
              sx={{ color: "success.main", mb: 1.5 }}
            />
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              Calculando resultados...
            </Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Taxa Metabólica Basal (TMB)
                </Typography>
                <Typography
                  variant="h4" // Aumentar o destaque
                  fontWeight={700}
                  sx={{ color: "success.darker" }} // Mantido
                >
                  {calculatedTMB !== null
                    ? `${Math.round(calculatedTMB)} kcal`
                    : "-- kcal"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Gasto Energético Total (GET)
                </Typography>
                <Typography
                  variant="h4" // Aumentar o destaque
                  fontWeight={700}
                  sx={{ color: "success.darker" }} // Mantido
                >
                  {calculatedGET !== null
                    ? `${Math.round(calculatedGET)} kcal`
                    : "-- kcal"}
                </Typography>
              </Grid>
            </Grid>

            {calculationDetails?.formula && (
              <>
                <Divider sx={{ my: 2.5 }} />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", lineHeight: 1.6 }}
                >
                  <strong>Usando:</strong> {calculationDetails.formula} (TMB)
                  <br />
                  <strong>Fator Atividade:</strong>{" "}
                  {calculationDetails.activityFactor}
                  <br />
                  <strong>Fator Clínico:</strong>{" "}
                  {calculationDetails.injuryFactor}
                </Typography>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default EnergyPlanResultsSection;
