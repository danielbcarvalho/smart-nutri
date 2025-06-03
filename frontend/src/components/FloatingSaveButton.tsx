import React, { useEffect, useState } from "react";
import { Fab, Zoom, Tooltip } from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import { createPortal } from "react-dom";

interface FloatingSaveButtonProps {
  onClick: () => void;
}

export const FloatingSaveButton: React.FC<FloatingSaveButtonProps> = ({
  onClick,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <Zoom in={true}>
      <Tooltip title="Salvar plano alimentar" placement="left">
        <Fab
          color="primary"
          size="medium"
          onClick={onClick}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            boxShadow: 4,
            "&:hover": {
              boxShadow: 6,
            },
          }}
        >
          <SaveIcon />
        </Fab>
      </Tooltip>
    </Zoom>,
    document.body
  );
};
