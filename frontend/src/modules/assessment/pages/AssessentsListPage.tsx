import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Stack,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  useTheme,
  Alert,
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
  alpha,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Timeline,
  CalendarMonth,
} from "@mui/icons-material";
import { patientService } from "@/modules/patient/services/patientService";
import { formatDateToLocal } from "@utils/dateUtils";
import { LoadingBackdrop } from "@components/LoadingBackdrop";
import { useState } from "react";
import { DesignSystemButton } from "../../../components/DesignSystem/Button/ButtonVariants";

export function Assessments() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Estados para controle de diálogos e notificações
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [measurementToDelete, setMeasurementToDelete] = useState<string | null>(
    null
  );
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const { data: measurements, isLoading } = useQuery({
    queryKey: ["measurements", patientId],
    queryFn: () => patientService.findMeasurements(patientId!),
    enabled: !!patientId,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  // Mutation para excluir uma avaliação
  const deleteMeasurementMutation = useMutation({
    mutationFn: (measurementId: string) => {
      return patientService.deleteMeasurement(patientId!, measurementId);
    },
    onSuccess: async () => {
      // Recarregar queries para atualizar os dados imediatamente
      await queryClient.refetchQueries({
        queryKey: ["measurements", patientId],
      });
      await queryClient.refetchQueries({ queryKey: ["patient", patientId] });

      // Invalidar também outras queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["all-measurements"] });

      setSnackbar({
        open: true,
        message: "Avaliação excluída com sucesso",
        severity: "success",
      });
    },
    onError: (error) => {
      console.error("Erro ao excluir avaliação:", error);
      setSnackbar({
        open: true,
        message: "Erro ao excluir avaliação",
        severity: "error",
      });
    },
  });

  const handleNewAssessment = () => {
    navigate(`/patient/${patientId}/assessments/new`);
  };

  const handleEditAssessment = (measurementId: string) => {
    // Antes de navegar, limpar o cache da avaliação específica
    queryClient.removeQueries({
      queryKey: ["measurement", patientId, measurementId],
    });

    // Navegar para a página de edição de avaliação
    navigate(`/patient/${patientId}/assessments/edit/${measurementId}`);
  };

  const handleDeleteClick = (measurementId: string) => {
    setMeasurementToDelete(measurementId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (measurementToDelete) {
      deleteMeasurementMutation.mutate(measurementToDelete);
      setDeleteDialogOpen(false);
      setMeasurementToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setMeasurementToDelete(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatDate = (dateString: string) => {
    return formatDateToLocal(dateString);
  };

  if (isLoading) {
    return <LoadingBackdrop open={isLoading} />;
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
          Avaliações Antropométricas
        </Typography>
        <Stack direction={isMobile ? "column" : "row"} spacing={2}>
          <DesignSystemButton
            variant="contained"
            startIcon={<Timeline />}
            onClick={() =>
              navigate(
                `/patient/${patientId}/assessments/evolution/measurements`
              )
            }
            fullWidth={isMobile}
          >
            Evolução
          </DesignSystemButton>
          <DesignSystemButton
            variant="contained"
            startIcon={<Add />}
            onClick={handleNewAssessment}
            fullWidth={isMobile}
          >
            Nova Avaliação
          </DesignSystemButton>
        </Stack>
      </Box>

      {measurements && measurements.length > 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {measurements.map((measurement) => {
            // Calcula o IMC se tiver altura e peso
            const height = Number(measurement.height);
            const weight = Number(measurement.weight);
            let imc = "-";
            if (height && weight) {
              const heightInMeters = height / 100;
              imc = (weight / (heightInMeters * heightInMeters)).toFixed(1);
            }

            return (
              <Card
                key={measurement.id}
                sx={{
                  width: "100%",
                  borderRadius: "12px",
                  borderColor: "divider",
                  transition: "all 0.2s",
                  borderRight: `4px solid ${theme.palette.custom.accent}`,
                  "&:hover": {
                    boxShadow: 4,
                    borderColor: "primary.main",
                    cursor: "pointer",
                  },
                }}
                onClick={() => handleEditAssessment(measurement.id)}
              >
                <CardContent sx={{ p: 2.5 }}>
                  {/* Cabeçalho com data e ações */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <CalendarMonth
                        sx={{ fontSize: 18, color: "text.secondary" }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(measurement.date as string)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Dados principais */}
                  <Box
                    sx={{
                      display: "grid",
                      gap: 1,
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                        md: "repeat(5, 1fr)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        p: 0.75,
                        bgcolor: (theme) =>
                          alpha(theme.palette.primary.main, 0.05),
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: 10 }}
                      >
                        PESO
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="primary.main"
                      >
                        {weight} kg
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 0.75,
                        bgcolor: (theme) =>
                          alpha(theme.palette.primary.main, 0.05),
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: 10 }}
                      >
                        ALTURA
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="primary.main"
                      >
                        {height ? `${height} cm` : "-"}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 0.75,
                        bgcolor: (theme) =>
                          alpha(theme.palette.primary.main, 0.05),
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: 10 }}
                      >
                        IMC
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="primary.main"
                      >
                        {imc}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 0.75,
                        bgcolor: (theme) =>
                          alpha(theme.palette.primary.main, 0.05),
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: 10 }}
                      >
                        % GORDURA
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="primary.main"
                      >
                        {measurement.bodyFat ? `${measurement.bodyFat}%` : "-"}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 0.75,
                        bgcolor: (theme) =>
                          alpha(theme.palette.primary.main, 0.05),
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: 10 }}
                      >
                        MASSA LIVRE
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="primary.main"
                      >
                        {measurement.fatFreeMass
                          ? `${measurement.fatFreeMass} kg`
                          : "-"}
                      </Typography>
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
                    startIcon={<Edit />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditAssessment(measurement.id);
                    }}
                  >
                    Editar
                  </DesignSystemButton>
                  <DesignSystemButton
                    size="small"
                    variant="outlined"
                    startIcon={<Delete />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(measurement.id);
                    }}
                    disabled={deleteMeasurementMutation.isPending}
                  >
                    Excluir
                  </DesignSystemButton>
                </CardActions>
              </Card>
            );
          })}
        </Box>
      ) : (
        <Card
          sx={{
            p: 4,
            mt: 5,
            textAlign: "center",
            borderRadius: "12px",
            borderColor: "divider",
            borderRight: `4px solid ${theme.palette.custom.accent}`,
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhuma avaliação encontrada
          </Typography>
          <Typography color="text.secondary" paragraph>
            Clique no botão "Nova Avaliação" para realizar a primeira avaliação
            antropométrica.
          </Typography>
        </Card>
      )}

      {/* Diálogo de confirmação para exclusão */}
      <Dialog open={deleteDialogOpen} onClose={cancelDelete}>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir esta avaliação? Esta ação não pode
            ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <DesignSystemButton variant="text" onClick={cancelDelete}>
            Cancelar
          </DesignSystemButton>
          <DesignSystemButton
            variant="contained"
            color="error"
            onClick={confirmDelete}
            autoFocus
          >
            Excluir
          </DesignSystemButton>
        </DialogActions>
      </Dialog>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
