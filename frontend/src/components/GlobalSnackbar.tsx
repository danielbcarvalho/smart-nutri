import React, { useEffect, useState } from "react";
import { Snackbar, Alert } from "@mui/material";
import { createPortal } from "react-dom";

interface GlobalSnackbarProps {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
  onClose: () => void;
}

export const GlobalSnackbar: React.FC<GlobalSnackbarProps> = ({
  open,
  message,
  severity,
  onClose,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      sx={{
        position: "fixed",
        top: "24px !important",
        left: "50% !important",
        transform: "translateX(-50%) !important",
        zIndex: 9999,
        "& .MuiAlert-root": {
          minWidth: "300px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
        },
      }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        sx={{
          width: "100%",
          "& .MuiAlert-message": {
            fontWeight: 500,
          },
        }}
      >
        {message}
      </Alert>
    </Snackbar>,
    document.body
  );
};
