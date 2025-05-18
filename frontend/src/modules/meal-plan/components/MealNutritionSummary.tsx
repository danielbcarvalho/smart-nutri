import React, { useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
} from "@mui/material";
import type { MealFood } from "@/services/foodService";
import type { Alimento } from "./AddFoodToMealModal";

interface MealNutritionSummaryProps {
  mealFoods: MealFood[];
  foodDb: Alimento[];
}

const MealNutritionSummary: React.FC<MealNutritionSummaryProps> = ({
  mealFoods,
  foodDb,
}) => {
  const nutritionSummary = useMemo(() => {
    if (!Array.isArray(mealFoods) || !Array.isArray(foodDb)) return null;

    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    mealFoods.forEach((mealFood) => {
      const food = foodDb.find((f) => f.id === mealFood.foodId);
      if (!food) return;

      // Calcular mcIndex dinamicamente
      let mcIndex: number | undefined = undefined;
      if (food.mc && mealFood.unit) {
        mcIndex = food.mc.findIndex((mc) => mc.nome_mc === mealFood.unit);
        if (mcIndex === -1) mcIndex = undefined;
      }

      // Calcular peso real
      let realWeight = mealFood.amount;
      if (
        food.mc &&
        typeof mcIndex === "number" &&
        mcIndex >= 0 &&
        food.mc[mcIndex]
      ) {
        const mcWeight = Number(food.mc[mcIndex].peso) || 1;
        realWeight = mealFood.amount * mcWeight;
      }

      calories += ((Number(food.kcal) || 0) * realWeight) / 100;
      protein += ((Number(food.ptn) || 0) * realWeight) / 100;
      carbs += ((Number(food.cho) || 0) * realWeight) / 100;
      fat += ((Number(food.lip) || 0) * realWeight) / 100;
    });

    return {
      calories: calories,
      protein: protein,
      carbs: carbs,
      fat: fat,
      macroDistribution: {
        protein: protein * 4, // 4 kcal por grama de proteína
        carbs: carbs * 4, // 4 kcal por grama de carboidrato
        fat: fat * 9, // 9 kcal por grama de gordura
      },
    };
  }, [mealFoods, foodDb]);

  if (!nutritionSummary) return null;

  const totalMacroCalories =
    nutritionSummary.macroDistribution.protein +
    nutritionSummary.macroDistribution.carbs +
    nutritionSummary.macroDistribution.fat;

  return (
    <Card variant="outlined" sx={{ mt: 2, mb: 2 }}>
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Typography variant="subtitle2" gutterBottom>
          Resumo Nutricional
        </Typography>
        <Typography variant="h6" color="primary.main" gutterBottom>
          {nutritionSummary.calories.toFixed(1)} kcal
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2">
            Proteínas: {nutritionSummary.protein.toFixed(1)}g
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {(
              (nutritionSummary.macroDistribution.protein /
                totalMacroCalories) *
              100
            ).toFixed(0)}
            %
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={
            (nutritionSummary.macroDistribution.protein / totalMacroCalories) *
            100
          }
          color="secondary"
          sx={{ height: 6, borderRadius: 3, mb: 1 }}
        />

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2">
            Carboidratos: {nutritionSummary.carbs.toFixed(1)}g
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {(
              (nutritionSummary.macroDistribution.carbs / totalMacroCalories) *
              100
            ).toFixed(0)}
            %
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={
            (nutritionSummary.macroDistribution.carbs / totalMacroCalories) *
            100
          }
          color="warning"
          sx={{ height: 6, borderRadius: 3, mb: 1 }}
        />

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2">
            Gorduras: {nutritionSummary.fat.toFixed(1)}g
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {(
              (nutritionSummary.macroDistribution.fat / totalMacroCalories) *
              100
            ).toFixed(0)}
            %
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={
            (nutritionSummary.macroDistribution.fat / totalMacroCalories) * 100
          }
          color="info"
          sx={{ height: 6, borderRadius: 3 }}
        />
      </CardContent>
    </Card>
  );
};

export default MealNutritionSummary;
