import React from "react";
import { Menu, MenuItem, ListItemIcon, Typography } from "@mui/material";
import {
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { NavigateFunction } from "react-router-dom";
import { Patient } from "../../../services/patientService";

interface PatientActionsMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  patient: Patient | null;
  navigate: NavigateFunction;
}

export const PatientActionsMenu: React.FC<PatientActionsMenuProps> = ({
  anchorEl,
  open,
  onClose,
  patient,
  navigate,
}) => {
  if (!patient) return null;

  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
      <MenuItem
        onClick={() => {
          navigate(`/patient/${patient.id}/edit`);
          onClose();
        }}
      >
        <ListItemIcon>
          <EditIcon fontSize="small" />
        </ListItemIcon>
        <Typography variant="body2">Editar</Typography>
      </MenuItem>
      <MenuItem
        onClick={() => {
          navigate(`/patient/${patient.id}`);
          onClose();
        }}
      >
        <ListItemIcon>
          <VisibilityIcon fontSize="small" />
        </ListItemIcon>
        <Typography variant="body2">Ver Detalhes</Typography>
      </MenuItem>
      <MenuItem onClick={onClose} sx={{ color: "error.main" }}>
        <ListItemIcon>
          <DeleteIcon fontSize="small" color="error" />
        </ListItemIcon>
        <Typography variant="body2">Excluir</Typography>
      </MenuItem>
    </Menu>
  );
};
