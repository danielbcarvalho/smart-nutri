import React from "react";
import { Box, Button } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

interface ActionButtonsProps {
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onSave,
  onCancel,
  isSaving,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        mt: 4,
        gap: 2,
        flexWrap: "wrap",
      }}
    >
      <Button variant="outlined" startIcon={<CancelIcon />} onClick={onCancel}>
        Cancelar
      </Button>
      <Button
        variant="contained"
        color="primary"
        startIcon={<SaveIcon />}
        onClick={onSave}
        disabled={isSaving}
      >
        {isSaving ? "Salvando..." : "Salvar"}
      </Button>
    </Box>
  );
};
