// guedes.ts
import { BodyDensityFormula, SkinfoldsInput } from "./types";

export const guedesFormula: BodyDensityFormula = {
  id: "guedes",
  name: "Guedes (1994)",
  description:
    "Protocolo de Guedes utilizando 3 dobras cutâneas específicas por gênero. " +
    "Para homens: Tricipital, Abdominal e Supra-ilíaca. " +
    "Para mulheres: Subescapular, Coxa e Supra-ilíaca. " +
    "Fórmulas: Homens: DC = 1.1714 - 0.0671 * log10(Σdobras). " +
    "Mulheres: DC = 1.1665 - 0.07063 * log10(Σdobras).", // Original tinha 1.16650, o 0 é irrelevante
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
    // Guedes (1994) foi validado para adultos, geralmente 18-50/60
    min: 18,
    max: 60,
  },
  reference:
    "GUEDES, D.P. (1994). Composição corporal: princípios, técnicas e aplicações. Londrina: APEF.",
  calculate: (skinfolds: SkinfoldsInput, gender?: string) => {
    if (!gender) return 0;

    const g = gender.toUpperCase();
    const triceps = parseFloat(skinfolds.tricipital || "0") || 0;
    const suprailiac = parseFloat(skinfolds.suprailiac || "0") || 0;
    const abdominal = parseFloat(skinfolds.abdominal || "0") || 0;
    const subscap = parseFloat(skinfolds.subscapular || "0") || 0;
    const thigh = parseFloat(skinfolds.thigh || "0") || 0;

    let density: number;
    let sum: number;

    if (g === "M") {
      sum = triceps + suprailiac + abdominal;
      if (sum <= 0) return 0;
      density = 1.1714 - 0.0671 * Math.log10(sum);
    } else if (g === "F") {
      sum = subscap + suprailiac + thigh;
      if (sum <= 0) return 0;
      density = 1.1665 - 0.07063 * Math.log10(sum);
    } else {
      return 0;
    }

    if (isNaN(density) || !isFinite(density) || density <= 0) {
      return 0;
    }
    return density;
  },
  getRequiredSkinfolds: (gender?: string) => {
    const g = (gender || "").toUpperCase();
    if (g === "M") {
      return ["tricipital", "suprailiac", "abdominal"];
    }
    if (g === "F") {
      return ["subscapular", "suprailiac", "thigh"];
    }
    return ["tricipital", "suprailiac", "abdominal", "subscapular", "thigh"];
  },
};
