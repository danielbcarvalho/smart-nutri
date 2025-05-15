// durnin.ts
import { BodyDensityFormula, SkinfoldsInput } from "./types";

export const durninFormula: BodyDensityFormula = {
  id: "durnin",
  name: "Durnin & Womersley (1974)",
  description:
    "Protocolo de Durnin & Womersley utilizando 4 dobras cutâneas comuns para ambos os gêneros: " +
    "Tricipital, Subescapular, Bicipital e Supra-ilíaca. " +
    "Fórmulas: Homens: DC = 1.1765 - 0.0744 * log10(Σdobras). " +
    "Mulheres: DC = 1.1567 - 0.0717 * log10(Σdobras). ",
  status: "active",
  requiredSkinfolds: ["tricipital", "subscapular", "bicipital", "suprailiac"],
  genderSupport: "both",
  ageRange: {
    // O estudo original cobre de 16/17 a 72 anos, mas as fórmulas simplificadas podem ter melhor acurácia em faixas mais restritas
    min: 17,
    max: 72, // Para refletir o estudo original, mas a UI pode alertar sobre a simplificação
  },
  reference:
    "DURNIN, J.V.G.A.; WOMERSLEY, J. (1974). Body fat assessed from total body density and its estimation from skinfold thickness: measurements on 481 men and women aged from 16 to 72 years. British Journal of Nutrition, 32(1), 77-97.",
  calculate: (skinfolds: SkinfoldsInput, gender?: string) => {
    if (!gender) return 0;

    const g = gender.toUpperCase();
    const triceps = parseFloat(skinfolds.tricipital || "0") || 0;
    const subscap = parseFloat(skinfolds.subscapular || "0") || 0;
    const biceps = parseFloat(skinfolds.bicipital || "0") || 0;
    const suprailiac = parseFloat(skinfolds.suprailiac || "0") || 0;

    const sum = triceps + subscap + biceps + suprailiac;
    if (sum <= 0) return 0;

    let density: number;

    if (g === "M") {
      density = 1.1765 - 0.0744 * Math.log10(sum);
    } else if (g === "F") {
      density = 1.1567 - 0.0717 * Math.log10(sum);
    } else {
      return 0;
    }

    if (isNaN(density) || !isFinite(density) || density <= 0) {
      return 0;
    }
    return density;
  },
  getRequiredSkinfolds: () => {
    return ["tricipital", "subscapular", "bicipital", "suprailiac"];
  },
};
