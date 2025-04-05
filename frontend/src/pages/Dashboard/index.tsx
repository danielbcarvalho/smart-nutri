import React from "react";
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  Skeleton,
} from "@mui/material";
import {
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  Construction as ConstructionIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { patientService } from "../../services/patientService";

const StatCard = ({
  title,
  value,
  icon,
  color,
  isLoading = false,
  comingSoon = false,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  isLoading?: boolean;
  comingSoon?: boolean;
}) => (
  <Card sx={{ height: "100%" }}>
    <CardContent>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Box
          sx={{
            backgroundColor: `${color}15`,
            borderRadius: "50%",
            p: 1,
            mr: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      {isLoading ? (
        <Skeleton variant="text" width="60%" height={40} />
      ) : comingSoon ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ConstructionIcon sx={{ color: "text.secondary" }} />
          <Typography variant="body1" color="text.secondary">
            Em breve
          </Typography>
        </Box>
      ) : (
        <Typography variant="h4" component="div" sx={{ color }}>
          {value}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export const Dashboard = () => {
  // Buscar dados dos pacientes
  const { data: patients, isLoading: isLoadingPatients } = useQuery({
    queryKey: ["patients"],
    queryFn: patientService.getAll,
  });

  // Calcular estatísticas
  const totalPatients = patients?.length || 0;
  const totalMeasurements = 0; // Será implementado quando tivermos a API
  const successRate = 0; // Será implementado quando tivermos a métrica
  const upcomingAppointments = 0; // Será implementado quando tivermos o agendamento

  const stats = [
    {
      title: "Total de Pacientes",
      value: totalPatients,
      icon: <PeopleIcon sx={{ color: "#2196f3" }} />,
      color: "#2196f3",
      isLoading: isLoadingPatients,
    },
    {
      title: "Avaliações Realizadas",
      value: totalMeasurements,
      icon: <AssessmentIcon sx={{ color: "#4caf50" }} />,
      color: "#4caf50",
      comingSoon: true,
    },
    {
      title: "Taxa de Sucesso",
      value: `${successRate}%`,
      icon: <TrendingUpIcon sx={{ color: "#ff9800" }} />,
      color: "#ff9800",
      comingSoon: true,
    },
    {
      title: "Próximas Consultas",
      value: upcomingAppointments,
      icon: <CalendarIcon sx={{ color: "#f44336" }} />,
      color: "#f44336",
      comingSoon: true,
    },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid key={stat.title} xs={12} sm={6} md={3}>
            <StatCard {...stat} />
          </Grid>
        ))}

        <Grid xs={12} md={8}>
          <Paper sx={{ p: 3, height: "400px" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Typography variant="h6">Evolução dos Pacientes</Typography>
              <ConstructionIcon sx={{ color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                Em breve
              </Typography>
            </Box>
            <Box
              sx={{
                height: "calc(100% - 40px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="body1" color="text.secondary" align="center">
                Em breve você poderá visualizar gráficos e estatísticas sobre a
                evolução dos seus pacientes.
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid xs={12} md={4}>
          <Paper sx={{ p: 3, height: "400px" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Typography variant="h6">Próximas Consultas</Typography>
              <ConstructionIcon sx={{ color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                Em breve
              </Typography>
            </Box>
            <Box
              sx={{
                height: "calc(100% - 40px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="body1" color="text.secondary" align="center">
                Em breve você poderá gerenciar suas consultas e ver os próximos
                agendamentos.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
