import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Stack,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  useTheme,
  Alert,
} from "@mui/material";
import { Add, Edit, Delete, Timeline } from "@mui/icons-material";
import { patientService } from "../../services/patientService";
import { format } from "date-fns";
import { LoadingBackdrop } from "../../components/LoadingBackdrop";
import { useState } from "react";

export function Assessments() {
  const theme = useTheme();
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
  });

  // Mutation para excluir uma avaliação
  const deleteMeasurementMutation = useMutation({
    mutationFn: (measurementId: string) => {
      return patientService.deleteMeasurement(patientId!, measurementId);
    },
    onSuccess: () => {
      // Invalidar queries para atualizar os dados
      queryClient.invalidateQueries({ queryKey: ["measurements", patientId] });
      queryClient.invalidateQueries({ queryKey: ["patient", patientId] });

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
    // Navegar para a página de edição de avaliação
    navigate(`/patient/${patientId}/assessments/edit/${measurementId}`);
  };

  const handleDeleteClick = (measurementId: string) => {
    // Abrir diálogo de confirmação
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
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return <LoadingBackdrop open={isLoading} />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5">Avaliações Antropométricas</Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<Timeline />}
            onClick={() =>
              navigate(`/patient/${patientId}/assessments/evolution`)
            }
          >
            Evolução
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleNewAssessment}
          >
            Nova Avaliação
          </Button>
        </Stack>
      </Box>

      {measurements && measurements.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
                >
                  Data
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
                >
                  Peso (kg)
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
                >
                  Altura (cm)
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
                >
                  IMC
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
                >
                  % Gordura
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
                >
                  Massa Magra (kg)
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
                >
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {measurements.map((measurement) => {
                // Calcula o IMC se tiver altura e peso
                const height = Number(measurement.height);
                const weight = Number(measurement.weight);
                let imc = "-";
                if (height && weight) {
                  // Altura em metros para o cálculo
                  const heightInMeters = height / 100;
                  imc = (weight / (heightInMeters * heightInMeters)).toFixed(1);
                }

                return (
                  <TableRow
                    key={measurement.id}
                    hover
                    sx={{
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: `${theme.palette.primary.main}08`,
                      },
                    }}
                    onClick={() => handleEditAssessment(measurement.id)}
                  >
                    <TableCell>
                      {formatDate(measurement.date as string)}
                    </TableCell>
                    <TableCell>{weight} kg</TableCell>
                    <TableCell>{height ? `${height} cm` : "-"}</TableCell>
                    <TableCell>{imc}</TableCell>
                    <TableCell>
                      {measurement.bodyFat ? `${measurement.bodyFat}%` : "-"}
                    </TableCell>
                    <TableCell>
                      {measurement.muscleMass
                        ? `${measurement.muscleMass} kg`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAssessment(measurement.id);
                          }}
                          title="Editar"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(measurement.id);
                          }}
                          title="Excluir"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 6, marginTop: 5, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhuma avaliação encontrada
          </Typography>
          <Typography color="text.secondary" paragraph>
            Clique no botão "Nova Avaliação" para realizar a primeira avaliação
            antropométrica.
          </Typography>
        </Paper>
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
          <Button onClick={cancelDelete}>Cancelar</Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            autoFocus
          >
            Excluir
          </Button>
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
