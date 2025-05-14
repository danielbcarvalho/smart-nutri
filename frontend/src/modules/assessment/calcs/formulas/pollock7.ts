// pollock7.ts (versão otimizada)
import { BodyDensityFormula } from "./types";

export const pollock7Formula: BodyDensityFormula = {
  id: "pollock7",
  name: "Pollock 7, 1978",
  description:
    "Fórmula de Pollock & Jackson (1978) de 7 dobras. Para homens: peitoral, axilar média, tríceps, subescapular, abdominal, supra-ilíaca e coxa. Para mulheres: usa-se a fórmula de Jackson, Pollock & Ward (1980).",
  status: "active",
  requiredSkinfolds: [
    "thoracic",
    "axillaryMedian",
    "tricipital",
    "subscapular",
    "abdominal",
    "suprailiac",
    "thigh",
  ],
  genderSupport: "both",
  ageRange: {
    min: 18,
    max: 65,
  },
  reference:
    "Jackson AS, Pollock ML. Generalized equations for predicting body density of men. Br J Nutr. 1978;40:497-504. (Homens) / Jackson AW, Pollock ML, Ward A. Generalized equations for predicting body density of women. Med Sci Sports Exerc. 1980;12:175-182. (Mulheres)",
  calculate: (skinfolds, gender, age) => {
    // Verifica se todas as dobras necessárias estão presentes
    const requiredSkinfolds = [
      "thoracic",
      "axillaryMedian",
      "tricipital",
      "subscapular",
      "abdominal",
      "suprailiac",
      "thigh",
    ];

    const allSkinfolds = requiredSkinfolds.map(
      (fold) =>
        parseFloat(skinfolds[fold as keyof typeof skinfolds] || "0") || 0
    );

    // Soma das dobras válidas
    const sum = allSkinfolds.reduce((acc, curr) => acc + curr, 0);

    // Se não houver nenhuma dobra válida, retorna 0
    if (sum === 0) {
      return 0;
    }

    // Fórmulas específicas por gênero
    let density;
    if (gender === "M") {
      // Equação original de Jackson & Pollock (1978) para homens
      density =
        1.112 - 0.00043499 * sum + 0.00000055 * sum * sum - 0.00028826 * age;
    } else {
      // Equação de Jackson, Pollock & Ward (1980) para mulheres
      density =
        1.097 - 0.00046971 * sum + 0.00000056 * sum * sum - 0.00012828 * age;
    }

    return density;
  },
};
