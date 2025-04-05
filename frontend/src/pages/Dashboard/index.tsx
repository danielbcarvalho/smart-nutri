import React from "react";
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  Skeleton,
  useTheme,
} from "@mui/material";
import {
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  Construction as ConstructionIcon,
  Dashboard as DashboardIcon,
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
}) => {
  const theme = useTheme();

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ height: "100%", p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Box
            sx={{
              backgroundColor: `${color}15`,
              borderRadius: "12px",
              p: 1.5,
              mr: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" component="div" color="text.primary">
            {title}
          </Typography>
        </Box>
        {isLoading ? (
          <Skeleton variant="text" width="60%" height={48} />
        ) : comingSoon ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ConstructionIcon sx={{ color: theme.palette.text.secondary }} />
            <Typography variant="body1" color="text.secondary">
              Em breve
            </Typography>
          </Box>
        ) : (
          <Typography
            variant="h3"
            component="div"
            sx={{ color, fontWeight: "bold" }}
          >
            {value}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export const Dashboard = () => {
  const theme = useTheme();

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
      icon: <PeopleIcon sx={{ color: theme.palette.primary.main }} />,
      color: theme.palette.primary.main,
      isLoading: isLoadingPatients,
    },
    {
      title: "Avaliações Realizadas",
      value: totalMeasurements,
      icon: <AssessmentIcon sx={{ color: theme.palette.primary.light }} />,
      color: theme.palette.primary.light,
      comingSoon: true,
    },
    {
      title: "Taxa de Sucesso",
      value: `${successRate}%`,
      icon: <TrendingUpIcon sx={{ color: theme.palette.primary.dark }} />,
      color: theme.palette.primary.dark,
      comingSoon: true,
    },
    {
      title: "Próximas Consultas",
      value: upcomingAppointments,
      icon: <CalendarIcon sx={{ color: theme.palette.secondary.main }} />,
      color: theme.palette.secondary.main,
      comingSoon: true,
    },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header com gradiente */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          borderRadius: 4,
          mb: 4,
          p: 4,
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Círculos decorativos */}
        <Box
          sx={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -40,
            right: 60,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.05)",
          }}
        />

        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <DashboardIcon sx={{ fontSize: 32 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
              Dashboard
            </Typography>
          </Box>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            Bem-vindo ao seu painel de controle. Gerencie seus pacientes e
            acompanhe suas evoluções.
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <StatCard {...stat} />
          </Grid>
        ))}

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: "400px" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <Typography variant="h6" color="text.primary">
                Evolução dos Pacientes
              </Typography>
              <ConstructionIcon sx={{ color: theme.palette.text.secondary }} />
              <Typography variant="body2" color="text.secondary">
                Em breve
              </Typography>
            </Box>
            <Box
              sx={{
                height: "calc(100% - 48px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 3,
                backgroundColor: "rgba(0, 135, 95, 0.04)",
                borderRadius: 2,
              }}
            >
              <Typography variant="body1" color="text.secondary" align="center">
                Em breve você poderá visualizar gráficos e estatísticas sobre a
                evolução dos seus pacientes.
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: "400px" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <Typography variant="h6" color="text.primary">
                Próximas Consultas
              </Typography>
              <ConstructionIcon sx={{ color: theme.palette.text.secondary }} />
              <Typography variant="body2" color="text.secondary">
                Em breve
              </Typography>
            </Box>
            <Box
              sx={{
                height: "calc(100% - 48px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 3,
                backgroundColor: "rgba(0, 135, 95, 0.04)",
                borderRadius: 2,
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
