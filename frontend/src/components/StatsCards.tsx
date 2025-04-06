import React from "react";
import {
  Box,
  Card,
  CardContent,
  Grid as MuiGrid,
  Typography,
  useTheme,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from "@mui/icons-material";
import { api } from "../lib/axios";

interface Stats {
  totalPatients: number;
  totalMealPlans: number;
  totalMeasurements: number;
  totalDocuments: number;
  lastWeekGrowth: {
    patients: number;
    mealPlans: number;
    measurements: number;
    documents: number;
  };
}

export function StatsCards() {
  const theme = useTheme();
  const [stats, setStats] = React.useState<Stats | null>(null);

  React.useEffect(() => {
    async function loadStats() {
      try {
        const response = await api.get("/stats");
        setStats(response.data);
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
      }
    }

    loadStats();
  }, []);

  if (!stats) return null;

  const cards = [
    {
      title: "Total de pacientes",
      value: stats.totalPatients,
      growth: stats.lastWeekGrowth.patients,
      color: theme.palette.primary.main,
    },
    {
      title: "Total de planos",
      value: stats.totalMealPlans,
      growth: stats.lastWeekGrowth.mealPlans,
      color: theme.palette.success.main,
    },
    {
      title: "Total de avaliações",
      value: stats.totalMeasurements,
      growth: stats.lastWeekGrowth.measurements,
      color: theme.palette.warning.main,
    },
    {
      title: "Total de documentos",
      value: stats.totalDocuments,
      growth: stats.lastWeekGrowth.documents,
      color: theme.palette.info.main,
    },
  ];

  return (
    <MuiGrid container spacing={3}>
      {cards.map((card) => (
        <MuiGrid item xs={12} sm={6} md={3} key={card.title}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                right: 0,
                width: "6px",
                height: "100%",
                backgroundColor: card.color,
                borderTopRightRadius: 1,
                borderBottomRightRadius: 1,
              },
            }}
          >
            <CardContent>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                {card.title}
              </Typography>
              <Typography variant="h4" component="div">
                {card.value.toLocaleString()}
              </Typography>
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  color: card.growth >= 0 ? "success.main" : "error.main",
                }}
              >
                {card.growth >= 0 ? (
                  <TrendingUpIcon fontSize="small" />
                ) : (
                  <TrendingDownIcon fontSize="small" />
                )}
                <Typography variant="body2">
                  {Math.abs(card.growth)}% na última semana
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </MuiGrid>
      ))}
    </MuiGrid>
  );
}
