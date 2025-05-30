import React from "react";
import { Box } from "@mui/material";
import MealCard from "@/modules/meal-plan/components/MealCard";
import type { Meal } from "@/modules/meal-plan/services/mealPlanService";
import type { Alimento } from "@/modules/meal-plan/components/AddFoodToMealModal";
import type { MealFood } from "@/services/foodService";
import FoodItemWithSubstitutes, {
  type Substitute,
} from "@/modules/meal-plan/components/FoodItemWithSubstitutes";

interface MealListProps {
  meals: Meal[];
  foodDb: Alimento[];
  expandedMeals: string[];
  onExpandMeal: (mealId: string) => void;
  onAddFood: (mealId: string) => void;
  onOpenMenu: (event: React.MouseEvent<HTMLElement>, mealId: string) => void;
  onToggleCalculation: (mealId: string, isActive: boolean) => void;
}

export function MealList({
  meals,
  foodDb,
  expandedMeals,
  onExpandMeal,
  onAddFood,
  onOpenMenu,
  onToggleCalculation,
}: MealListProps) {
  return (
    <Box
      sx={{
        borderRadius: { xs: 2, sm: 2 },
        overflow: "hidden",
        mb: 3,
        bgcolor: "transparent",
        p: { xs: 0.5, sm: 0 },
      }}
    >
      {meals.map((meal) => (
        <MealCard
          key={meal.id}
          meal={meal}
          foodDb={foodDb}
          expanded={expandedMeals.includes(meal.id)}
          onExpand={onExpandMeal}
          onAddFood={onAddFood}
          onOpenMenu={onOpenMenu}
          onToggleCalculation={onToggleCalculation}
          renderFoodItem={(mealFood) => {
            const food = foodDb.find((f) => f.id === mealFood.foodId);
            if (!food) return null;

            // Encontrar a medida caseira correta baseada na unidade
            const mcIndex =
              food.mc?.findIndex((mc) => mc.nome_mc === mealFood.unit) ?? 0;
            const peso = Number(food.mc?.[mcIndex]?.peso) || 1;

            const substitutes =
              mealFood.substitutes
                ?.map((sub) => {
                  const subFood = foodDb.find(
                    (f) => f.id === sub.substituteFoodId
                  );
                  if (!subFood) return null;

                  // Encontrar a medida caseira correta baseada na unidade do substituto
                  const subMcIndex =
                    subFood.mc?.findIndex(
                      (mc) => mc.nome_mc === sub.substituteUnit
                    ) ?? 0;
                  const subPeso = Number(subFood.mc?.[subMcIndex]?.peso) || 1;
                  const quantidadeGramas =
                    Number(sub.substituteAmount) * subPeso;
                  const fator = quantidadeGramas / 100;
                  const caloriasCalculadas = Number(subFood.kcal) * fator;

                  return {
                    ...sub,
                    name: subFood.nome,
                    calories: caloriasCalculadas,
                    kcal: Number(subFood.kcal),
                    peso: subPeso,
                  } as Substitute;
                })
                .filter((sub): sub is Substitute => sub !== null) || [];

            return (
              <FoodItemWithSubstitutes
                key={mealFood.id}
                food={{
                  id: mealFood.id,
                  name: food.nome,
                  amount: mealFood.amount,
                  unit: mealFood.unit,
                  calories: Number(food.kcal) * (mealFood.amount / 100),
                  kcal: Number(food.kcal),
                  peso: peso,
                }}
                substitutes={substitutes}
              />
            );
          }}
        />
      ))}
    </Box>
  );
}
