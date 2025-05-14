import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  Skeleton,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

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

const statsService = {
  getStats: async (): Promise<Stats> => {
    const response = await api.get("/stats");
    return response.data;
  },
};

export function StatsCards() {
  const theme = useTheme();
  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: statsService.getStats,
  });

  const cards = [
    {
      title: "Total de pacientes",
      value: stats?.totalPatients ?? 0,
      growth: stats?.lastWeekGrowth.patients ?? 0,
      color: theme.palette.primary.main,
    },
    {
      title: "Total de planos",
      value: stats?.totalMealPlans ?? 0,
      growth: stats?.lastWeekGrowth.mealPlans ?? 0,
      color: theme.palette.success.main,
    },
    {
      title: "Total de avaliações",
      value: stats?.totalMeasurements ?? 0,
      growth: stats?.lastWeekGrowth.measurements ?? 0,
      color: theme.palette.warning.main,
    },
    {
      title: "Total de documentos",
      value: stats?.totalDocuments ?? 0,
      growth: stats?.lastWeekGrowth.documents ?? 0,
      color: theme.palette.info.main,
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gap: 3,
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(4, 1fr)",
        },
      }}
    >
      {cards.map((card) => (
        <Box key={card.title}>
          <Card
            sx={{
              height: "100%",
              minWidth: 220,
              display: "flex",
              flexDirection: "column",
              position: "relative",
              overflow: "hidden",
              minHeight: 150,
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
              {isLoading ? (
                <Skeleton
                  variant="text"
                  width="80%"
                  height={40}
                  sx={{ my: 1 }}
                />
              ) : (
                <Typography variant="h4" component="div">
                  {card.value.toLocaleString()}
                </Typography>
              )}
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  color:
                    !isLoading && card.growth >= 0
                      ? "success.main"
                      : !isLoading
                      ? "error.main"
                      : undefined,
                }}
              >
                {isLoading ? (
                  <Skeleton
                    variant="circular"
                    width={24}
                    height={24}
                    sx={{ mr: 1 }}
                  />
                ) : card.growth >= 0 ? (
                  <TrendingUpIcon fontSize="small" />
                ) : (
                  <TrendingDownIcon fontSize="small" />
                )}
                {isLoading ? (
                  <Skeleton variant="text" width="40%" height={24} />
                ) : (
                  <Typography variant="body2">
                    {Math.abs(card.growth)}% na última semana
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
      ))}
    </Box>
  );
}
