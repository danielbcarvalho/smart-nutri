import React from "react";
import { Backdrop, CircularProgress } from "@mui/material";

interface LoadingBackdropProps {
  open: boolean;
}

export const LoadingBackdrop: React.FC<LoadingBackdropProps> = ({ open }) => {
  return (
    <Backdrop
      sx={{
        color: "background.paper",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
      open={open}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};
