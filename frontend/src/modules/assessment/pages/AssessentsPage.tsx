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
  useMediaQuery,
  Menu,
  MenuItem,
} from "@mui/material";
import { Add, Edit, Delete, Timeline, MoreVert } from "@mui/icons-material";
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuRowId, setMenuRowId] = useState<string | null>(null);

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

  // Menu de ações mobile
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    rowId: string
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuRowId(rowId);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRowId(null);
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
            borderRadius: "12px",
            borderColor: "divider",
            transition: "all 0.2s",
            "&:hover": {
              boxShadow: 4,
              borderColor: "primary.main",
            },
          }}
        >
          <TableContainer
            component={Paper}
            sx={{ minWidth: isMobile ? 600 : undefined }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      color: theme.palette.primary.main,
                    }}
                  >
                    Data
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      color: theme.palette.primary.main,
                    }}
                  >
                    Peso (kg)
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      color: theme.palette.primary.main,
                    }}
                  >
                    Altura (cm)
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      color: theme.palette.primary.main,
                    }}
                  >
                    IMC
                  </TableCell>
                  {!isMobile && (
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        color: theme.palette.primary.main,
                      }}
                    >
                      % Gordura
                    </TableCell>
                  )}
                  {!isMobile && (
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        color: theme.palette.primary.main,
                      }}
                    >
                      Massa Livre de Gordura (kg)
                    </TableCell>
                  )}
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      color: theme.palette.primary.main,
                    }}
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
                    imc = (weight / (heightInMeters * heightInMeters)).toFixed(
                      1
                    );
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
                      {!isMobile && (
                        <TableCell>
                          {measurement.bodyFat
                            ? `${measurement.bodyFat}%`
                            : "-"}
                        </TableCell>
                      )}
                      {!isMobile && (
                        <TableCell>
                          {measurement.fatFreeMass
                            ? `${measurement.fatFreeMass} kg`
                            : "-"}
                        </TableCell>
                      )}
                      <TableCell>
                        {isMobile ? (
                          <>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMenuOpen(e, measurement.id);
                              }}
                            >
                              <MoreVert />
                            </IconButton>
                            <Menu
                              anchorEl={anchorEl}
                              open={menuRowId === measurement.id}
                              onClose={handleMenuClose}
                              anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "right",
                              }}
                              transformOrigin={{
                                vertical: "top",
                                horizontal: "right",
                              }}
                            >
                              <MenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditAssessment(measurement.id);
                                  handleMenuClose();
                                }}
                              >
                                <Edit fontSize="small" sx={{ mr: 1 }} /> Editar
                              </MenuItem>
                              <MenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(measurement.id);
                                  handleMenuClose();
                                }}
                              >
                                <Delete
                                  fontSize="small"
                                  sx={{ mr: 1 }}
                                  color="error"
                                />{" "}
                                Excluir
                              </MenuItem>
                            </Menu>
                          </>
                        ) : (
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
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ) : (
        <Paper sx={{ p: 4, marginTop: 5, textAlign: "center" }}>
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
