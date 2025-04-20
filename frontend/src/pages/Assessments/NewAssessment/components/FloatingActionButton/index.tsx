import React from "react";
import { Box, Button } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";

interface FloatingActionButtonProps {
  onSave: () => void;
  isSaving: boolean;
  isEditMode: boolean;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onSave,
  isSaving,
  isEditMode,
}) => {
  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 1000,
      }}
    >
      <Button
        variant="contained"
        color="primary"
        startIcon={<SaveIcon />}
        onClick={onSave}
        disabled={isSaving}
        sx={{
          borderRadius: 28,
          px: 3,
          py: 1.5,
          boxShadow: 3,
        }}
      >
        {isEditMode ? "Atualizar Avaliação" : "Salvar Avaliação"}
      </Button>
    </Box>
  );
};
