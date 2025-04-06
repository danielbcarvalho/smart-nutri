import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Avatar,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Assessment as AssessmentIcon,
  RestaurantMenu as RestaurantMenuIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientService, Patient } from "../../services/patientService";

// Tipos para o status do paciente
type PatientStatus = "active" | "inactive" | "pending";
type PatientPlan = "enterprise" | "team" | "company";

// Função para gerar as iniciais do nome
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Função para gerar cor aleatória para o Avatar
const stringToColor = (string: string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    "#2196F3", // Azul
    "#4CAF50", // Verde
    "#FFC107", // Amarelo
    "#9C27B0", // Roxo
    "#F44336", // Vermelho
    "#009688", // Teal
  ];
  return colors[Math.abs(hash) % colors.length];
};

type Order = "asc" | "desc";
type OrderBy = "name" | "email" | "updatedAt";

export function Patients() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] = useState<OrderBy>("updatedAt");
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  const { data: patients } = useQuery({
    queryKey: ["patients"],
    queryFn: patientService.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => patientService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      handleDeleteDialogClose();
    },
  });

  const handleDeleteClick = (patient: Patient) => {
    setPatientToDelete(patient);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (patientToDelete) {
      deleteMutation.mutate(patientToDelete.id);
    }
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setPatientToDelete(null);
  };

  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortPatients = (patients: Patient[]) => {
    return [...patients].sort((a, b) => {
      if (orderBy === "updatedAt") {
        return order === "asc"
          ? new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }

      const aValue = a[orderBy]?.toLowerCase() || "";
      const bValue = b[orderBy]?.toLowerCase() || "";

      return order === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
  };

  const filteredPatients =
    patients?.filter((patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const sortedPatients = sortPatients(filteredPatients);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedPatients(sortedPatients.map((p) => p.id));
    } else {
      setSelectedPatients([]);
    }
  };

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatients((prev) =>
      prev.includes(patientId)
        ? prev.filter((id) => id !== patientId)
        : [...prev, patientId]
    );
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    patient: Patient
  ) => {
    setSelectedPatient(patient);
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setSelectedPatient(null);
    setMenuAnchorEl(null);
  };

  // Função temporária para simular status e plano
  const getRandomStatus = (): PatientStatus => {
    const statuses: PatientStatus[] = ["active", "inactive", "pending"];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  const getRandomPlan = (): PatientPlan => {
    const plans: PatientPlan[] = ["enterprise", "team", "company"];
    return plans[Math.floor(Math.random() * plans.length)];
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", gap: 2, flex: 1 }}>
          <TextField
            placeholder="Buscar paciente..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 250 }}
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => navigate("/patients/new")}
          sx={{ bgcolor: "primary.main" }}
        >
          Novo Paciente
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="35%">
                <TableSortLabel
                  active={orderBy === "name"}
                  direction={orderBy === "name" ? order : "asc"}
                  onClick={() => handleRequestSort("name")}
                  sx={{ fontWeight: "bold" }}
                >
                  PACIENTE
                </TableSortLabel>
              </TableCell>
              <TableCell width="20%">
                <TableSortLabel
                  active={orderBy === "updatedAt"}
                  direction={orderBy === "updatedAt" ? order : "asc"}
                  onClick={() => handleRequestSort("updatedAt")}
                  sx={{ fontWeight: "bold" }}
                >
                  ÚLTIMA ATUALIZAÇÃO
                </TableSortLabel>
              </TableCell>
              <TableCell width="25%">
                <TableSortLabel
                  active={orderBy === "email"}
                  direction={orderBy === "email" ? order : "asc"}
                  onClick={() => handleRequestSort("email")}
                  sx={{ fontWeight: "bold" }}
                >
                  EMAIL
                </TableSortLabel>
              </TableCell>
              <TableCell width="10%">TAG</TableCell>
              <TableCell width="10%" align="right">
                AÇÕES
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedPatients.map((patient) => (
              <TableRow key={patient.id} hover>
                <TableCell>
                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: stringToColor(patient.name),
                        width: 40,
                        height: 40,
                        cursor: "pointer",
                        "&:hover": {
                          opacity: 0.8,
                        },
                      }}
                      onClick={() => navigate(`/patient/${patient.id}`)}
                    >
                      {getInitials(patient.name)}
                    </Avatar>
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          cursor: "pointer",
                          "&:hover": {
                            color: "primary.main",
                          },
                        }}
                        onClick={() => navigate(`/patient/${patient.id}`)}
                      >
                        {patient.name}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<AssessmentIcon />}
                          sx={{
                            fontSize: "0.75rem",
                            py: 0.5,
                            borderColor: "success.main",
                            color: "success.main",
                            "&:hover": {
                              borderColor: "success.dark",
                              bgcolor: "success.lighter",
                            },
                          }}
                          onClick={() =>
                            navigate(`/patient/${patient.id}/assessments/new`)
                          }
                        >
                          Nova Avaliação
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            navigate(
                              `/patient/${patient.id}/meal-plans?new=true`
                            )
                          }
                          startIcon={<RestaurantMenuIcon />}
                          sx={{
                            borderRadius: 20,
                            textTransform: "none",
                            borderColor: "info.main",
                            color: "info.main",
                            "&:hover": {
                              borderColor: "info.dark",
                              bgcolor: "info.lighter",
                            },
                          }}
                        >
                          Novo Plano
                        </Button>
                      </Stack>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(patient.updatedAt).toLocaleDateString("pt-BR")}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    {new Date(patient.updatedAt).toLocaleTimeString("pt-BR")}
                  </Typography>
                </TableCell>
                <TableCell>{patient.email || "-"}</TableCell>
                <TableCell>
                  <Chip
                    label={
                      patient.gender === "M"
                        ? "Masculino"
                        : patient.gender === "F"
                        ? "Feminino"
                        : "Outro"
                    }
                    size="small"
                    sx={{
                      bgcolor: "primary.lighter",
                      color: "primary.dark",
                      fontWeight: 500,
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/patient/${patient.id}`)}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/patient/${patient.id}/edit`)}
                      sx={{ color: "primary.main" }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(patient)}
                      sx={{ color: "error.main" }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Menu de Ações */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            if (selectedPatient) {
              navigate(`/patient/${selectedPatient.id}/edit`);
            }
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Edit</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedPatient) {
              navigate(`/patient/${selectedPatient.id}`);
            }
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">View Details</Typography>
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <Typography variant="body2">Delete</Typography>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Tem certeza que deseja excluir o paciente{" "}
            <strong>{patientToDelete?.name}</strong>? Esta ação não pode ser
            desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancelar</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            autoFocus
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
