import React from "react";
import { Box, Typography, Stack, Button } from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  UnfoldMore as UnfoldMoreIcon,
} from "@mui/icons-material";

interface MealPlanHeaderProps {
  planName: string;
  expandedMealsCount: number;
  totalMealsCount: number;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onAddMeal: () => void;
}

export function MealPlanHeader({
  planName,
  expandedMealsCount,
  totalMealsCount,
  onExpandAll,
  onCollapseAll,
  onAddMeal,
}: MealPlanHeaderProps) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      alignItems={{ xs: "stretch", sm: "center" }}
      justifyContent="space-between"
      spacing={2}
      sx={{ mb: 2, gap: { xs: 1.5, sm: 0 } }}
    >
      <Box>
        <Typography
          variant="h6"
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 0.5,
            fontSize: { xs: "1.3rem", sm: "2rem" },
          }}
        >
          Plano Alimentar
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ fontSize: { xs: "1.05rem", sm: "1.25rem" } }}
        >
          {planName}
        </Typography>
      </Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{ width: { xs: "100%", sm: "auto" } }}
      >
        <Button
          variant="outlined"
          startIcon={
            expandedMealsCount === totalMealsCount ? (
              <ExpandMoreIcon />
            ) : (
              <UnfoldMoreIcon />
            )
          }
          onClick={
            expandedMealsCount === totalMealsCount ? onCollapseAll : onExpandAll
          }
          size={"large"}
          fullWidth
          sx={{ fontWeight: 600, fontSize: 16, py: 0 }}
        >
          {expandedMealsCount === totalMealsCount
            ? "Recolher tudo"
            : "Expandir tudo"}
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddMeal}
          size={"large"}
          color="success"
          fullWidth
          sx={{ fontWeight: 600, fontSize: 16, py: 0 }}
        >
          Nova refeição
        </Button>
      </Stack>
    </Stack>
  );
}
