import { BodyDensityFormula } from "./types";

export const petroskiFormula: BodyDensityFormula = {
  id: "petroski",
  name: "Petroski (1995/1996)",
  description:
    "Fórmula de Petroski com variações específicas por gênero. " +
    "Para homens: Tricipital (posterior do braço, ponto médio entre acrômio e olécrano), " +
    "Subescapular (diagonal abaixo do ângulo inferior da escápula), " +
    "Supra-ilíaca (diagonal acima da crista ilíaca) e " +
    "Panturrilha Medial (face medial da perna, nível de maior circunferência). " +
    "Para mulheres: Axilar Média (vertical na linha axilar média, nível do processo xifoide), " +
    "Coxa (vertical na face anterior, ponto médio entre ligamento inguinal e borda superior da patela), " +
    "Supra-ilíaca e Panturrilha Medial (mesmas localizações do masculino).",
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
    max: 60,
  },
  reference:
    "PETROSKI, E.L. (1995). Tese UFSM; " +
    "Petroski & Pires-Neto (1996). Rev Bras Ativ Fís Saude.",
  calculate: (skinfolds, gender, age) => {
    // Validação inicial: idade
    if (!age || age < 18 || age > 60) return 0;

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
      // Petroski (1995) para homens adultos
      sum = subscapular + tricipital + suprailiac + calf;
      if (sum <= 0) return 0;
      density =
        1.10726863 -
        0.00081201 * sum +
        0.00000212 * Math.pow(sum, 2) -
        0.00041761 * age;
      return density;
    }

    if (g === "F") {
      // Petroski & Simões (1996) para mulheres adultas
      sum = axillaryMedian + suprailiac + thigh + calf;
      if (sum <= 0) return 0;
      density = 1.1954713 - 0.07513507 * Math.log10(sum) - 0.00041072 * age;
      return density;
    }

    return 0; // Gênero não suportado
  },
  // Função para determinar as dobras requeridas com base no gênero
  getRequiredSkinfolds: (gender: string) => {
    const g = (gender || "").toUpperCase();

    if (g === "M") {
      return ["subscapular", "tricipital", "suprailiac", "calf"];
    }

    if (g === "F") {
      return ["axillaryMedian", "suprailiac", "thigh", "calf"];
    }

    return [];
  },
};
