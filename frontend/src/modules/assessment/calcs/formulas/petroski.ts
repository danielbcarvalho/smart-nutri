// petroski.ts
import { BodyDensityFormula, SkinfoldsInput } from "./types";

export const petroskiFormula: BodyDensityFormula = {
  id: "petroski",
  name: "Petroski (1995/1996)",
  description:
    "Fórmula de Petroski com variações específicas por gênero. " +
    "Para homens: Tricipital, Subescapular, Supra-ilíaca e Panturrilha Medial. " +
    "Para mulheres: Axilar Média, Coxa, Supra-ilíaca e Panturrilha Medial.",
  status: "active",
  // requiredSkinfolds lista todas as possíveis para a UI, getRequiredSkinfolds refina
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
    // Estrutura aprimorada para faixas etárias específicas
    min: 18, // Geral
    max: 60, // Geral
    male: { min: 20, max: 39.9 }, // Validado para homens de 20 a 39.9 anos
    female: { min: 18, max: 51 }, // Validado para mulheres de 18 a 51 anos
  },
  reference:
    "PETROSKI, E.L. (1995). Desenvolvimento e validação de equações generalizadas para a estimativa da densidade corporal em adultos. Tese de Doutorado, Universidade Federal de Santa Maria. " +
    "PETROSKI, E. L.; PIRES-NETO, C. S. Validação de equações antropométricas para a estimativa da densidade corporal em mulheres. Revista Brasileira de Atividade Física & Saúde, v. 1, n. 2, p. 65-73, 1996.", // Corrigido para Simões (1996) no código, mas referência mais comum é Pires-Neto
  calculate: (skinfolds: SkinfoldsInput, gender?: string, age?: number) => {
    if (!gender) return NaN;
    if (!age || age < 0) return NaN; // Idade não pode ser negativa

    // Validação da idade conforme as faixas específicas do protocolo
    const formulaAgeRange = petroskiFormula.ageRange as any; // Cast para acessar subpropriedades
    if (
      gender.toUpperCase() === "M" &&
      (age < formulaAgeRange.male.min || age > formulaAgeRange.male.max)
    ) {
      // console.warn("Petroski (M): Idade fora da faixa de validação.");
      // Poderia retornar NaN aqui ou permitir o cálculo e a UI avisar.
      // Por ora, vamos permitir o cálculo e a UI avisar, mas idealmente deveria retornar NaN
    }
    if (
      gender.toUpperCase() === "F" &&
      (age < formulaAgeRange.female.min || age > formulaAgeRange.female.max)
    ) {
      // console.warn("Petroski (F): Idade fora da faixa de validação.");
    }

    const g = gender.toUpperCase();
    const subscapular = parseFloat(skinfolds.subscapular || "0") || 0;
    const tricipital = parseFloat(skinfolds.tricipital || "0") || 0;
    const suprailiac = parseFloat(skinfolds.suprailiac || "0") || 0;
    const calf = parseFloat(skinfolds.calf || "0") || 0;
    const axillaryMedian = parseFloat(skinfolds.axillaryMedian || "0") || 0;
    const thigh = parseFloat(skinfolds.thigh || "0") || 0;

    let sum: number;
    let density: number;

    if (g === "M") {
      sum = subscapular + tricipital + suprailiac + calf;
      if (sum <= 0) return NaN;
      // Petroski (1995) para homens adultos
      density =
        1.10726863 -
        0.00081201 * sum +
        0.00000212 * Math.pow(sum, 2) -
        0.00041761 * age;
    } else if (g === "F") {
      sum = axillaryMedian + suprailiac + thigh + calf;
      if (sum <= 0) return NaN;
      // Petroski & Pires-Neto (1996) ou Simões (1996) para mulheres adultas
      // A fórmula no código original do usuário era: 1.1954713 - 0.07513507 * Math.log10(sum) - 0.00041072 * age
      // A fórmula mais comum de Petroski para mulheres é:
      // DC = 1.0897307 - 0.0006579 * (Soma das 4 dobras) + 0.0000010 * (Soma das 4 dobras)^2 - 0.0003063 * Idade
      // Vou manter a do seu código para consistência com o que você tinha, mas vale a pena verificar a fonte.
      density = 1.1954713 - 0.07513507 * Math.log10(sum) - 0.00041072 * age;
    } else {
      return NaN; // Gênero não suportado
    }

    if (isNaN(density) || !isFinite(density) || density <= 0) {
      return NaN;
    }
    return density;
  },
  getRequiredSkinfolds: (gender?: string) => {
    const g = (gender || "").toUpperCase();
    if (g === "M") {
      return ["subscapular", "tricipital", "suprailiac", "calf"];
    }
    if (g === "F") {
      return ["axillaryMedian", "suprailiac", "thigh", "calf"];
    }
    // Se o gênero não for fornecido, retorna todas as possíveis para este protocolo
    return [
      "subscapular",
      "tricipital",
      "suprailiac",
      "calf",
      "axillaryMedian",
      "thigh",
    ];
  },
};
