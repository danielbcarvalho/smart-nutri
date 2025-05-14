import { BodyDensityFormula } from "./types";

export const guedesFormula: BodyDensityFormula = {
  id: "guedes",
  name: "Guedes (1994)",
  description:
    "Protocolo de Guedes utilizando 3 dobras cutâneas específicas por gênero. " +
    "Para homens: Tricipital (posterior do braço, ponto médio entre acrômio e olécrano), " +
    "Abdominal (vertical, 2cm lateral à cicatriz umbilical) e " +
    "Supra-ilíaca (diagonal acima da crista ilíaca, linha axilar anterior/média). " +
    "Para mulheres: Subescapular (diagonal abaixo do ângulo inferior da escápula), " +
    "Coxa (vertical na face anterior, ponto médio entre ligamento inguinal e borda superior da patela) e " +
    "Supra-ilíaca (mesma localização do masculino). " +
    "Fórmulas: Homens: DC = 1.1714 - 0.0671 * log10(Σdobras). " +
    "Mulheres: DC = 1.1665 - 0.07063 * log10(Σdobras).",
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
    "GUEDES, D.P. (1994). Composição corporal: princípios, técnicas e aplicações. Londrina: APEF.",
  calculate: (skinfolds, gender) => {
    if (!gender) return NaN;

    const g = gender.toUpperCase();
    // Parse das dobras, converte string inválida em 0
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
      density = 1.1714 - 0.0671 * Math.log10(sum);
    } else if (g === "F") {
      // Mulheres: subescapular + suprailiaca + coxa
      sum = subscap + suprailiac + thigh;
      if (sum <= 0) return NaN;
      density = 1.1665 - 0.07063 * Math.log10(sum);
    } else {
      return NaN;
    }

    return density;
  },
  // Função para determinar as dobras requeridas com base no gênero
  getRequiredSkinfolds: (gender: string) => {
    const g = (gender || "").toUpperCase();

    if (g === "M") {
      return ["tricipital", "suprailiac", "abdominal"];
    }

    if (g === "F") {
      return ["subscapular", "suprailiac", "thigh"];
    }

    return [];
  },
};
