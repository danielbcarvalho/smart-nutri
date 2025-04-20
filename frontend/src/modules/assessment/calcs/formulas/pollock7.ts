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
    // Soma das 7 dobras na ordem correta do protocolo
    const sum =
      parseFloat(skinfolds.thoracic || "0") + // Peitoral
      parseFloat(skinfolds.axillaryMedian || "0") + // Axilar média
      parseFloat(skinfolds.tricipital || "0") + // Tríceps
      parseFloat(skinfolds.subscapular || "0") + // Subescapular
      parseFloat(skinfolds.abdominal || "0") + // Abdominal
      parseFloat(skinfolds.suprailiac || "0") + // Supra-ilíaca
      parseFloat(skinfolds.thigh || "0"); // Coxa

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
