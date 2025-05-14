import { BodyDensityFormula } from "./types";

export const guedesFormula: BodyDensityFormula = {
  id: "guedes",
  name: "Guedes",
  description:
    "Fórmula de Guedes. Para homens: tríceps, suprailíaca e abdominal. Para mulheres: subescapular, suprailíaca e coxa.",
  status: "active",
  requiredSkinfolds: [
    "tricipital",
    "suprailiac",
    "abdominal",
    "subscapular",
    "thigh",
  ],
  genderSupport: "both",
  ageRange: {
    min: 18,
    max: 60,
  },
  reference:
    "Protocolo Guedes (1994) conforme Periodization Online: usa coeficientes diferentes para M e F.",
  calculate: (skinfolds, gender) => {
    if (!gender) return NaN;

    const g = gender.toUpperCase();
    // lê dobras convertendo "" ou inválido em 0
    const triceps = parseFloat(skinfolds.tricipital || "0") || 0;
    const suprailiac = parseFloat(skinfolds.suprailiac || "0") || 0;
    const abdominal = parseFloat(skinfolds.abdominal || "0") || 0;
    const subscap = parseFloat(skinfolds.subscapular || "0") || 0;
    const thigh = parseFloat(skinfolds.thigh || "0") || 0;

    let density: number;
    let sum: number;

    if (g === "M") {
      // Homens: tríceps + suprailiaca + abdominal
      sum = triceps + suprailiac + abdominal;
      if (sum <= 0) return NaN;
      density = 1.17136 - 0.06706 * Math.log10(sum);
    } else if (g === "F") {
      // Mulheres: subescapular + suprailiaca + coxa (thigh)
      sum = subscap + suprailiac + thigh;
      if (sum <= 0) return NaN;
      density = 1.1665 - 0.07063 * Math.log10(sum);
    } else {
      return NaN;
    }

    return density;
  },
};
