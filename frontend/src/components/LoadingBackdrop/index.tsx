import React from "react";
import { Backdrop, CircularProgress, Box, Typography } from "@mui/material";

export interface LoadingBackdropProps {
  open: boolean;
  message?: string;
}

export function LoadingBackdrop({ open, message }: LoadingBackdropProps) {
  return (
    <Backdrop
      sx={{
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
      open={open}
    >
      <CircularProgress color="inherit" />
      {message && (
        <Box textAlign="center">
          <Typography variant="body1">{message}</Typography>
        </Box>
      )}
    </Backdrop>
  );
}
