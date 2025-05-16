import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  // DialogActions, // Not used directly here if form has its own submit
  // Button, // Not used directly here
  IconButton, // For close button
  Box,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close"; // For close button
import { EnergyPlanForm } from "./EnergyPlanForm"; // Assuming same directory
import { EnergyPlanResponseDto } from "../services/energyPlanService"; // Adjust path if needed

interface EnergyPlanFormModalProps {
  open: boolean;
  onClose: () => void;
  planToEdit?: EnergyPlanResponseDto | null;
  // children prop is not used by this component's logic, can be removed if not intended for other purposes
}

export const EnergyPlanFormModal: React.FC<EnergyPlanFormModalProps> = ({
  open,
  onClose,
  planToEdit,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md" // Changed from "sm" to "md" for wider modal
      fullWidth
      PaperProps={{
        sx: {
          height: "calc(100% - 64px)", // Example: make modal take more height on larger screens
          maxHeight: "90vh", // Ensure it doesn't exceed viewport height too much
        },
      }}
    >
      <DialogTitle
        sx={{
          py: 1.5,
          px: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" component="div">
          {planToEdit ? "Editar Plano Energético" : "Novo Plano Energético"}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        dividers // Adds a top divider
        sx={
          {
            // DialogContent has default padding, which is usually 24px horizontally.
            // This will provide the outer padding for the EnergyPlanForm.
            // We removed p:2 from EnergyPlanForm's root Box.
            // p: { xs: 1, sm: 2, md: 3 } // Example of responsive padding
            // For simplicity, let's use default DialogContent padding or a fixed one.
            // py: 2, px: {xs: 2, sm: 3} // Custom padding
            // Default padding is fine, let's ensure form content flows well
          }
        }
      >
        {/* EnergyPlanForm will be rendered here */}
        {/* The form itself has Cards with their own CardContent padding */}
        <EnergyPlanForm onSuccess={onClose} planToEdit={planToEdit} />
      </DialogContent>
      {/* 
        DialogActions can be added here if you want actions outside the form,
        but the form already has its own submit button.
      */}
      {/* <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
      </DialogActions> */}
    </Dialog>
  );
};
