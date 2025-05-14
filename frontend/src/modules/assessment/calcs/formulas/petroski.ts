import { BodyDensityFormula } from "./types";

export const petroskiFormula: BodyDensityFormula = {
  id: "petroski",
  name: "Petroski (1995/1996)",
  description:
    "Fórmula de Petroski com variações específicas por gênero e faixa etária. " +
    "Para homens (20-39,9 anos) usa 4 dobras: subescapular, tricipital, supra-ilíaca e panturrilha medial. " +
    "Para mulheres (18-51 anos) usa: axilar média, suprailíaca oblíqua, coxa e panturrilha medial.",
  status: "active",
  requiredSkinfolds: [
    "subscapular",
    "tricipital",
    "suprailiac",
    "calf",
    "axillaryMedian",
    "thigh",
  ],
  genderSupport: "both",
  ageRange: {
    min: 18,
    max: 51,
  },
  reference:
    "PETROSKI, E.L. (1995). Tese UFSM; " +
    "Petroski & Pires-Neto (1996). Rev Bras Ativ Fís Saude.",
  calculate: (skinfolds, gender, age) => {
    // Validação inicial: idade
    if (!age || age < 18 || age > 51) return 0;

    const g = (gender || "").toUpperCase();
    // Parse das dobras, converte string inválida em 0
    const subscapular = parseFloat(skinfolds.subscapular || "0") || 0;
    const tricipital = parseFloat(skinfolds.tricipital || "0") || 0;
    const suprailiac = parseFloat(skinfolds.suprailiac || "0") || 0;
    const calf = parseFloat(skinfolds.calf || "0") || 0;
    const axillaryMedian = parseFloat(skinfolds.axillaryMedian || "0") || 0;
    const thigh = parseFloat(skinfolds.thigh || "0") || 0;

    let sum: number;
    let density: number;

    if (g === "M") {
      // Petroski (1995) para homens 20-39,9 anos
      if (age >= 20 && age < 40) {
        sum = subscapular + tricipital + suprailiac + calf;
        if (sum <= 0) return 0;
        density =
          1.10726863 -
          0.00081201 * sum +
          0.00000212 * Math.pow(sum, 2) -
          0.00041761 * age;
        return density;
      }
    }

    if (g === "F") {
      // Petroski & Simões (1996) para mulheres 18-51 anos
      if (age >= 18 && age <= 51) {
        sum = axillaryMedian + suprailiac + thigh + calf;
        if (sum <= 0) return 0;
        density = 1.1954713 - 0.07513507 * Math.log10(sum) - 0.00041072 * age;
        return density;
      }
    }

    return 0; // Fora das faixas ou gênero não suportado
  },
  // Função para determinar as dobras requeridas com base no gênero e idade
  getRequiredSkinfolds: (gender: string, age: number) => {
    const g = (gender || "").toUpperCase();

    if (g === "M" && age >= 20 && age < 40) {
      return ["subscapular", "tricipital", "suprailiac", "calf"];
    }

    if (g === "F" && age >= 18 && age <= 51) {
      return ["axillaryMedian", "suprailiac", "thigh", "calf"];
    }

    return [];
  },
};
