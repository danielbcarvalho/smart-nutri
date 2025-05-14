import { BodyDensityFormula } from "./types";

export const durninFormula: BodyDensityFormula = {
  id: "durnin",
  name: "Durnin & Womersley (1974)",
  description:
    "Protocolo de Durnin & Womersley utilizando 4 dobras cutâneas comuns para ambos os gêneros: " +
    "Tricipital (posterior do braço, ponto médio entre acrômio e olécrano), " +
    "Subescapular (diagonal abaixo do ângulo inferior da escápula), " +
    "Bicipital (face anterior do braço, sobre o ventre do músculo bíceps, mesmo nível da tricipital) e " +
    "Supra-ilíaca (diagonal acima da crista ilíaca, linha axilar média). " +
    "Fórmulas: Homens: DC = 1.1765 - 0.0744 * log10(Σdobras). " +
    "Mulheres: DC = 1.1567 - 0.0717 * log10(Σdobras). " +
    "Nota: Esta é uma versão simplificada do protocolo original, que possui constantes específicas por faixa etária.",
  status: "active",
  requiredSkinfolds: ["tricipital", "subscapular", "bicipital", "suprailiac"],
  genderSupport: "both",
  ageRange: {
    min: 17,
    max: 60,
  },
  reference:
    "DURNIN, J.V.G.A.; WOMERSLEY, J. (1974). Body fat assessed from total body density and its estimation from skinfold thickness: measurements on 481 men and women aged from 16 to 72 years. British Journal of Nutrition, 32(1), 77-97.",
  calculate: (skinfolds, gender) => {
    if (!gender) return NaN;

    const g = gender.toUpperCase();
    // Parse das dobras, converte string inválida em 0
    const triceps = parseFloat(skinfolds.tricipital || "0") || 0;
    const subscap = parseFloat(skinfolds.subscapular || "0") || 0;
    const biceps = parseFloat(skinfolds.bicipital || "0") || 0;
    const suprailiac = parseFloat(skinfolds.suprailiac || "0") || 0;

    // Soma das 4 dobras para ambos os gêneros
    const sum = triceps + subscap + biceps + suprailiac;
    if (sum <= 0) return NaN;

    let density: number;

    if (g === "M") {
      // Homens: DC = 1.1765 - 0.0744 * log10(Σdobras)
      density = 1.1765 - 0.0744 * Math.log10(sum);
    } else if (g === "F") {
      // Mulheres: DC = 1.1567 - 0.0717 * log10(Σdobras)
      density = 1.1567 - 0.0717 * Math.log10(sum);
    } else {
      return NaN;
    }

    return density;
  },
  // Função para determinar as dobras requeridas (mesmas para ambos os gêneros)
  getRequiredSkinfolds: () => {
    return ["tricipital", "subscapular", "bicipital", "suprailiac"];
  },
};
