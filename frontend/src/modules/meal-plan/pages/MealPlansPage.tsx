import React, { useState, useEffect, useCallback, memo } from "react";
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
  IconButton,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarTodayIcon, // Ícone para data
  RestaurantMenu as RestaurantMenuIcon, // Ícone para refeições
  FlagOutlined as FlagIcon, // Ícone para objetivo
  InfoOutlined as InfoOutlinedIcon, // Ícone para estado vazio
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  mealPlanService,
  type MealPlan,
} from "@modules/meal-plan/services/mealPlanService";
import { patientService } from "@modules/patient/services/patientService";
import { authService } from "../../auth/services/authService";
import { alpha, Theme } from "@mui/material/styles"; // Para cores com transparência

// Container principal estilizado
const MainContainer = ({ children }: { children: React.ReactNode }) => (
  <Paper
    elevation={0}
    sx={{
      maxWidth: 900,
      mx: "auto",
      p: { xs: 2, sm: 3, md: 4 },
      borderRadius: "16px",
    }}
  >
    {children}
  </Paper>
);

// Estilo dos botões de ação para consistência
const actionButtonSx = {
  borderRadius: "8px",
  padding: "8px 16px",
  textTransform: "none",
  fontWeight: 600,
};

const primaryButtonSx = {
  ...actionButtonSx,
  bgcolor: "custom.main",
  color: "common.white",
  "&:hover": {
    bgcolor: "custom.dark",
  },
};

const outlinedButtonSx = {
  ...actionButtonSx,
  borderColor: "custom.main",
  color: "custom.main",
  "&:hover": {
    borderColor: "custom.dark",
    color: "custom.dark",
    bgcolor: (theme: Theme) => alpha(theme.palette.custom.main, 0.08),
  },
};

const NewPlanForm = memo(
  ({
    onSubmit,
    onCancel,
    patientName,
  }: {
    onSubmit: (data: {
      name: string;
      goal: string;
      startDate: string;
      endDate: string;
    }) => void;
    onCancel: () => void;
    patientName: string;
  }) => {
    const [formData, setFormData] = useState({
      name: "",
      goal: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    });

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
      },
      []
    );

    const handleSubmit = useCallback(() => {
      onSubmit(formData);
    }, [formData, onSubmit]);

    return (
      <MainContainer>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 600, mb: 3, color: "text.primary" }}
        >
          Novo Plano Alimentar para {patientName.split(" ")[0]}
        </Typography>

        <Card
          elevation={2}
          sx={{
            mb: 4,
            borderRadius: "12px",
            overflow: "visible",
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                name="name"
                label="Nome do plano"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Cardápio para ganho de massa"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              />
              <TextField
                fullWidth
                name="goal"
                label="Objetivo do plano (opcional)"
                value={formData.goal}
                onChange={handleChange}
                placeholder="Ex: Melhorar performance e hipertrofia muscular"
                multiline
                rows={3}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  name="startDate"
                  label="Data de início"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                />
                <TextField
                  fullWidth
                  name="endDate"
                  label="Data de término"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                />
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={onCancel} sx={outlinedButtonSx}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={primaryButtonSx}
          >
            Criar e Avançar
          </Button>
        </Stack>
      </MainContainer>
    );
  }
);

