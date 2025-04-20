import React from "react";
import { Box, Typography, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface AssessmentHeaderProps {
  patientName: string;
  onNavigateBack: () => void;
  isEditMode: boolean;
}

export const AssessmentHeader: React.FC<AssessmentHeaderProps> = ({
  patientName,
  isEditMode,
}) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">
          {isEditMode
            ? "Editar Avaliação Antropométrica"
            : "Nova Avaliação Antropométrica"}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
        <Typography variant="h6" sx={{ mr: 1 }}>
          Paciente:
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: "bold", mr: 4 }}>
          {patientName}
        </Typography>
      </Box>
    </Box>
  );
};
