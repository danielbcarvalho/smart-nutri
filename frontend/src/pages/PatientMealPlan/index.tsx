import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  Add as AddIcon,
  NavigateNext as NavigateNextIcon,
} from "@mui/icons-material";
import { mealPlanService, type MealPlan } from "../../services/mealPlanService";
import { patientService } from "../../services/patientService";

export function PatientMealPlan() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  // Buscar dados do paciente
  const { data: patient, isLoading: isLoadingPatient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => patientService.getById(patientId!),
    enabled: !!patientId,
  });

  // Buscar planos alimentares do paciente
  const { data: plans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ["patientMealPlans", patientId],
    queryFn: () => mealPlanService.getPatientPlans(patientId!),
    enabled: !!patientId,
  });

  if (isLoadingPatient || isLoadingPlans) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          p: 4,
        }}
      >
        <CircularProgress sx={{ color: "custom.main" }} />
      </Box>
    );
  }

  if (!patient) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Não foi possível carregar os dados do paciente.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Link
          color="inherit"
          href="/patients"
          sx={{
            textDecoration: "none",
            "&:hover": { color: "custom.main" },
          }}
        >
          Pacientes
        </Link>
        <Link
          color="inherit"
          href={`/patient/${patientId}`}
          sx={{
            textDecoration: "none",
            "&:hover": { color: "custom.main" },
          }}
        >
          {patient.name}
        </Link>
        <Typography color="text.primary">Planos Alimentares</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Typography variant="h5" color="text.primary">
            Planos Alimentares
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(`/meal-plan?patientId=${patientId}`)}
            sx={{
              bgcolor: "custom.main",
              color: "common.white",
              "&:hover": {
                bgcolor: "custom.dark",
              },
            }}
          >
            Novo Plano
          </Button>
        </Stack>

        {!plans?.length ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            Nenhum plano alimentar encontrado para este paciente.
          </Alert>
        ) : (
          <Stack spacing={2}>
            {plans.map((plan: MealPlan) => (
              <Card
                key={plan.id}
                sx={{
                  bgcolor: "background.paper",
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {plan.name}
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Tipo: {plan.type}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status: {plan.status}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Período: {new Date(plan.startDate).toLocaleDateString()} -{" "}
                    {new Date(plan.endDate).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() =>
                      navigate(`/meal-plan/${plan.id}?patientId=${patientId}`)
                    }
                    sx={{
                      color: "custom.main",
                      "&:hover": {
                        bgcolor: "transparent",
                      },
                    }}
                  >
                    Ver detalhes
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
