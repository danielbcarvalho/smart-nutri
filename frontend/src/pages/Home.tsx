import React from "react";
import { Box, Container, Typography } from "@mui/material";
import { StatsCards } from "../components/StatsCards";

export function Home() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Bem-vindo, Nutricionista! Aqui você encontra uma visão geral do seu
          trabalho.
        </Typography>
      </Box>

      <StatsCards />
    </Container>
  );
}
