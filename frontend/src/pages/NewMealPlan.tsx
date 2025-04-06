import { Box, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

export function NewMealPlan() {
  const { patientId } = useParams();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Novo Plano Alimentar
      </Typography>
      <Typography variant="body1">
        Página em construção para novo plano alimentar do paciente ID:{" "}
        {patientId}
      </Typography>
    </Box>
  );
}
