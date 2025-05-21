import { useState, useMemo, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Stack,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  alpha,
  useTheme,
} from "@mui/material";
import { patientService } from "@/modules/patient/services/patientService";
import { DateRangeSelector } from "./components/DateRangeSelector";
import { CompositionChart } from "./components/CompositionChart";
import { AnalysisTable } from "./components/AnalysisTable";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";
import {
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  parseISO,
} from "date-fns";
import { PhotoEvolutionSection } from "./components/PhotoEvolutionSection";
import TimelineIcon from "@mui/icons-material/Timeline";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

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
  const theme = useTheme();
  const { patientId } = useParams<{ patientId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState(getDefaultDateRange);
  const [selectedMeasurements, setSelectedMeasurements] = useState<string[]>(
    []
  );
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
  });

  // Filtrar medições localmente com base no período selecionado no estado 'dateRange'
  const filteredMeasurements = useMemo(() => {
    // Se não houver medições totais, retorna array vazio
    if (!allMeasurements) return [];

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

    return filtered;
  }, [allMeasurements, dateRange]);

  // Filtrar medições baseado nas seleções do usuário
  const displayedMeasurements = useMemo(() => {
    if (selectedMeasurements.length === 0) {
      return filteredMeasurements;
    }
    return filteredMeasurements.filter((m) =>
      selectedMeasurements.includes(m.id)
    );
  }, [filteredMeasurements, selectedMeasurements]);

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
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{
              color: "text.primary",
            }}
          >
            Evolução
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {patient?.name ?? "Paciente não encontrado"}
          </Typography>
        </Box>

        {/* Tabs de navegação */}
        <Card
          elevation={1}
          sx={{
            borderRadius: "12px",
            borderColor: "divider",
            transition: "all 0.2s",
            borderRight: `4px solid ${theme.palette.custom.accent}`,
            "&:hover": {
              boxShadow: 4,
              borderColor: "primary.main",
            },
          }}
        >
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 500,
                fontSize: "1rem",
                py: 2,
              },
            }}
          >
            <Tab
              label="Evolução de Medidas"
              icon={<TimelineIcon />}
              iconPosition="start"
            />
            <Tab
              label="Evolução Fotográfica"
              icon={<PhotoCameraIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Card>

        {/* Seletor de Datas */}
        <Card
          elevation={1}
          sx={{
            borderRadius: "12px",
            borderColor: "divider",
            transition: "all 0.2s",
            borderRight: `4px solid ${theme.palette.custom.accent}`,
            "&:hover": {
              boxShadow: 4,
              borderColor: "primary.main",
            },
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={ptBR}
            >
              <DateRangeSelector
                value={dateRange}
                onChange={setDateRange}
                measurements={filteredMeasurements}
                selectedMeasurements={selectedMeasurements}
                onMeasurementsChange={setSelectedMeasurements}
              />
            </LocalizationProvider>
          </CardContent>
        </Card>

        {/* Conteúdo das abas */}
        {tabIndex === 0 ? (
          displayedMeasurements.length > 0 ? (
            <>
              <Card
                elevation={1}
                sx={{
                  borderRadius: "12px",
                  borderColor: "divider",
                  transition: "all 0.2s",
                  borderRight: `4px solid ${theme.palette.custom.accent}`,
                  "&:hover": {
                    boxShadow: 4,
                    borderColor: "primary.main",
                  },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <CompositionChart measurements={displayedMeasurements} />
                </CardContent>
              </Card>
              <Card
                elevation={1}
                sx={{
                  borderRadius: "12px",
                  borderColor: "divider",
                  transition: "all 0.2s",
                  borderRight: `4px solid ${theme.palette.custom.accent}`,
                  "&:hover": {
                    boxShadow: 4,
                    borderColor: "primary.main",
                  },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <AnalysisTable measurements={displayedMeasurements} />
                </CardContent>
              </Card>
            </>
          ) : (
            <Card
              elevation={1}
              sx={{
                p: 4,
                textAlign: "center",
                borderRadius: "12px",
                borderColor: "divider",
                borderRight: `4px solid ${theme.palette.custom.accent}`,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Nenhuma avaliação encontrada
              </Typography>
              <Typography color="text.secondary" paragraph>
                Não há avaliações registradas para o período selecionado.
              </Typography>
            </Card>
          )
        ) : (
          <Card
            elevation={1}
            sx={{
              borderRadius: "12px",
              borderColor: "divider",
              transition: "all 0.2s",
              borderRight: `4px solid ${theme.palette.custom.accent}`,
              "&:hover": {
                boxShadow: 4,
                borderColor: "primary.main",
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <PhotoEvolutionSection
                measurements={displayedMeasurements}
                dateRange={dateRange}
              />
            </CardContent>
          </Card>
        )}
      </Stack>
    </Box>
  );
}
