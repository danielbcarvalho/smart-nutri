import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { MealPlan as MealPlanComponent } from "../../components/MealPlan";

export function MealPlan() {
  return (
    <Box sx={{ height: "100%", width: "100%", p: { xs: 1, sm: 3 } }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          borderRadius: 2,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Plano Alimentar
        </Typography>
        <Typography variant="subtitle1">
          Crie e gerencie planos alimentares para seus pacientes.
        </Typography>
      </Paper>

      {/* Conteúdo */}
      <MealPlanComponent />
    </Box>
  );
}
