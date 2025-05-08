import React from "react";
import { Menu, MenuItem, Divider, ListItemIcon } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SaveIcon from "@mui/icons-material/Save";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import DeleteIcon from "@mui/icons-material/Delete";

interface MealMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onAddFood: () => void;
  onDuplicate: () => void;
  onSaveAsTemplate: () => void;
  onDelete: () => void;
  hasTemplates: boolean;
  onApplyTemplate?: () => void;
}

const MealMenu: React.FC<MealMenuProps> = ({
  anchorEl,
  open,
  onClose,
  onEdit,
  onAddFood,
  onDuplicate,
  onSaveAsTemplate,
  onDelete,
  hasTemplates,
  onApplyTemplate,
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

    {hasTemplates && (
      <MenuItem
        onClick={(e) => {
          e.stopPropagation();
          if (onApplyTemplate) onApplyTemplate();
          onClose();
        }}
      >
        <ListItemIcon>
          <NoteAddIcon fontSize="small" />
        </ListItemIcon>
        Aplicar template
      </MenuItem>
    )}
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
