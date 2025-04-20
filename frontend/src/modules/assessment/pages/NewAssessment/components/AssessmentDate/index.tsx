import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";

interface AssessmentDateProps {
  assessmentDate: Date | null;
  onAssessmentDateChange: (date: Date | null) => void;
}

export const AssessmentDate: React.FC<AssessmentDateProps> = ({
  assessmentDate,
  onAssessmentDateChange,
}) => {
  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography variant="h6" sx={{ mr: 2, fontWeight: "medium" }}>
          Data da Avaliação:
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
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
    </Paper>
  );
};
