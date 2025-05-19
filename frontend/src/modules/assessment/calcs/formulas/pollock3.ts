// pollock3.ts
import { BodyDensityFormula, SkinfoldsInput } from "./types";

export const pollock3Formula: BodyDensityFormula = {
  id: "pollock3",
  name: "Pollock 3 Dobras (1980)", // Jackson, Pollock & Ward (1980) para mulheres e Pollock, Schmidt & Jackson (1980) para homens
  description:
    "Fórmula de Pollock de 3 dobras. Para homens (Pollock, Schmidt & Jackson, 1980): peitoral, abdômen e coxa. Para mulheres (Jackson, Pollock & Ward, 1980): tríceps, suprailíaca e coxa.",
  status: "active",
  requiredSkinfolds: [
    // Lista todas as 5 dobras potenciais
    "thoracic",
    "abdominal",
    "thigh",
    "tricipital",
    "suprailiac",
  ],
  genderSupport: "both",
  ageRange: {
    min: 18, // Geralmente validado para adultos
    max: 61, // Idade máxima no estudo original de Jackson & Pollock (1978) era 61
  },
  reference:
    "Pollock ML, Schmidt DH, Jackson AS. Measurement of cardiorespiratory fitness and body composition in the clinical setting. Compr Ther. 1980;6(9):12-27. / Jackson, A. S., Pollock, M. L., & Ward, A. (1980). Generalized equations for predicting body density of women. Medicine and Science in Sports and Exercise, 12(3), 175-182.",
  calculate: (skinfolds: SkinfoldsInput, gender?: string, age?: number) => {
    console.log("🔍 Pollock3 Debug - Inputs:", { skinfolds, gender, age });

    if (!gender || !age || age < 0) {
      console.log("❌ Pollock3 Debug - Invalid inputs:", { gender, age });
      return NaN;
    }

    const g = gender.toUpperCase();
    const thoracic = parseFloat(skinfolds.thoracic || "0") || 0;
    const abdominal = parseFloat(skinfolds.abdominal || "0") || 0;
    const thigh = parseFloat(skinfolds.thigh || "0") || 0;
    const tricipital = parseFloat(skinfolds.tricipital || "0") || 0;
    const suprailiac = parseFloat(skinfolds.suprailiac || "0") || 0;

    console.log("🔍 Pollock3 Debug - Parsed values:", {
      g,
      thoracic,
      abdominal,
      thigh,
      tricipital,
      suprailiac,
    });

    let sum: number;

    if (g === "M") {
      sum = thoracic + abdominal + thigh;
    } else if (g === "F") {
      sum = tricipital + suprailiac + thigh;
    } else {
      console.log("❌ Pollock3 Debug - Invalid gender:", g);
      return 0;
    }

    console.log("🔍 Pollock3 Debug - Sum of skinfolds:", sum);

    if (sum <= 0) {
      console.log("❌ Pollock3 Debug - Sum is less than or equal to 0");
      return 0;
    }

    let density: number;
    if (g === "M") {
      // Pollock, Schmidt & Jackson (1980) para homens
      density =
        1.10938 -
        0.0008267 * sum +
        0.0000016 * Math.pow(sum, 2) -
        0.0002574 * age;
    } else {
      // g === "F"
      // Jackson, Pollock & Ward (1980) para mulheres
      density =
        1.0994921 -
        0.0009929 * sum +
        0.0000023 * Math.pow(sum, 2) -
        0.0001392 * age;
    }

    console.log("🔍 Pollock3 Debug - Calculated density:", density);

    if (isNaN(density) || !isFinite(density) || density <= 0) {
      console.log("❌ Pollock3 Debug - Invalid density result:", density);
      return 0;
    }
    return density;
  },
  getRequiredSkinfolds: (gender?: string) => {
    const g = (gender || "").toUpperCase();
    if (g === "M") {
      return ["thoracic", "abdominal", "thigh"];
    }
    if (g === "F") {
      return ["tricipital", "suprailiac", "thigh"];
    }
    return ["thoracic", "abdominal", "thigh", "tricipital", "suprailiac"]; // Todas se gênero desconhecido
  },
};
