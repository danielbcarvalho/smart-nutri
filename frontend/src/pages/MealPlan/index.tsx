import React, { useState, useEffect } from "react";
import {
  useNavigate,
  useParams,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mealPlanService, type MealPlan } from "../../services/mealPlanService";
import { patientService } from "../../services/patientService";

export function MealPlan() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { patientId } = useParams<{ patientId: string }>();
  const queryPatientId = searchParams.get("patientId");

  // Redirect effect to handle old URL format
  useEffect(() => {
    if (queryPatientId && !patientId) {
      navigate(
        `/patient/${queryPatientId}/meal-plans${
          location.search.includes("new=true") ? "?new=true" : ""
        }`,
        { replace: true }
      );
    }
  }, [queryPatientId, patientId, navigate, location.search]);

  const showNewPlanForm = location.search === "?new=true";
  const [newPlanName, setNewPlanName] = useState("");
  const [selectedType, setSelectedType] = useState<
    "alimentos" | "equivalentes" | "qualitativa"
  >("alimentos");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );

  // Buscar dados do paciente
  const { data: patient, isLoading: isLoadingPatient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => patientService.getById(patientId as string),
    enabled: !!patientId,
  });

  const queryClient = useQueryClient();

  const createPlanMutation = useMutation({
    mutationFn: mealPlanService.createPlan,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["mealPlans", patientId] });
      navigate(`/patient/${patientId}/meal-plans/${data.id}`);
    },
  });

  // Buscar planos existentes do paciente
  const { data: existingPlans = [], isLoading: isLoadingPlans } = useQuery({
    queryKey: ["mealPlans", patientId],
    queryFn: () => mealPlanService.getPatientPlans(patientId as string),
    enabled: !!patientId,
  });

  // Ordenar planos por data de criação (mais recentes primeiro)
  const sortedPlans = [...(existingPlans || [])].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newType: "alimentos" | "equivalentes" | "qualitativa"
  ) => {
    if (newType !== null) {
      setSelectedType(newType);
    }
  };

  const handleCreatePlan = () => {
    if (!patientId) return;

    const planName = newPlanName.trim() || "Cardápio personalizado";
    createPlanMutation.mutate({
      name: planName,
      type: selectedType,
      patientId,
      status: "draft",
      startDate,
      endDate,
      meals: [],
    });
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<MealPlan | null>(null);

  const deletePlanMutation = useMutation({
    mutationFn: mealPlanService.deletePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealPlans", patientId] });
      setDeleteDialogOpen(false);
      setPlanToDelete(null);
    },
  });

  const handleDeleteClick = (event: React.MouseEvent, plan: MealPlan) => {
    event.stopPropagation();
    setPlanToDelete(plan);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (event: React.MouseEvent, planId: string) => {
    event.stopPropagation();
    navigate(`/patient/${patientId}/meal-plans/${planId}/edit`);
  };

  const handleConfirmDelete = () => {
    if (planToDelete) {
      deletePlanMutation.mutate(planToDelete.id);
    }
  };

  if (!patientId) {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
        <Typography variant="h6" sx={{ color: "error.main" }}>
          ID do paciente não encontrado
        </Typography>
      </Box>
    );
  }

  if (isLoadingPatient || isLoadingPlans) {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
        <Typography variant="h6" color="text.secondary">
          Carregando...
        </Typography>
      </Box>
    );
  }

  if (!patient) {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
        <Typography variant="h6" sx={{ color: "error.main" }}>
          Paciente não encontrado
        </Typography>
      </Box>
    );
  }

  if (showNewPlanForm) {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
        <Typography variant="h5" gutterBottom color="text.primary">
          Novo Plano Alimentar
        </Typography>

        <Card
          sx={{
            mb: 3,
            bgcolor: "background.paper",
          }}
        >
          <CardContent>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Nome do plano"
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
                placeholder="Cardápio personalizado"
                helperText="Se não informado, será usado 'Cardápio personalizado'"
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  label="Data de início"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  label="Data de término"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>

              <Box>
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  color="text.primary"
                >
                  Tipo de prescrição
                </Typography>
                <ToggleButtonGroup
                  value={selectedType}
                  exclusive
                  onChange={handleTypeChange}
                  aria-label="tipo de prescrição"
                >
                  <ToggleButton
                    value="alimentos"
                    sx={{
                      "&.Mui-selected": {
                        bgcolor: "custom.lightest",
                        color: "custom.main",
                        "&:hover": {
                          bgcolor: "custom.lightest",
                        },
                      },
                    }}
                  >
                    Por alimentos
                  </ToggleButton>
                  <ToggleButton
                    value="equivalentes"
                    disabled
                    sx={{
                      opacity: 0.5,
                      "&.Mui-disabled": {
                        color: "text.secondary",
                      },
                    }}
                  >
                    Por equivalentes (em breve)
                  </ToggleButton>
                  <ToggleButton
                    value="qualitativa"
                    disabled
                    sx={{
                      opacity: 0.5,
                      "&.Mui-disabled": {
                        color: "text.secondary",
                      },
                    }}
                  >
                    Qualitativa (em breve)
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  color="text.primary"
                >
                  Metodologia selecionada:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedType === "alimentos" && (
                    <>
                      Prescrição detalhada com alimentos específicos,
                      quantidades e informações nutricionais.
                    </>
                  )}
                  {selectedType === "equivalentes" && (
                    <>
                      Prescrição baseada em porções e grupos alimentares
                      equivalentes.
                    </>
                  )}
                  {selectedType === "qualitativa" && (
                    <>
                      Prescrição com orientações gerais e sugestões de
                      alimentos.
                    </>
                  )}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={() => navigate(`/patient/${patientId}/meal-plans`)}
            sx={{
              borderColor: "custom.main",
              color: "custom.main",
              "&:hover": {
                borderColor: "custom.dark",
                bgcolor: "transparent",
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleCreatePlan}
            disabled={createPlanMutation.isPending}
            sx={{
              bgcolor: "custom.main",
              color: "common.white",
              "&:hover": {
                bgcolor: "custom.dark",
              },
            }}
          >
            Criar plano
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
      {!showNewPlanForm && (
        <>
          <Typography variant="h5" gutterBottom color="text.primary">
            Planos Alimentares
          </Typography>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() =>
              navigate(`/patient/${patientId}/meal-plans?new=true`)
            }
            sx={{
              mb: 3,
              bgcolor: "custom.main",
              color: "common.white",
              "&:hover": {
                bgcolor: "custom.dark",
              },
            }}
          >
            Criar Novo Plano
          </Button>

          <Stack spacing={2}>
            {sortedPlans.map((plan) => (
              <Card
                key={plan.id}
                onClick={() =>
                  navigate(`/patient/${patientId}/meal-plans/${plan.id}`)
                }
                sx={{
                  bgcolor: "background.paper",
                  cursor: "pointer",
                  "&:hover": {
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {plan.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tipo: {plan.type}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Status: {plan.status}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "flex-end", p: 1 }}>
                  <IconButton
                    size="small"
                    onClick={(e) => handleEditClick(e, plan.id)}
                    sx={{
                      color: "custom.main",
                      "&:hover": {
                        bgcolor: "custom.lightest",
                      },
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => handleDeleteClick(e, plan)}
                    sx={{
                      color: "error.main",
                      "&:hover": {
                        bgcolor: "error.lightest",
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            ))}
          </Stack>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
          >
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Tem certeza que deseja excluir o plano "{planToDelete?.name}"?
                Esta ação não pode ser desfeita.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setDeleteDialogOpen(false)}
                sx={{
                  color: "text.secondary",
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmDelete}
                color="error"
                variant="contained"
                disabled={deletePlanMutation.isPending}
              >
                Excluir
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
}
