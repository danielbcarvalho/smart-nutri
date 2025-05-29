import React from "react";
import { Menu, MenuItem, Divider, ListItemIcon } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";

import DeleteIcon from "@mui/icons-material/Delete";

interface MealMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onAddFood: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const MealMenu: React.FC<MealMenuProps> = ({
  anchorEl,
  open,
  onClose,
  onEdit,
  onAddFood,
  onDuplicate,
  onDelete,
}) => (
  <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
    <MenuItem
      onClick={() => {
        onEdit();
        onClose();
      }}
    >
      <ListItemIcon>
        <EditIcon fontSize="small" />
      </ListItemIcon>
      Editar refeição
    </MenuItem>
    <MenuItem
      onClick={() => {
        onAddFood();
        onClose();
      }}
    >
      <ListItemIcon>
        <AddIcon fontSize="small" />
      </ListItemIcon>
      Adicionar alimento
    </MenuItem>

    <Divider />
    <MenuItem
      onClick={() => {
        onDelete();
        onClose();
      }}
      sx={{ color: "error.main" }}
    >
      <ListItemIcon>
        <DeleteIcon fontSize="small" />
      </ListItemIcon>
      Excluir refeição
    </MenuItem>
  </Menu>
);

export default MealMenu;
