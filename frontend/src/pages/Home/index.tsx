import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Button,
} from "@mui/material";
import {
  Person as PersonIcon,
  Restaurant as RestaurantIcon,
  Assessment as AssessmentIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { patientService } from "../../services/patientService";

const features = [
  {
    title: "Pacientes",
    description: "Gerencie seus pacientes e acompanhe seu progresso",
    icon: <PersonIcon sx={{ fontSize: 40 }} />,
    path: "/patients",
    color: "custom.main",
  },
  {
    title: "Planos Alimentares",
    description: "Crie e gerencie planos alimentares personalizados",
    icon: <RestaurantIcon sx={{ fontSize: 40 }} />,
    path: "/patients",
    color: "custom.light",
  },
  {
    title: "Avaliações",
    description: "Realize avaliações e acompanhe a evolução",
    icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
    path: "/patients",
    color: "custom.main",
  },
  {
    title: "Documentos",
    description: "Organize documentos e relatórios",
    icon: <DescriptionIcon sx={{ fontSize: 40 }} />,
    path: "/patients",
    color: "custom.light",
  },
];

export function Home() {
  const navigate = useNavigate();
  const { data: patients } = useQuery({
    queryKey: ["patients"],
    queryFn: patientService.getAll,
  });

  const activePatients = patients?.filter((p) => p.status === "active") || [];

  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom color="text.primary">
          Bem-vindo ao SmartNutri
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gerencie seus pacientes e planos alimentares de forma inteligente e
          eficiente
        </Typography>
      </Box>

      {/* Stats */}
      <Card
        sx={{
          mb: 4,
          bgcolor: "custom.main",
          color: "common.white",
          "&:hover": {
            bgcolor: "custom.dark",
            cursor: "pointer",
          },
        }}
        onClick={() => navigate("/patients")}
      >
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Stack spacing={1}>
                <Typography variant="h3">{activePatients.length}</Typography>
                <Typography
                  variant="body1"
                  sx={{
                    "&:hover": {
                      textDecoration: "underline",
                    },
                    cursor: "pointer",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/patients");
                  }}
                >
                  Pacientes Ativos
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack
                spacing={1}
                alignItems={{ xs: "flex-start", sm: "flex-end" }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/patients");
                  }}
                  sx={{
                    bgcolor: "common.white",
                    color: "custom.main",
                    "&:hover": {
                      bgcolor: "custom.lightest",
                    },
                  }}
                >
                  Ver Pacientes
                </Button>
                <Typography variant="body2">
                  Clique para gerenciar seus pacientes
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Features */}
      <Grid container spacing={3}>
        {features.map((feature) => (
          <Grid key={feature.title} item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: "100%",
                cursor: "pointer",
                bgcolor: "background.paper",
                "&:hover": {
                  boxShadow: 6,
                  bgcolor: "custom.lightest",
                },
              }}
              onClick={() => navigate(feature.path)}
            >
              <CardContent>
                <Stack spacing={2} alignItems="center" textAlign="center">
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: "50%",
                      bgcolor: "custom.lightest",
                      color: feature.color,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" color="text.primary">
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
