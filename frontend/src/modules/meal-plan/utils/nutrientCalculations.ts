import type {
  Alimento,
  MedidaCaseira,
} from "@/modules/meal-plan/components/AddFoodToMealModal";
import type { Meal as BaseMeal, MealFood } from "@/services/foodService";

interface Meal extends BaseMeal {
  isActiveForCalculation?: boolean;
}

interface NutrientTotals {
  protein: number;
  fat: number;
  carbohydrates: number;
  calories: number;
  totalWeight: number;
}

export const calculateNutrients = (
  mealFoods: MealFood[],
  foodDb: Alimento[]
): NutrientTotals => {
  return mealFoods.reduce(
    (acc, mealFood) => {
      const food = foodDb.find((f) => f.id === mealFood.foodId);
      if (!food) return acc;

      const amount = mealFood.amount;
      const mc = food.mc?.find(
        (m: MedidaCaseira) => m.nome_mc === mealFood.unit
      );
      if (!mc) return acc;

      const conversionFactor = Number(mc.peso) / 100;

      // Calcula as calorias dos macronutrientes
      const proteinKcal = Number(food.ptn || 0) * amount * conversionFactor * 4; // 4 kcal por grama de proteína
      const fatKcal = Number(food.lip || 0) * amount * conversionFactor * 9; // 9 kcal por grama de gordura
      const carbsKcal = Number(food.cho || 0) * amount * conversionFactor * 4; // 4 kcal por grama de carboidrato

      // Calcula o total de calorias dos macronutrientes
      const totalMacroKcal = proteinKcal + fatKcal + carbsKcal;

      // Se não houver calorias dos macronutrientes, usa o valor de calories do alimento
      const effectiveCalories =
        totalMacroKcal > 0
          ? totalMacroKcal
          : Number(food.kcal || 0) * amount * conversionFactor;

      return {
        protein:
          acc.protein + Number(food.ptn || 0) * amount * conversionFactor,
        fat: acc.fat + Number(food.lip || 0) * amount * conversionFactor,
        carbohydrates:
          acc.carbohydrates + Number(food.cho || 0) * amount * conversionFactor,
        calories: acc.calories + effectiveCalories,
        totalWeight: acc.totalWeight + amount * Number(mc.peso),
      };
    },
    { protein: 0, fat: 0, carbohydrates: 0, calories: 0, totalWeight: 0 }
  );
};

export const calculateTotalNutrients = (
  meals: Meal[],
  foodDb: Alimento[]
): NutrientTotals => {
  return meals.reduce(
    (acc, meal) => {
      // Pula refeições que não estão ativas para cálculo
      if (!meal.isActiveForCalculation) return acc;

      const mealNutrients = calculateNutrients(meal.mealFoods, foodDb);

      return {
        protein: acc.protein + mealNutrients.protein,
        fat: acc.fat + mealNutrients.fat,
        carbohydrates: acc.carbohydrates + mealNutrients.carbohydrates,
        calories: acc.calories + mealNutrients.calories,
        totalWeight: acc.totalWeight + mealNutrients.totalWeight,
      };
    },
    { protein: 0, fat: 0, carbohydrates: 0, calories: 0, totalWeight: 0 }
  );
};
