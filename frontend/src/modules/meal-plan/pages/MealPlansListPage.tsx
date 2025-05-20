import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Stack,
  Paper,
  CircularProgress,
  Button,
  TextField,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarMonth as CalendarMonthIcon,
} from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { mealPlanService } from "../services/mealPlanService";
import { useTheme } from "@mui/material/styles";
import React, { useState, useEffect, useCallback, memo } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { DesignSystemButton } from "../../../components/DesignSystem/Button/ButtonVariants";
import { patientService } from "@modules/patient/services/patientService";
import { authService } from "../../auth/services/authService";
import { alpha } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";

// Estilo dos botões de ação para consistência
const actionButtonSx = {
  borderRadius: "8px",
  padding: "8px 16px",
  textTransform: "none",
  fontWeight: 600,
};

const primaryButtonSx = {
  ...actionButtonSx,
  bgcolor: "custom.primary",
  color: "common.white",
  "&:hover": {
    bgcolor: "custom.dark",
  },
};

const outlinedButtonSx = {
  ...actionButtonSx,
  borderColor: "custom.primary",
  color: "custom.primary",
  "&:hover": {
    borderColor: "custom.dark",
    color: "custom.dark",
    bgcolor: (theme: any) => alpha(theme.palette.custom.primary, 0.08),
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
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{
            color: "text.primary",
          }}
        >
          Novo Plano Alimentar para {patientName.split(" ")[0]}
        </Typography>

        <Card
          elevation={2}
          sx={{
            m: 4,
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
          <DesignSystemButton
            variant="secondary"
            onClick={onCancel}
            sx={outlinedButtonSx}
          >
            Cancelar
          </DesignSystemButton>
          <DesignSystemButton
            variant="primary"
            onClick={handleSubmit}
            sx={primaryButtonSx}
          >
            Criar e Avançar
          </DesignSystemButton>
        </Stack>
      </Box>
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
  const [planToDelete, setPlanToDelete] = useState<any | null>(null);

  const deletePlanMutation = useMutation({
    mutationFn: mealPlanService.deletePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealPlans", patientId] });
      setDeleteDialogOpen(false);
      setPlanToDelete(null);
    },
  });

  const handleDeleteClick = (event: React.MouseEvent, plan: any) => {
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

  const theme = useTheme();

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
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: { xs: "flex-start", sm: "space-between" },
          alignItems: { xs: "stretch", sm: "center" },
          mb: 3,
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{
            color: "text.primary",
          }}
        >
          Planos Alimentares
        </Typography>
        <DesignSystemButton
          startIcon={<AddIcon />}
          onClick={() => navigate(`/patient/${patientId}/meal-plans?new=true`)}
        >
          Criar Novo Plano
        </DesignSystemButton>
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
          </Box>
        ) : (
          sortedPlans.map((plan) => (
            <Card
              key={plan.id}
              elevation={1}
              onClick={() =>
                navigate(`/patient/${patientId}/meal-plans/${plan.id}`)
              }
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
                {/* Cabeçalho */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    {plan.name || "Plano Sem Nome"}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <CalendarMonthIcon
                      sx={{ fontSize: 18, color: "text.secondary" }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {new Date(plan.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>

                {/* Resultados Principais */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 3,
                    flexWrap: "wrap",
                    mb: 2,
                    p: 1.5,
                    bgcolor: "background.paper",
                    borderRadius: 1,
                  }}
                >
                  <Box sx={{ minWidth: "150px" }}>
                    <Typography
                      variant="caption"
                      fontWeight={500}
                      color="text.secondary"
                      sx={{ fontSize: 12 }}
                    >
                      CALORIAS TOTAIS
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color="primary.main"
                      sx={{ mt: 0.5, fontSize: 22 }}
                    >
                      {Number(plan.dailyCalories) > 0
                        ? `${Number(plan.dailyCalories)} kcal`
                        : "0 kcal"}
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: "150px" }}>
                    <Typography
                      variant="caption"
                      fontWeight={500}
                      color="text.secondary"
                      sx={{ fontSize: 12 }}
                    >
                      REFEIÇÕES
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color="primary.main"
                      sx={{ mt: 0.5, fontSize: 22 }}
                    >
                      {plan.meals?.length || 0}
                    </Typography>
                  </Box>
                </Box>

                {/* Macronutrientes - Layout mais compacto */}
                <Typography
                  variant="subtitle1"
                  color="primary"
                  fontWeight={700}
                  sx={{ mb: 1.5, fontSize: 17 }}
                >
                  Macronutrientes
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    mb: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,

                      px: 1.5,
                      py: 0.75,
                      borderRadius: 1,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      color="primary.main"
                    >
                      Proteínas:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {Number(plan.dailyProtein) > 0
                        ? `${Number(plan.dailyProtein)}g`
                        : "0g"}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,

                      px: 1.5,
                      py: 0.75,
                      borderRadius: 1,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      color="primary.main"
                    >
                      Carboidratos:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {Number(plan.dailyCarbs) > 0
                        ? `${Number(plan.dailyCarbs)}g`
                        : "0g"}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,

                      px: 1.5,
                      py: 0.75,
                      borderRadius: 1,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      color="primary.main"
                    >
                      Gorduras:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {Number(plan.dailyFat) > 0
                        ? `${Number(plan.dailyFat)}g`
                        : "0g"}
                    </Typography>
                  </Box>
                </Box>

                {/* Descrição/Objetivo em formato de callout */}
                {plan.description && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 1.5,
                      bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, 0.05),
                      borderColor: "primary.main",
                      borderRadius: "0 4px 4px 0",
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: "0.95rem" }}
                    >
                      <Box
                        component="span"
                        sx={{ fontWeight: 600, color: "primary.main" }}
                      >
                        Descrição
                      </Box>{" "}
                    </Typography>
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                    >
                      {plan.description}
                    </Typography>
                  </Box>
                )}
              </CardContent>

              <CardActions
                sx={{
                  justifyContent: "flex-end",
                  pt: 0,
                  pb: 2,
                  px: 2,
                  gap: 1,
                }}
              >
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  startIcon={<EditIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick(e, plan.id);
                  }}
                >
                  Editar
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(e, plan);
                  }}
                >
                  Excluir
                </Button>
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
          <DesignSystemButton
            variant="secondary"
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ ...actionButtonSx, color: "text.secondary" }}
          >
            Cancelar
          </DesignSystemButton>
          <DesignSystemButton
            onClick={handleConfirmDelete}
            color="error"
            disabled={deletePlanMutation.isPending}
            sx={{
              ...actionButtonSx,
              bgcolor: "error.main",
              "&:hover": { bgcolor: "error.dark" },
            }}
          >
            {deletePlanMutation.isPending ? "Excluindo..." : "Excluir"}
          </DesignSystemButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
