import { Box, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

export function NewAssessment() {
  const { patientId } = useParams();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Nova Avaliação
      </Typography>
      <Typography variant="body1">
        Página em construção para nova avaliação do paciente ID: {patientId}
      </Typography>
    </Box>
  );
}
