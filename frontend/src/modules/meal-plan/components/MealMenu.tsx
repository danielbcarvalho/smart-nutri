import React from "react";
import {
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  CircularProgress,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";

interface MealMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onAddFood: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  isLoading?: boolean;
}

const MealMenu: React.FC<MealMenuProps> = ({
  anchorEl,
  open,
  onClose,
  onEdit,
  onAddFood,
  onDuplicate,
  onDelete,
  isLoading = false,
}) => {
  const renderMenuItem = (
    icon: React.ReactNode,
    text: string,
    onClick: () => void,
    isError?: boolean
  ) => (
    <MenuItem
      onClick={() => {
        onClick();
        onClose();
      }}
      disabled={isLoading}
      sx={{
        minHeight: "48px",
        ...(isError && { color: "error.main" }),
      }}
    >
      <ListItemIcon sx={{ minWidth: "40px" }}>
        {isLoading ? <CircularProgress size={24} thickness={4} /> : icon}
      </ListItemIcon>
      <Typography variant="body2">{text}</Typography>
    </MenuItem>
  );

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          minWidth: "200px",
        },
      }}
    >
      {renderMenuItem(<EditIcon fontSize="small" />, "Editar refeição", onEdit)}

      {renderMenuItem(
        <AddIcon fontSize="small" />,
        "Adicionar alimento",
        onAddFood
      )}

      {renderMenuItem(
        <ContentCopyIcon fontSize="small" />,
        "Duplicar refeição",
        onDuplicate
      )}

      <Divider />

      {renderMenuItem(
        <DeleteIcon fontSize="small" />,
        "Excluir refeição",
        onDelete,
        true
      )}
    </Menu>
  );
};

export default MealMenu;
