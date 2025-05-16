import React from "react";
import { Box, Typography, IconButton, CircularProgress } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom";
import { EnergyPlanForm } from "../components/EnergyPlanForm";
import { useQuery } from "@tanstack/react-query";
import { energyPlanService } from "../services/energyPlanService";

export const EnergyPlanFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { patientId, planId } = useParams<{
    patientId: string;
    planId: string;
  }>();

  const { data: planToEdit, isLoading } = useQuery({
    queryKey: ["energyPlan", planId],
    queryFn: () => energyPlanService.getById(planId!),
    enabled: !!planId,
  });

  const handleSuccess = () => {
    // Navigate back to the energy plans list
    navigate(`/patient/${patientId}/energy-plans`);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 4,
        }}
      >
        <IconButton
          onClick={() => navigate(`/patient/${patientId}/energy-plans`)}
          sx={{ color: "text.primary" }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight="bold">
          {planId ? "Editar Plano Energético" : "Novo Plano Energético"}
        </Typography>
      </Box>

      {/* Form */}
      <EnergyPlanForm onSuccess={handleSuccess} planToEdit={planToEdit} />
    </Box>
  );
};

export default EnergyPlanFormPage;
