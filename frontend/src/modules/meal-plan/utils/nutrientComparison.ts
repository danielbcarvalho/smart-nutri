export const calculateMacronutrientTargets = (getKcal: number) => ({
  protein: (getKcal * 0.25) / 4,
  fat: (getKcal * 0.3) / 9,
  carbohydrates: (getKcal * 0.45) / 4,
});

export const calculateAdherence = (current: number, target: number) => {
  const difference = ((current - target) / target) * 100;
  return {
    percentage: difference,
    status: difference > 5 ? "above" : difference < -5 ? "below" : "within",
  };
};

export const getAdherenceColor = (difference: number, target: number) => {
  const percentDiff = (difference / target) * 100;
  if (Math.abs(percentDiff) <= 5) return "success";
  if (Math.abs(percentDiff) <= 10) return "warning";
  return "error";
};

export const calculateMacronutrientPercentages = (
  protein: number,
  fat: number,
  carbohydrates: number,
  totalCalories: number
) => {
  if (totalCalories <= 0) {
    return {
      proteinPercentage: 0,
      fatPercentage: 0,
      carbohydratesPercentage: 0,
    };
  }

  return {
    proteinPercentage: ((protein * 4) / totalCalories) * 100,
    fatPercentage: ((fat * 9) / totalCalories) * 100,
    carbohydratesPercentage: ((carbohydrates * 4) / totalCalories) * 100,
  };
};