NewPlanForm.displayName = "NewPlanForm";

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

  const { data: existingPlans = [], isLoading: isLoadingPlans } = useQuery({
    queryKey: ["mealPlans", patientId],
    queryFn: () => mealPlanService.getPatientPlans(patientId as string),
    enabled: !!patientId,
  });

  const sortedPlans = [...(existingPlans || [])].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleCreatePlan = useCallback(
    (formData: {
      name: string;
      goal: string;
      startDate: string;
      endDate: string;
    }) => {
      if (!patientId) return;
      const nutritionistId = authService.getUser()?.id;
      const planName = formData.name.trim() || "Cardápio personalizado";
      createPlanMutation.mutate({
        name: planName,
        description: formData.goal.trim() || undefined,
        type: "alimentos",
        patientId: patientId as string,
        nutritionistId: nutritionistId as string,
        status: "draft",
        startDate: formData.startDate,
        endDate: formData.endDate,
        meals: [],
      });
    },
    [patientId, createPlanMutation]
  );

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
    navigate(`/patient/${patientId}/meal-plans/${planId}`);
  };

  const handleConfirmDelete = () => {
    if (planToDelete) {
      deletePlanMutation.mutate(planToDelete.id);
    }
  };

  if (!patientId) {
    return (
      <Paper
        elevation={3}
        sx={{
          maxWidth: 800,
          mx: "auto",
          p: { xs: 2, sm: 4 },
          mt: 4,
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "error.main", textAlign: "center" }}
        >
          ID do paciente não encontrado na URL.
        </Typography>
      </Paper>
    );
  }

  if (isLoadingPatient || isLoadingPlans) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 200px)",
          p: 3,
        }}
      >
        <CircularProgress color="primary" />
        <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
          Carregando dados...
        </Typography>
      </Box>
    );
  }

  if (!patient) {
    return (
      <Paper
        elevation={3}
        sx={{
          maxWidth: 800,
          mx: "auto",
          p: { xs: 2, sm: 4 },
          mt: 4,
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "error.main", textAlign: "center" }}
        >
          Paciente não encontrado. Verifique o ID fornecido.
        </Typography>
      </Paper>
    );
  }

  if (showNewPlanForm) {
    return (
      <NewPlanForm
        onSubmit={handleCreatePlan}
        onCancel={() => navigate(`/patient/${patientId}/meal-plans`)}
        patientName={patient?.name || ""}
      />
    );
  }

  return (
    <MainContainer>
      <>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4, // Aumentado margin bottom
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            Planos Alimentares
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() =>
              navigate(`/patient/${patientId}/meal-plans?new=true`)
            }
            sx={primaryButtonSx}
          >
            Criar Novo Plano
          </Button>
        </Box>

        <Stack spacing={2.5}>
          {" "}
          {/* Aumentado espaçamento entre cards */}
          {sortedPlans.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: { xs: 6, sm: 8 },
                bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                borderRadius: "12px",
              }}
            >
              <InfoOutlinedIcon
                sx={{ fontSize: 56, color: "text.secondary", mb: 2 }}
              />
              <Typography
                variant="h6"
                gutterBottom
                color="text.primary"
                sx={{ fontWeight: 500 }}
              >
                Nenhum plano alimentar aqui ainda
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 3, maxWidth: "400px", mx: "auto" }}
              >
                Comece criando o primeiro plano alimentar.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() =>
                  navigate(`/patient/${patientId}/meal-plans?new=true`)
                }
                sx={outlinedButtonSx}
              >
                Criar primeiro plano
              </Button>
            </Box>
          ) : (
            sortedPlans.map((plan) => (
              <Card
                key={plan.id}
                elevation={1} // Sombra mais sutil para os cards da lista
                onClick={() =>
                  navigate(`/patient/${patientId}/meal-plans/${plan.id}`)
                }
                sx={{
                  cursor: "pointer",
                  borderRadius: "12px", // Consistência
                  transition: "all 0.2s ease-in-out",
                  border: "1px solid",
                  borderColor: "divider",
                  "&:hover": {
                    boxShadow: (theme) =>
                      `0px 6px 20px ${alpha(theme.palette.custom.main, 0.15)}`,
                    borderColor: "custom.main",
                    transform: "translateY(-3px)",
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                  {" "}
                  {/* Padding ajustado */}
                  <Typography
                    variant="h6"
                    component="div"
                    gutterBottom
                    sx={{
                      fontWeight: "bold",
                      color: "custom.dark" /* Ou text.primary */,
                    }}
                  >
                    {plan.name || "Plano Sem Nome"}
                  </Typography>
                  <Stack spacing={1} sx={{ mt: 1.5 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CalendarTodayIcon
                        fontSize="small"
                        sx={{ color: "text.secondary" }}
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        component="div"
                      >
                        <Box component="strong" sx={{ fontWeight: 500 }}>
                          Criado em:
                        </Box>{" "}
                        {new Date(plan.createdAt).toLocaleDateString()}
                      </Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1}>
                      <RestaurantMenuIcon
                        fontSize="small"
                        sx={{ color: "text.secondary" }}
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        component="div"
                      >
                        <Box component="strong" sx={{ fontWeight: 500 }}>
                          Refeições:
                        </Box>{" "}
                        {plan.meals?.length || 0}
                      </Typography>
                    </Stack>

                    {plan.description && (
                      <Stack
                        direction="row"
                        alignItems="flex-start"
                        spacing={1}
                      >
                        <FlagIcon
                          fontSize="small"
                          sx={{ color: "text.secondary", mt: "3px" }}
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          component="div"
                        >
                          <Box component="strong" sx={{ fontWeight: 500 }}>
                            Objetivo:
                          </Box>{" "}
                          {plan.description}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </CardContent>
                <CardActions
                  sx={{ justifyContent: "flex-end", pt: 0, pb: 1.5, px: 1.5 }}
                >
                  <IconButton
                    size="medium"
                    onClick={(e) => handleEditClick(e, plan.id)}
                    title="Ver Detalhes"
                    sx={{
                      color: "custom.main",
                      "&:hover": {
                        bgcolor: (theme: Theme) =>
                          alpha(theme.palette.custom.main, 0.1),
                      },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="medium"
                    onClick={(e) => handleDeleteClick(e, plan)}
                    title="Excluir Plano"
                    sx={{
                      color: "error.main",
                      "&:hover": {
                        bgcolor: (theme) =>
                          alpha(theme.palette.error.main, 0.1),
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            ))
          )}
        </Stack>

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          PaperProps={{ sx: { borderRadius: "12px" } }}
        >
          <DialogTitle sx={{ fontWeight: 600 }}>Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Tem certeza que deseja excluir o plano alimentar "
              {planToDelete?.name}"? Esta ação não poderá ser desfeita.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              sx={{ ...actionButtonSx, color: "text.secondary" }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
              disabled={deletePlanMutation.isPending}
              sx={{
                ...actionButtonSx,
                bgcolor: "error.main",
                "&:hover": { bgcolor: "error.dark" },
              }}
            >
              {deletePlanMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    </MainContainer>
  );
}
