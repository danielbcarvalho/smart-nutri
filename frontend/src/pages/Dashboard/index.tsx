import React from "react";
import { Grid, Paper, Typography, Card, CardContent, Box } from "@mui/material";
import {
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";

const StatCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
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
      <Typography variant="h4" component="div" sx={{ color }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

export const Dashboard = () => {
  const stats = [
    {
      title: "Total de Pacientes",
      value: 150,
      icon: <PeopleIcon sx={{ color: "#2196f3" }} />,
      color: "#2196f3",
    },
    {
      title: "Avaliações Realizadas",
      value: 320,
      icon: <AssessmentIcon sx={{ color: "#4caf50" }} />,
      color: "#4caf50",
    },
    {
      title: "Taxa de Sucesso",
      value: "85%",
      icon: <TrendingUpIcon sx={{ color: "#ff9800" }} />,
      color: "#ff9800",
    },
    {
      title: "Próximas Consultas",
      value: 12,
      icon: <CalendarIcon sx={{ color: "#f44336" }} />,
      color: "#f44336",
    },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <StatCard {...stat} />
          </Grid>
        ))}

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: "400px" }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Evolução dos Pacientes
            </Typography>
            {/* Aqui você pode adicionar um gráfico usando @mui/x-charts */}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: "400px" }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Próximas Consultas
            </Typography>
            {/* Aqui você pode adicionar uma lista de próximas consultas */}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
