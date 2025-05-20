import React from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  alpha,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useParams, useNavigate } from "react-router-dom";
import {
  usePatientEnergyPlans,
  useDeleteEnergyPlan,
} from "../hooks/useEnergyPlans";
import { EnergyPlanResponseDto } from "../services/energyPlanService";
import {
  ACTIVITY_FACTOR_DESCRIPTIONS,
  INJURY_FACTOR_DESCRIPTIONS,
  FORMULA_DESCRIPTIONS,
} from "../constants/energyPlanConstants";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import MonitorWeightIcon from "@mui/icons-material/MonitorWeight";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { DesignSystemButton } from "../../../components/DesignSystem/Button/ButtonVariants";
import { theme } from "../../../theme";

const EnergyPlanPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { data: plans, isLoading } = usePatientEnergyPlans(patientId!);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [planToDelete, setPlanToDelete] =
    React.useState<EnergyPlanResponseDto | null>(null);
  const deletePlanMutation = useDeleteEnergyPlan();

  const handleDeleteClick = (plan: EnergyPlanResponseDto) => {
    setPlanToDelete(plan);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (planToDelete && patientId) {
      deletePlanMutation.mutate({ id: planToDelete.id, patientId });
      setDeleteDialogOpen(false);
      setPlanToDelete(null);
    }
  };

  const handleEditClick = (plan: EnergyPlanResponseDto) => {
    navigate(`/patient/${patientId}/energy-plans/edit/${plan.id}`);
  };

  const handleOpenCreate = () => {
    navigate(`/patient/${patientId}/energy-plans/new`);
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
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
          {" "}
          Cálculos de energia
        </Typography>
        <DesignSystemButton startIcon={<AddIcon />} onClick={handleOpenCreate}>
          Criar Novo Plano
        </DesignSystemButton>
      </Box>
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : !plans || plans.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            bgcolor: "grey.50",
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhum plano energético cadastrado ainda
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Comece criando o primeiro plano energético para este paciente.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2.5}>
          {plans.map((plan: EnergyPlanResponseDto) => {
            const formula =
              FORMULA_DESCRIPTIONS[
                plan.formulaKey as keyof typeof FORMULA_DESCRIPTIONS
              ]?.name || plan.formulaKey;
            const activity =
              ACTIVITY_FACTOR_DESCRIPTIONS[
                plan.activityFactorKey as keyof typeof ACTIVITY_FACTOR_DESCRIPTIONS
              ]?.name || plan.activityFactorKey;
            const activityDesc =
              ACTIVITY_FACTOR_DESCRIPTIONS[
                plan.activityFactorKey as keyof typeof ACTIVITY_FACTOR_DESCRIPTIONS
              ]?.description;
            const injury =
              INJURY_FACTOR_DESCRIPTIONS[
                plan.injuryFactorKey as keyof typeof INJURY_FACTOR_DESCRIPTIONS
              ]?.name || plan.injuryFactorKey;
            const injuryDesc =
              INJURY_FACTOR_DESCRIPTIONS[
                plan.injuryFactorKey as keyof typeof INJURY_FACTOR_DESCRIPTIONS
              ]?.description;
            const tmbValue =
              plan.calculatedTmbKcal !== null &&
              plan.calculatedTmbKcal !== undefined &&
              !isNaN(Number(plan.calculatedTmbKcal))
                ? Number(plan.calculatedTmbKcal)
                : null;
            const getValue =
              plan.calculatedGetKcal !== null &&
              plan.calculatedGetKcal !== undefined &&
              !isNaN(Number(plan.calculatedGetKcal))
                ? Number(plan.calculatedGetKcal)
                : null;

            return (
              <Card
                key={plan.id}
                elevation={1}
                sx={{
                  borderRadius: "12px",
                  borderColor: "divider",
                  transition: "all 0.2s",
                  borderRight: `4px solid ${theme.palette.custom.accent}`, // Slightly thinner border
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
                      {plan.name || "Plano energético"}
                    </Typography>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <CalendarMonthIcon
                        sx={{ fontSize: 18, color: "text.secondary" }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {"calculationDate" in plan && plan.calculationDate
                          ? new Date(
                              plan.calculationDate as string
                            ).toLocaleDateString()
                          : "-"}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Resultados Principais (Destacados) */}
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
                        TAXA METABÓLICA BASAL (TMB)
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        color="primary.main"
                        sx={{ mt: 0.5, fontSize: 22 }}
                      >
                        {tmbValue !== null
                          ? `${tmbValue} kcal`
                          : "Não calculado"}
                      </Typography>
                    </Box>
                    <Box sx={{ minWidth: "150px" }}>
                      <Typography
                        variant="caption"
                        fontWeight={500}
                        color="text.secondary"
                        sx={{ fontSize: 12 }}
                      >
                        GASTO ENERGÉTICO TOTAL (GET)
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        color="primary.main"
                        sx={{ mt: 0.5, fontSize: 22 }}
                      >
                        {getValue !== null
                          ? `${getValue} kcal`
                          : "Não calculado"}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Informações da Fórmula - destaque maior */}
                  <Typography
                    variant="subtitle1"
                    color="primary"
                    fontWeight={700}
                    sx={{ mb: 1.5, fontSize: 17 }}
                  >
                    Fórmula: {formula}
                  </Typography>

                  {/* Dados Físicos */}
                  <Box sx={{ display: "flex", gap: 3, mb: 2 }}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <MonitorWeightIcon fontSize="small" color="action" />
                      <Typography variant="body2" fontWeight={500}>
                        {plan.weightAtCalculationKg} kg
                      </Typography>
                    </Box>
                    {plan.fatFreeMassAtCalculationKg !== undefined && (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <FitnessCenterIcon fontSize="small" color="action" />
                        <Typography variant="body2" fontWeight={500}>
                          Massa magra: {plan.fatFreeMassAtCalculationKg} kg
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Fatores */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: 2,
                      mt: 2,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: (theme) =>
                          alpha(theme.palette.primary.main, 0.05),
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        color="primary.main"
                      >
                        Atividade física
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={500}
                        sx={{ mt: 0.5 }}
                      >
                        {activity}{" "}
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                        >
                          ({plan.activityFactorKey})
                        </Typography>
                      </Typography>
                      {activityDesc && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mt: 0.5 }}
                        >
                          {activityDesc}
                        </Typography>
                      )}
                    </Box>
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: "rgba(42,139,139,0.1)",
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        color="primary.main"
                      >
                        Fator clínico
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={500}
                        sx={{ mt: 0.5 }}
                      >
                        {injury}{" "}
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                        >
                          ({plan.injuryFactorKey})
                        </Typography>
                      </Typography>
                      {injuryDesc && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mt: 0.5 }}
                        >
                          {injuryDesc}
                        </Typography>
                      )}
                    </Box>
                  </Box>
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
                  <DesignSystemButton
                    size="small"
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditClick(plan)}
                  >
                    Editar
                  </DesignSystemButton>
                  <DesignSystemButton
                    size="small"
                    variant="outlined"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteClick(plan)}
                    disabled={deletePlanMutation.isPending}
                  >
                    Excluir
                  </DesignSystemButton>
                </CardActions>
              </Card>
            );
          })}
        </Stack>
      )}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: "12px" } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o plano energético "
            {planToDelete?.name}"? Esta ação não poderá ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <DesignSystemButton
            variant="text"
            onClick={() => setDeleteDialogOpen(false)}
          >
            Cancelar
          </DesignSystemButton>
          <DesignSystemButton
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deletePlanMutation.isPending}
          >
            {deletePlanMutation.isPending ? "Excluindo..." : "Excluir"}
          </DesignSystemButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnergyPlanPage;
