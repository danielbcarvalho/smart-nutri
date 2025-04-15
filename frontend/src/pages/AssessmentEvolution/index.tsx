import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Box, Typography, Paper, Stack, CircularProgress } from "@mui/material";
import { patientService, Measurement } from "../../services/patientService"; // Assume Measurement é exportado daqui
import { DateRangeSelector } from "./components/DateRangeSelector"; // Ajuste o caminho se necessário
import { CompositionChart } from "./components/CompositionChart"; // Ajuste o caminho se necessário
import { AnalysisTable } from "./components/AnalysisTable"; // Ajuste o caminho se necessário
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

// 2. Definir a função para calcular o range padrão (fora do componente)
const getDefaultDateRange = () => {
  const endDate = new Date();
  const startDate = subMonths(endDate, 3); // Pega 3 meses atrás
  return {
    // Usa startOfMonth e endOfMonth para consistência com DateRangeSelector
    startDate: format(startOfMonth(startDate), "yyyy-MM-dd"),
    endDate: format(endOfMonth(endDate), "yyyy-MM-dd"),
  };
};

export function AssessmentEvolution() {
  const { patientId } = useParams<{ patientId: string }>();

  // 3. Inicializar o estado 'dateRange' chamando a função getDefaultDateRange
  const [dateRange, setDateRange] = useState(getDefaultDateRange);

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
  console.log("🚀 ~ index.tsx:52 ~ allMeasurements 🚀🚀🚀:", allMeasurements);

  // Filtrar medições localmente com base no período selecionado no estado 'dateRange'
  const filteredMeasurements = useMemo(() => {
    // Se não houver medições totais, retorna array vazio
    if (!allMeasurements) return [];

    // Se não houver datas no range (pouco provável agora com valor default, mas seguro ter)
    // Poderia retornar tudo ou nada, dependendo do desejado. Vamos retornar tudo.
    // if (!dateRange.startDate || !dateRange.endDate) {
    //   return allMeasurements;
    // }
    // Com o valor default, este caso se torna menos relevante.

    // Tenta criar objetos Date a partir das strings do estado dateRange
    // Adiciona hora para garantir inclusão correta do início/fim do dia
    const startDateFilter = dateRange.startDate
      ? parseISO(dateRange.startDate + "T00:00:00")
      : null;
    const endDateFilter = dateRange.endDate
      ? parseISO(dateRange.endDate + "T23:59:59")
      : null;

    // Filtra as medições
    return allMeasurements.filter((measurement) => {
      // Converte a data da medição (assumindo que está em 'yyyy-MM-dd') para Date
      // Adiciona hora do meio-dia para evitar problemas simples de timezone
      const measurementDate = parseISO(measurement.date + "T12:00:00");

      // Verifica se a data da medição está dentro do range (se o range existir)
      if (startDateFilter && measurementDate < startDateFilter) return false;
      if (endDateFilter && measurementDate > endDateFilter) return false;

      // Se passou pelas verificações, inclui a medição
      return true;
    });
  }, [allMeasurements, dateRange]); // Recalcula SOMENTE se as medições totais ou o dateRange mudarem
  console.log(
    "🚀 ~ index.tsx:89 ~ filteredMeasurements 🚀🚀🚀:",
    filteredMeasurements
  );

  // Estado de Carregamento
  if (isLoadingPatient || isLoadingMeasurements) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="calc(100vh - 200px)" // Exemplo de altura
      >
        <CircularProgress />
      </Box>
    );
  }

  // Renderização do Componente
  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {" "}
      {/* Padding responsivo */}
      <Stack spacing={3}>
        {/* Cabeçalho */}
        <Stack
          direction={{ xs: "column", sm: "row" }} // Empilha em telas pequenas
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }} // Alinha diferente em telas pequenas
          spacing={{ xs: 1, sm: 2 }} // Espaçamento responsivo
        >
          <Typography variant="h4" component="h1">
            {" "}
            {/* Semântica HTML */}
            Evolução Corporal
          </Typography>
          <Typography variant="h6" color="text.secondary" component="p">
            {patient?.name ?? "Paciente não encontrado"}
          </Typography>
        </Stack>

        {/* Seletor de Datas */}
        <Paper elevation={2} sx={{ p: 2 }}>
          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={ptBR}
          >
            {/* Passa o estado dateRange e o setDateRange */}
            {/* Passa as medições JÁ FILTRADAS para a contagem no DateRangeSelector */}
            <DateRangeSelector
              value={dateRange}
              onChange={setDateRange}
              measurements={filteredMeasurements}
            />
          </LocalizationProvider>
        </Paper>

        {/* Verifica se há dados filtrados antes de renderizar gráficos/tabelas */}
        {filteredMeasurements.length > 0 ? (
          <>
            {/* Gráfico de Evolução */}
            <Paper elevation={2} sx={{ p: 2 }}>
              <CompositionChart measurements={filteredMeasurements} />
            </Paper>

            {/* Tabela de Análises */}
            <Paper elevation={2} sx={{ p: 2 }}>
              <AnalysisTable measurements={filteredMeasurements} />
            </Paper>
          </>
        ) : (
          // Mensagem se não houver dados no período selecionado
          <Paper elevation={1} sx={{ p: 3, textAlign: "center" }}>
            <Typography color="text.secondary">
              Nenhuma avaliação encontrada para o período selecionado.
            </Typography>
          </Paper>
        )}
      </Stack>
    </Box>
  );
}
