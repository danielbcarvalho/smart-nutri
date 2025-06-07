import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Skeleton,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Person as PersonIcon,
  FitnessCenter as FitnessCenterIcon,
  Timeline as TimelineIcon,
  Fastfood as FastfoodIcon,
} from "@mui/icons-material";

// Import existing hooks and services
import { usePatientAiData } from "../hooks/usePatientAiData";
import { formatDate, calculateAge } from "../../../utils/dateUtils";

interface PatientDataSummaryProps {
  patientId?: string;
}

export const PatientDataSummary: React.FC<PatientDataSummaryProps> = ({
  patientId,
}) => {
  const { data: patientData, isLoading, error } = usePatientAiData(patientId);

  if (!patientId) {
    return (
      <Alert severity="warning">
        Nenhum paciente selecionado. Selecione um paciente para continuar.
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="h6">Carregando dados do paciente...</Typography>
        </Box>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} md={6} key={item}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Erro ao carregar dados do paciente. Tente novamente.
      </Alert>
    );
  }

  if (!patientData) {
    return (
      <Alert severity="info">
        Dados do paciente não encontrados. Verifique se o paciente existe.
      </Alert>
    );
  }

  const {
    patient,
    latestMeasurement,
    energyPlan,
    previousMealPlans,
    progressPhotos,
  } = patientData;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Dados do Paciente para IA
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Revisão dos dados que serão utilizados pela IA para gerar o plano
          alimentar personalizado
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Patient Basic Info */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <PersonIcon color="primary" />
                <Typography variant="h6">Informações Básicas</Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography variant="body1">
                  <strong>Nome:</strong> {patient.name}
                </Typography>
                <Typography variant="body1">
                  <strong>Idade:</strong> {calculateAge(patient.birthDate)} anos
                </Typography>
                <Typography variant="body1">
                  <strong>Gênero:</strong>{" "}
                  {patient.gender === "M" ? "Masculino" : "Feminino"}
                </Typography>
                <Typography variant="body1">
                  <strong>Ocupação:</strong> {patient.occupation || "Não informado"}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Latest Measurements */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <FitnessCenterIcon color="primary" />
                <Typography variant="h6">Dados Antropométricos</Typography>
              </Box>
              {latestMeasurement ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography variant="body1">
                    <strong>Peso:</strong> {latestMeasurement.weight} kg
                  </Typography>
                  <Typography variant="body1">
                    <strong>Altura:</strong> {latestMeasurement.height} m
                  </Typography>
                  <Typography variant="body1">
                    <strong>IMC:</strong>{" "}
                    {(
                      latestMeasurement.weight /
                      (latestMeasurement.height * latestMeasurement.height)
                    ).toFixed(1)}
                  </Typography>
                  {latestMeasurement.bodyFat && (
                    <Typography variant="body1">
                      <strong>% Gordura:</strong> {latestMeasurement.bodyFat}%
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Última medição: {formatDate(latestMeasurement.measureDate)}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Nenhuma medição encontrada
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Energy Plan */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <TimelineIcon color="primary" />
                <Typography variant="h6">Planejamento Energético</Typography>
              </Box>
              {energyPlan ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography variant="body1">
                    <strong>TMB:</strong> {Math.round(energyPlan.bmr)} kcal/dia
                  </Typography>
                  <Typography variant="body1">
                    <strong>GET:</strong> {Math.round(energyPlan.tee)} kcal/dia
                  </Typography>
                  <Typography variant="body1">
                    <strong>Objetivo:</strong> {energyPlan.objective}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={`Fórmula: ${energyPlan.formula}`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Nenhum plano energético encontrado
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Previous Meal Plans */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <FastfoodIcon color="primary" />
                <Typography variant="h6">Histórico Alimentar</Typography>
              </Box>
              {previousMealPlans && previousMealPlans.length > 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography variant="body1">
                    <strong>Planos anteriores:</strong> {previousMealPlans.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Último plano: {formatDate(previousMealPlans[0]?.createdAt)}
                  </Typography>
                  <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {previousMealPlans.slice(0, 3).map((plan, index) => (
                      <Chip
                        key={plan.id}
                        label={plan.title}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                    {previousMealPlans.length > 3 && (
                      <Chip
                        label={`+${previousMealPlans.length - 3} mais`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Nenhum plano alimentar anterior encontrado
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Progress Photos Summary */}
      {progressPhotos && progressPhotos.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Fotos de Progresso Disponíveis
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              A IA pode usar as fotos de progresso para análise visual complementar
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
              {["front", "back", "left", "right"].map((type) => {
                const count = progressPhotos.filter(
                  (photo) => photo.type === type
                ).length;
                return (
                  <Chip
                    key={type}
                    label={`${type}: ${count} fotos`}
                    size="small"
                    variant={count > 0 ? "filled" : "outlined"}
                    color={count > 0 ? "primary" : "default"}
                  />
                );
              })}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Summary Alert */}
      <Alert severity="info">
        <Typography variant="subtitle2" gutterBottom>
          Dados Disponíveis para a IA
        </Typography>
        <Typography variant="body2">
          Estes dados serão utilizados pela SmartNutri AI para criar
          recomendações personalizadas. Quanto mais dados disponíveis, mais
          precisa será a recomendação.
        </Typography>
      </Alert>
    </Box>
  );
};