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
    <Card
      sx={{
        height: "100%",
        bgcolor: "background.paper",
        "&:hover": {
          bgcolor: "custom.lightest",
        },
      }}
    >
      <CardContent sx={{ height: "100%", p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Box
            sx={{
              backgroundColor: "custom.lightest",
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
            <ConstructionIcon sx={{ color: "text.secondary" }} />
            <Typography variant="body1" color="text.secondary">
              Em breve
            </Typography>
          </Box>
        ) : (
          <Typography
            variant="h3"
            component="div"
            sx={{ color: "custom.main", fontWeight: "bold" }}
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
  const totalMeasurements = 0;
  const successRate = 0;
  const upcomingAppointments = 0;

  const stats = [
    {
      title: "Total de Pacientes",
      value: totalPatients,
      icon: <PeopleIcon sx={{ color: "custom.main" }} />,
      color: "custom.main",
      isLoading: isLoadingPatients,
    },
    {
      title: "Avaliações Realizadas",
      value: totalMeasurements,
      icon: <AssessmentIcon sx={{ color: "custom.light" }} />,
      color: "custom.light",
      comingSoon: true,
    },
    {
      title: "Taxa de Sucesso",
      value: `${successRate}%`,
      icon: <TrendingUpIcon sx={{ color: "custom.dark" }} />,
      color: "custom.dark",
      comingSoon: true,
    },
    {
      title: "Próximas Consultas",
      value: upcomingAppointments,
      icon: <CalendarIcon sx={{ color: "custom.main" }} />,
      color: "custom.main",
      comingSoon: true,
    },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header com gradiente */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.custom.main} 0%, ${theme.palette.custom.dark} 100%)`,
          borderRadius: 4,
          mb: 4,
          p: 4,
          color: "common.white",
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
          <Paper
            sx={{
              p: 3,
              height: "400px",
              bgcolor: "background.paper",
              "&:hover": {
                bgcolor: "custom.lightest",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <Typography variant="h6" color="text.primary">
                Evolução dos Pacientes
              </Typography>
              <ConstructionIcon sx={{ color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                Em breve
              </Typography>
            </Box>
            <Box
              sx={{
                height: "calc(100% - 60px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "text.secondary",
              }}
            >
              <Typography variant="body1">
                O gráfico de evolução estará disponível em breve
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              height: "400px",
              bgcolor: "background.paper",
              "&:hover": {
                bgcolor: "custom.lightest",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <Typography variant="h6" color="text.primary">
                Próximas Consultas
              </Typography>
              <ConstructionIcon sx={{ color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                Em breve
              </Typography>
            </Box>
            <Box
              sx={{
                height: "calc(100% - 60px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "text.secondary",
              }}
            >
              <Typography variant="body1">
                A agenda de consultas estará disponível em breve
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
