import React from "react";
import { Box, Typography, Paper, Button } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface AssessmentHeaderProps {
  patientName: string;
  assessmentDate: Date | null;
  onAssessmentDateChange: (date: Date | null) => void;
  onNavigateBack: () => void;
  isEditMode: boolean;
}

export const AssessmentHeader: React.FC<AssessmentHeaderProps> = ({
  patientName,
  assessmentDate,
  onAssessmentDateChange,
  onNavigateBack,
  isEditMode,
}) => {
  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={onNavigateBack}
          sx={{ mr: 2 }}
        >
          Voltar
        </Button>
        <Typography variant="h5">
          {isEditMode ? "Editar Avaliação" : "Nova Avaliação"}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
        <Typography variant="h6" sx={{ mr: 1 }}>
          Paciente:
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: "bold", mr: 4 }}>
          {patientName}
        </Typography>

        <Box
          sx={{ display: "flex", alignItems: "center", mt: { xs: 2, sm: 0 } }}
        >
          <Typography variant="body1" sx={{ mr: 1 }}>
            Data da Avaliação:
          </Typography>
          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={ptBR}
          >
            <DatePicker
              value={assessmentDate}
              onChange={onAssessmentDateChange}
              format="dd/MM/yyyy"
              slotProps={{
                textField: {
                  variant: "outlined",
                  size: "small",
                  sx: { width: 150 },
                },
              }}
            />
          </LocalizationProvider>
        </Box>
      </Box>
    </Paper>
  );
};
