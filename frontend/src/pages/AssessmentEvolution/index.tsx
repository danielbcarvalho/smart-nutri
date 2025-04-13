import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Box, Typography, Paper, Stack, CircularProgress } from "@mui/material";
import { patientService } from "../../services/patientService";
import { DateRangeSelector } from "./components/DateRangeSelector";
import { CompositionChart } from "./components/CompositionChart";
import { AnalysisTable } from "./components/AnalysisTable";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";

export function AssessmentEvolution() {
  const { patientId } = useParams<{ patientId: string }>();
  const [dateRange, setDateRange] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});

  // Buscar dados do paciente
  const { data: patient, isLoading: isLoadingPatient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => patientService.getById(patientId!),
    enabled: !!patientId,
  });

  // Buscar medições para evolução
  const { data: measurements, isLoading: isLoadingMeasurements } = useQuery({
    queryKey: ["measurements-evolution", patientId, dateRange],
    queryFn: () =>
      patientService.findMeasurementsEvolution(
        patientId!,
        dateRange.startDate,
        dateRange.endDate
      ),
    enabled: !!patientId,
  });

  if (isLoadingPatient || isLoadingMeasurements) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Cabeçalho */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h4">Evolução da Composição Corporal</Typography>
          <Typography variant="h6" color="text.secondary">
            {patient?.name}
          </Typography>
        </Stack>

        {/* Seletor de Datas */}
        <Paper sx={{ p: 2 }}>
          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={ptBR}
          >
            <DateRangeSelector
              value={dateRange}
              onChange={setDateRange}
              measurements={measurements || []}
            />
          </LocalizationProvider>
        </Paper>

        {/* Gráfico de Evolução */}
        <Paper sx={{ p: 2 }}>
          <CompositionChart measurements={measurements || []} />
        </Paper>

        {/* Tabela de Análises */}
        <Paper sx={{ p: 2 }}>
          <AnalysisTable measurements={measurements || []} />
        </Paper>
      </Stack>
    </Box>
  );
}
