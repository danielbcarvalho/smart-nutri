import { BodyDensityFormula } from "./types";

export const petroskiFormula: BodyDensityFormula = {
  id: "petroski",
  name: "Petroski (1995/1996)",
  description:
    "Fórmula de Petroski com variações específicas por gênero e faixa etária. Para homens (20-39,9 anos) e mulheres (20-39,9 anos) usa 4 dobras: subescapular, tricipital, suprailíaca oblíqua e panturrilha medial. Para mulheres (18-51 anos) usa: axilar média, suprailíaca, coxa e panturrilha medial.",
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
    "PETROSKI, E.L. Desenvolvimento e validação de equações generalizadas para a estimativa da densidade corporal em adultos. 1995. 180f. Tese (Doutorado em Ciências do Movimento Humano) - Universidade Federal de Santa Maria, Santa Maria, 1995.\nPETROSKI, E.L.; PIRES-NETO, C.S. Desenvolvimento e validação de equações generalizadas para a estimativa da densidade corporal em mulheres. Revista Brasileira de Atividade Física & Saúde, v.1, n.2, p.5-17, 1996.",
  calculate: (skinfolds, gender, age, weight = 0, height = 0) => {
    // Validação inicial
    if (!age || !weight || !height) return 0;

    if (gender === "M") {
      // Petroski (1995) para Homens (20-39,9 anos)
      if (age >= 20 && age < 40) {
        const subscapular = parseFloat(skinfolds.subscapular || "0") || 0;
        const triceps = parseFloat(skinfolds.tricipital || "0") || 0;
        const suprailiac = parseFloat(skinfolds.suprailiac || "0") || 0;
        const calf = parseFloat(skinfolds.calf || "0") || 0;

        const sum = subscapular + triceps + suprailiac + calf;
        if (sum === 0) return 0;

        return (
          1.10726863 -
          0.00081201 * sum +
          0.00000212 * Math.pow(sum, 2) -
          0.00041761 * age
        );
      }
    } else {
      // Petroski (1995) para Mulheres (20-39,9 anos)
      if (age >= 20 && age < 40) {
        const subscapular = parseFloat(skinfolds.subscapular || "0") || 0;
        const triceps = parseFloat(skinfolds.tricipital || "0") || 0;
        const suprailiac = parseFloat(skinfolds.suprailiac || "0") || 0;
        const calf = parseFloat(skinfolds.calf || "0") || 0;

        const sum = subscapular + triceps + suprailiac + calf;
        if (sum === 0) return 0;

        return (
          1.02902361 -
          0.00067159 * sum +
          0.00000242 * Math.pow(sum, 2) -
          0.00026073 * age -
          0.00056009 * weight +
          0.00054649 * height
        );
      }
      // Petroski & Luiz Simões (1996) para Mulheres (18-51 anos)
      else if (age >= 18 && age <= 51) {
        const axillary = parseFloat(skinfolds.axillaryMedian || "0") || 0;
        const suprailiac = parseFloat(skinfolds.suprailiac || "0") || 0;
        const thigh = parseFloat(skinfolds.thigh || "0") || 0;
        const calf = parseFloat(skinfolds.calf || "0") || 0;

        const sum = axillary + suprailiac + thigh + calf;
        if (sum === 0) return 0;

        return (
          1.0346585 -
          0.00063129 * Math.pow(sum, 2) -
          0.000311 * age -
          0.0004889 * weight +
          0.00051345 * height
        );
      }
    }

    return 0; // Retorna 0 se não se encaixar em nenhuma das faixas etárias
  },
};
