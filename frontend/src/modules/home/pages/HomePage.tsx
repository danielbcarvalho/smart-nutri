import React from "react";
import { Box, Typography } from "@mui/material";
import { StatsCards } from "@components/StatsCards";
import { PatientList } from "@components/RecentPatients";
import { Container } from "@components/Layout/Container";
import { authService } from "@modules/auth/services/authService";

const getGreeting = () => {
  const hour = parseInt(
    new Date().toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "numeric",
    })
  );

  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
};

export function Home() {
  const user = authService.getUser();
  const firstName = user?.name?.split(" ")[0] || "";
  const greeting = getGreeting();

  return (
    <Container>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {greeting}, {firstName}. Aqui está um panorama rápido para guiar as
            suas tarefas.
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
