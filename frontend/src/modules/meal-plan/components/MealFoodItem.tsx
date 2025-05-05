import React from "react";
import { Box, Typography, Tooltip, Chip } from "@mui/material";
import type { MealFood } from "@/services/foodService";
import type { Alimento } from "./AddFoodToMealModal";

interface MealFoodItemProps {
  mealFood: MealFood;
  foodDb: Alimento[];
}

const MealFoodItem: React.FC<MealFoodItemProps> = ({ mealFood, foodDb }) => {
  const foodDetails = Array.isArray(foodDb)
    ? foodDb.find((f) => f.id === mealFood.foodId)
    : null;

  const foodName = foodDetails
    ? foodDetails.nome
    : `Alimento ID: ${mealFood.foodId}`;

  const nutritionInfo = foodDetails
    ? {
        calories: Math.round(
          ((Number(foodDetails.kcal) || 0) * mealFood.amount) / 100
        ),
        protein: Math.round(
          ((Number(foodDetails.ptn) || 0) * mealFood.amount) / 100
        ),
        carbs: Math.round(
          ((Number(foodDetails.cho) || 0) * mealFood.amount) / 100
        ),
        fat: Math.round(
          ((Number(foodDetails.lip) || 0) * mealFood.amount) / 100
        ),
      }
    : null;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        p: 1,
        borderRadius: 1,
        mb: 0.5,
        "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
      }}
    >
      <Typography variant="body2" sx={{ width: 70 }}>
        {mealFood.amount}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ width: 70 }}>
        {mealFood.unit}
      </Typography>
      <Typography variant="body2" sx={{ flex: 1 }}>
        {foodName}
      </Typography>

      {nutritionInfo && (
        <Tooltip
          title={
            <Box>
              <Typography variant="caption">
                Calorias: {nutritionInfo.calories} kcal
              </Typography>
              <Typography variant="caption">
                Proteína: {nutritionInfo.protein}g
              </Typography>
              <Typography variant="caption">
                Carboidratos: {nutritionInfo.carbs}g
              </Typography>
              <Typography variant="caption">
                Gorduras: {nutritionInfo.fat}g
              </Typography>
            </Box>
          }
        >
          <Chip
            label={`${nutritionInfo.calories} kcal`}
            size="small"
            variant="outlined"
            sx={{ height: 24 }}
          />
        </Tooltip>
      )}
    </Box>
  );
};

export default MealFoodItem;
