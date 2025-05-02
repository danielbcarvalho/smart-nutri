import React from "react";
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
  Button,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assessment as AssessmentIcon,
  RestaurantMenu as RestaurantMenuIcon,
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
  onMenuOpen?: (event: React.MouseEvent<HTMLElement>, patient: Patient) => void;
  navigate: NavigateFunction;
  onEditClick: (patient: Patient) => void;
}

// Function to generate initials from name
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Function to generate random color for avatar
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

export const PatientsTable: React.FC<PatientTableProps> = ({
  patients,
  order,
  orderBy,
  onRequestSort,
  onDeleteClick,
  navigate,
  onEditClick,
}) => {
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
                      bgcolor: !patient.photoUrl
                        ? stringToColor(patient.name)
                        : undefined,
                      width: 40,
                      height: 40,
                      cursor: "pointer",
                      "&:hover": {
                        opacity: 0.8,
                      },
                    }}
                    onClick={() => navigate(`/patient/${patient.id}`)}
                  >
                    {!patient.photoUrl && getInitials(patient.name)}
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
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/patient/${patient.id}`)}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onEditClick(patient)}
                    sx={{ color: "primary.main" }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onDeleteClick(patient)}
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
  );
};
