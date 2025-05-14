import { useState, useMemo, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Paper,
  Stack,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import { patientService } from "@/modules/patient/services/patientService";
import { DateRangeSelector } from "./components/DateRangeSelector";
import { CompositionChart } from "./components/CompositionChart";
import { AnalysisTable } from "./components/AnalysisTable";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";
// 1. Importar funções necessárias do date-fns
import {
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  parseISO,
} from "date-fns";
import { PhotoEvolutionSection } from "./components/PhotoEvolutionSection";

// 2. Definir a função para calcular o range padrão (fora do componente)
const getDefaultDateRange = () => {
  const endDate = new Date();
  const startDate = subMonths(endDate, 12); // Pega 12 meses atrás (1 ano)
  return {
    // Usa startOfMonth e endOfMonth para consistência com DateRangeSelector
    startDate: format(startOfMonth(startDate), "yyyy-MM-dd"),
    endDate: format(endOfMonth(endDate), "yyyy-MM-dd"),
  };
};

export function AssessmentEvolution() {
  const { patientId } = useParams<{ patientId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState(getDefaultDateRange);
  // Define a aba inicial baseada na rota
  const getTabIndexFromPath = () => {
    if (location.pathname.endsWith("/photos")) return 1;
    return 0;
  };
  const [tabIndex, setTabIndex] = useState(getTabIndexFromPath());

  // Atualiza a aba se a rota mudar
  useEffect(() => {
    setTabIndex(getTabIndexFromPath());
  }, [location.pathname]);

  // Ao trocar de aba, navega para a rota correspondente
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
    if (newValue === 0) {
      navigate(`/patient/${patientId}/assessments/evolution/measurements`);
    } else {
      navigate(`/patient/${patientId}/assessments/evolution/photos`);
    }
  };

  // Buscar dados do paciente
  const { data: patient, isLoading: isLoadingPatient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => patientService.getById(patientId!),
    enabled: !!patientId,
  });

  // Buscar TODAS as medições (sem filtro de data inicial na API)
  const { data: allMeasurements, isLoading: isLoadingMeasurements } = useQuery({
    queryKey: ["all-measurements", patientId],
    queryFn: () => patientService.getMeasurements(patientId!),
    enabled: !!patientId,
    // staleTime: 5 * 60 * 1000, // Opcional: manter dados frescos por 5 min
  });

  console.log(
    "Medições recebidas da API:",
    allMeasurements?.map((m) => ({
      date: m.date,
      fatMass: m.fatMass,
      fatFreeMass: m.fatFreeMass,
      bodyFat: m.bodyFat,
    }))
  );

  // Filtrar medições localmente com base no período selecionado no estado 'dateRange'
  const filteredMeasurements = useMemo(() => {
    // Se não houver medições totais, retorna array vazio
    if (!allMeasurements) return [];

    console.log("Todas as medições recebidas:", allMeasurements);

    // Tenta criar objetos Date a partir das strings do estado dateRange
    // Adiciona hora para garantir inclusão correta do início/fim do dia
    const startDateFilter = dateRange.startDate
      ? parseISO(dateRange.startDate + "T00:00:00")
      : null;
    const endDateFilter = dateRange.endDate
      ? parseISO(dateRange.endDate + "T23:59:59")
      : null;

    // Filtra as medições
    const filtered = allMeasurements.filter((measurement) => {
      // Converte a data da medição (assumindo que está em 'yyyy-MM-dd') para Date
      // Adiciona hora do meio-dia para evitar problemas simples de timezone
      const measurementDate = parseISO(measurement.date + "T12:00:00");

      // Verifica se a data da medição está dentro do range (se o range existir)
      if (startDateFilter && measurementDate < startDateFilter) return false;
      if (endDateFilter && measurementDate > endDateFilter) return false;

      // Se passou pelas verificações, inclui a medição
      return true;
    });

    console.log("Medições filtradas:", filtered);
    return filtered;
  }, [allMeasurements, dateRange]); // Recalcula SOMENTE se as medições totais ou o dateRange mudarem

  // Estado de Carregamento
  if (isLoadingPatient || isLoadingMeasurements) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="calc(100vh - 200px)"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Renderização do Componente
  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Stack spacing={3}>
        {/* Cabeçalho */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={{ xs: 1, sm: 2 }}
        >
          <Typography variant="h4" component="h1">
            Evolução
          </Typography>
          <Typography variant="h6" color="text.secondary" component="p">
            {patient?.name ?? "Paciente não encontrado"}
          </Typography>
        </Stack>

        {/* Tabs de navegação */}
        <Paper elevation={2} sx={{ p: 0 }}>
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Evolução de Medidas" />
            <Tab label="Evolução Fotográfica" />
          </Tabs>
        </Paper>

        {/* Seletor de Datas (compartilhado) */}
        <Paper elevation={2} sx={{ p: 2 }}>
          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={ptBR}
          >
            <DateRangeSelector
              value={dateRange}
              onChange={setDateRange}
              measurements={filteredMeasurements}
            />
          </LocalizationProvider>
        </Paper>

        {/* Conteúdo das abas */}
        {tabIndex === 0 ? (
          filteredMeasurements.length > 0 ? (
            <>
              <Paper elevation={2} sx={{ p: 2 }}>
                <CompositionChart measurements={filteredMeasurements} />
              </Paper>
              <Paper elevation={2} sx={{ p: 2 }}>
                <AnalysisTable
                  measurements={filteredMeasurements}
                  patient={patient}
                />
              </Paper>
            </>
          ) : (
            <Paper elevation={1} sx={{ p: 3, textAlign: "center" }}>
              <Typography color="text.secondary">
                Nenhuma avaliação encontrada para o período selecionado.
              </Typography>
            </Paper>
          )
        ) : (
          <PhotoEvolutionSection
            measurements={allMeasurements || []}
            dateRange={dateRange}
          />
        )}
      </Stack>
    </Box>
  );
}
