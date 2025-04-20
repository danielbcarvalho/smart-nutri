import { BodyDensityFormula } from "./types";

export const pollock3Formula: BodyDensityFormula = {
  id: "pollock3",
  name: "Pollock 3 Dobras",
  description:
    "Fórmula de Pollock de 3 dobras. Para homens: peitoral, abdômen e coxa. Para mulheres: tríceps, suprailíaca e coxa.",
  status: "active",
  requiredSkinfolds: [
    "thoracic",
    "abdominal",
    "thigh",
    "tricipital",
    "suprailiac",
  ],
  genderSupport: "both",
  ageRange: {
    min: 18,
    max: 65,
  },
  reference:
    "Pollock ML, Schmidt DH, Jackson AS. Measurement of cardiorespiratory fitness and body composition in the clinical setting. Compr Ther. 1980;6(9):12-27.",
  calculate: (skinfolds, gender, age) => {
    // Soma das dobras específicas para cada gênero
    const sum =
      gender === "M"
        ? parseFloat(skinfolds.thoracic || "0") +
          parseFloat(skinfolds.abdominal || "0") +
          parseFloat(skinfolds.thigh || "0")
        : parseFloat(skinfolds.tricipital || "0") +
          parseFloat(skinfolds.suprailiac || "0") +
          parseFloat(skinfolds.thigh || "0");

    // Fórmulas específicas para cada gênero
    if (gender === "M") {
      return (
        1.10938 - 0.0008267 * sum + 0.0000016 * sum * sum - 0.0002574 * age
      );
    } else {
      return (
        1.0994921 - 0.0009929 * sum + 0.0000023 * sum * sum - 0.0001392 * age
      );
    }
  },
};
