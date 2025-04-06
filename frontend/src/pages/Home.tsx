import React from "react";
import { Box, Container, Typography } from "@mui/material";
import { StatsCards } from "../components/StatsCards";
import { RecentPatients } from "../components/RecentPatients";

export function Home() {
  return (
    <Container maxWidth="lg">
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
        <RecentPatients />
      </Box>
    </Container>
  );
}
