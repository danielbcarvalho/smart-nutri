import React from "react";
import { Box, Button, useTheme, useMediaQuery } from "@mui/material";
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        justifyContent: "flex-end",
        mt: 4,
        gap: 2,
        flexWrap: "wrap",
        width: "100%",
      }}
    >
      <Button
        variant="outlined"
        startIcon={<CancelIcon />}
        onClick={onCancel}
        fullWidth={isMobile}
        size={isMobile ? "large" : "medium"}
      >
        Cancelar
      </Button>
      <Button
        variant="contained"
        color="primary"
        startIcon={<SaveIcon />}
        onClick={onSave}
        disabled={isSaving}
        fullWidth={isMobile}
        size={isMobile ? "large" : "medium"}
      >
        {isSaving ? "Salvando..." : "Salvar Avaliação"}
      </Button>
    </Box>
  );
};
