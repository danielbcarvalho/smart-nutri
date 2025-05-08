import React from "react";
import {
  Box,
  Typography,
  Tooltip,
  Chip,
  TableRow,
  TableCell,
} from "@mui/material";
import type { MealFood } from "@/services/foodService";
import type { Alimento } from "./AddFoodToMealModal";

interface MealFoodItemProps {
  mealFood: MealFood;
  foodDb: Alimento[];
  asTableRow?: boolean;
}

const MealFoodItem: React.FC<MealFoodItemProps> = ({
  mealFood,
  foodDb,
  asTableRow,
}) => {
  const foodDetails = Array.isArray(foodDb)
    ? foodDb.find((f) => f.id === mealFood.foodId)
    : null;

  const foodName = foodDetails
    ? foodDetails.nome
    : `Alimento ID: ${mealFood.foodId}`;

  // Calcular mcIndex dinamicamente se não existir
  let mcIndex: number | undefined = undefined;
  if (foodDetails?.mc && mealFood.unit) {
    mcIndex = foodDetails.mc.findIndex((mc) => mc.nome_mc === mealFood.unit);
    if (mcIndex === -1) mcIndex = undefined;
  }

  let realWeight = mealFood.amount;
  if (
    foodDetails?.mc &&
    typeof mcIndex === "number" &&
    mcIndex >= 0 &&
    foodDetails.mc[mcIndex]
  ) {
    const mcWeight = Number(foodDetails.mc[mcIndex].peso) || 1;
    realWeight = mealFood.amount * mcWeight;
  }

  const nutritionInfo = foodDetails
    ? {
        calories: Math.round(
          ((Number(foodDetails.kcal) || 0) * realWeight) / 100
        ),
        protein: Math.round(
          ((Number(foodDetails.ptn) || 0) * realWeight) / 100
        ),
        carbs: Math.round(((Number(foodDetails.cho) || 0) * realWeight) / 100),
        fat: Math.round(((Number(foodDetails.lip) || 0) * realWeight) / 100),
      }
    : null;

  if (asTableRow) {
    return (
      <TableRow hover>
        <TableCell sx={{ width: 70 }}>{mealFood.amount}</TableCell>
        <TableCell sx={{ width: 70 }} color="text.secondary">
          {mealFood.unit}
        </TableCell>
        <TableCell>{foodName}</TableCell>
        <TableCell sx={{ width: 100 }}>
          {nutritionInfo ? (
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
          ) : null}
        </TableCell>
      </TableRow>
    );
  }

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
