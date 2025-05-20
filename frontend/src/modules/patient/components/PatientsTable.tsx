import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  Box,
  Avatar,
  Chip,
  Stack,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { Patient } from "@/modules/patient/services/patientService";
import { NavigateFunction } from "react-router-dom";
import { MealPlanButton } from "@/modules/meal-plan/components/MealPlanButton";
import { AssessmentButton } from "@components/AssessmentButton";

type Order = "asc" | "desc";
type OrderBy = "name" | "email" | "updatedAt";

interface PatientTableProps {
  patients: Patient[];
  order: Order;
  orderBy: OrderBy;
  onRequestSort: (property: OrderBy) => void;
  onDeleteClick: (patient: Patient) => void;
  navigate: NavigateFunction;
  onEditClick: (patient: Patient) => void;
}

export const PatientsTable: React.FC<PatientTableProps> = ({
  patients,
  order,
  orderBy,
  onRequestSort,
  onDeleteClick,
  navigate,
  onEditClick,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    patient: Patient
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedPatient(patient);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPatient(null);
  };

  const handleView = () => {
    if (selectedPatient) {
      navigate(`/patient/${selectedPatient.id}`);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedPatient) {
      onEditClick(selectedPatient);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedPatient) {
      onDeleteClick(selectedPatient);
    }
    handleMenuClose();
  };

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell width="35%">
              <TableSortLabel
                active={orderBy === "name"}
                direction={orderBy === "name" ? order : "asc"}
                onClick={() => onRequestSort("name")}
                sx={{ fontWeight: "bold" }}
              >
                PACIENTE
              </TableSortLabel>
            </TableCell>
            <TableCell width="20%">
              <TableSortLabel
                active={orderBy === "updatedAt"}
                direction={orderBy === "updatedAt" ? order : "asc"}
                onClick={() => onRequestSort("updatedAt")}
                sx={{ fontWeight: "bold" }}
              >
                ÚLTIMA ATUALIZAÇÃO
              </TableSortLabel>
            </TableCell>
            <TableCell width="25%">
              <TableSortLabel
                active={orderBy === "email"}
                direction={orderBy === "email" ? order : "asc"}
                onClick={() => onRequestSort("email")}
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
          {patients.map((patient) => (
            <TableRow key={patient.id} hover>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                  <Avatar
                    src={
                      patient.photoUrl
                        ? `${patient.photoUrl}?t=${
                            patient.updatedAt
                              ? new Date(patient.updatedAt).getTime()
                              : Date.now()
                          }`
                        : undefined
                    }
                    sx={{
                      bgcolor: !patient.photoUrl ? "grey.200" : undefined,
                      color: !patient.photoUrl ? "grey.500" : undefined,
                      width: 40,
                      height: 40,
                      cursor: "pointer",
                      "&:hover": {
                        opacity: 0.8,
                      },
                    }}
                    onClick={() => navigate(`/patient/${patient.id}`)}
                  >
                    {!patient.photoUrl && patient.name.charAt(0)}
                  </Avatar>
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: "bold",
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
                      <AssessmentButton
                        patientId={patient.id}
                        variant="contained"
                      />
                      <MealPlanButton
                        patientId={patient.id}
                        variant="contained"
                        color="secondary"
                      />
                    </Stack>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {new Date(patient.updatedAt).toLocaleDateString("pt-BR")}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
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
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, patient)}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 1,
          sx: {
            borderRadius: 1,
            minWidth: 150,
          },
        }}
      >
        <MenuItem onClick={handleView}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          Ver
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Excluir
        </MenuItem>
      </Menu>
    </TableContainer>
  );
};
