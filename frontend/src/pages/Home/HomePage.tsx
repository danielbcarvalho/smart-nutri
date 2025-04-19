import React from "react";
import { Box, Typography } from "@mui/material";
import { StatsCards } from "../../components/StatsCards";
import { PatientList } from "../../components/RecentPatients";
import { Container } from "../../components/Layout/Container";

export function Home() {
  return (
    <Container>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Bem-vindo ao SmartNutri. Aqui você encontra uma visão geral do seu
            trabalho.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <StatsCards />
        </Box>

        <Box sx={{ width: { xs: "100%", md: "50%" } }}>
          <PatientList />
        </Box>
      </Box>
    </Container>
  );
}
