// pollock7.ts
import { BodyDensityFormula, SkinfoldsInput } from "./types";

export const pollock7Formula: BodyDensityFormula = {
  id: "pollock7",
  name: "Pollock 7 Dobras (1978/1980)",
  description:
    "Fórmula de Pollock & Jackson (1978) de 7 dobras para homens e Jackson, Pollock & Ward (1980) para mulheres. " +
    "Dobras: Peitoral (Torácica), Axilar Média, Tricipital, Subescapular, Abdominal, Supra-ilíaca e Coxa.",
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
    min: 18, // Geralmente validado para adultos
    max: 61, // Idade máxima no estudo original de Jackson & Pollock (1978)
  },
  reference:
    "Jackson AS, Pollock ML. Generalized equations for predicting body density of men. Br J Nutr. 1978 Nov;40(3):497-504. (Homens) / Jackson AS, Pollock ML, Ward A. Generalized equations for predicting body density of women. Med Sci Sports Exerc. 1980 Summer;12(3):175-82. (Mulheres)",
  calculate: (skinfolds, gender?: string, age?: number) => {
    if (!gender || !age || age < 0) return 0;

    const g = gender.toUpperCase();
    const requiredKeys: (keyof SkinfoldsInput)[] = [
      "thoracic",
      "axillaryMedian",
      "tricipital",
      "subscapular",
      "abdominal",
      "suprailiac",
      "thigh",
    ];

    let sum = 0;
    for (const key of requiredKeys) {
      const value = parseFloat(skinfolds[key] || "0") || 0;
      if (value < 0) return 0; // Dobra não pode ser negativa
      sum += value;
    }

    if (sum <= 0) {
      return 0;
    }

    let density: number;
    if (g === "M") {
      // Jackson & Pollock (1978) para homens
      // Constante de idade: 0.00028826 no código do usuário, 0.0002882 no estudo original.
      density =
        1.112 -
        0.00043499 * sum +
        0.00000055 * Math.pow(sum, 2) -
        0.00028826 * age; // Mantendo do usuário, mas verificar fonte
    } else if (g === "F") {
      // Jackson, Pollock & Ward (1980) para mulheres
      // Constante inicial: 1.097 no código do usuário, 1.0970 no estudo original.
      density =
        1.097 - // Usando a do estudo original para maior precisão
        0.00046971 * sum +
        0.00000056 * Math.pow(sum, 2) -
        0.00012828 * age;
    } else {
      return 0; // Gênero inválido
    }

    if (isNaN(density) || !isFinite(density) || density <= 0) {
      return 0;
    }
    return density;
  },
  getRequiredSkinfolds: () => {
    // As mesmas 7 dobras para ambos os gêneros
    return [
      "thoracic",
      "axillaryMedian",
      "tricipital",
      "subscapular",
      "abdominal",
      "suprailiac",
      "thigh",
    ];
  },
};
