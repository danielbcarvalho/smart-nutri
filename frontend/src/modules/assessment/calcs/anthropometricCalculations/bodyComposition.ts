import { bodyDensityFormulas, validateFormula } from "../formulas";
import { Skinfolds } from "./types";

/**
 * Faixas de gordura corporal ideais segundo:
 * - ACSM (American College of Sports Medicine)
 * - NSCA (National Strength and Conditioning Association)
 *
 * Valores aproximados e adaptados para faixa etária e nível de atividade física.
 */

type Gender = "M" | "F";
type ActivityLevel = "athlete" | "general";

export function getIdealFatPercentageRange(
  gender: Gender,
  age: number,
  activityLevel: ActivityLevel = "general"
): { min: number; max: number } {
  if (gender === "M") {
    if (activityLevel === "athlete") {
      if (age < 20) return { min: 6, max: 13 };
      if (age < 30) return { min: 6, max: 14 };
      if (age < 40) return { min: 7, max: 15 };
      if (age < 50) return { min: 8, max: 16 };
      return { min: 9, max: 17 };
    } else {
      // general population
      if (age < 20) return { min: 8, max: 17 };
      if (age < 30) return { min: 10, max: 18 };
      if (age < 40) return { min: 11, max: 19 };
      if (age < 50) return { min: 12, max: 20 };
      return { min: 13, max: 22 };
    }
  } else {
    if (activityLevel === "athlete") {
      if (age < 20) return { min: 14, max: 20 };
      if (age < 30) return { min: 15, max: 21 };
      if (age < 40) return { min: 16, max: 22 };
      if (age < 50) return { min: 17, max: 23 };
      return { min: 18, max: 24 };
    } else {
      // general population
      if (age < 20) return { min: 17, max: 25 };
      if (age < 30) return { min: 18, max: 26 };
      if (age < 40) return { min: 19, max: 27 };
      if (age < 50) return { min: 20, max: 28 };
      return { min: 21, max: 30 };
    }
  }
}

/**
 * Calcula a densidade corporal usando a fórmula selecionada
 * Fonte: Múltiplas fórmulas disponíveis (Pollock 3 dobras, Guedes, etc)
 * Retorna 0 se a fórmula não for válida ou não houver dados suficientes
 */
export const calculateBodyDensity = (
  skinfolds: Partial<Skinfolds>,
  gender: "M" | "F",
  age: number,
  formulaId: string = "pollock3",
  weight: number = 0,
  height: number = 0
): { density: number; referenceUsed: string; ageWarning?: string } => {
  console.log("A. Iniciando cálculo de densidade:", {
    skinfolds,
    gender,
    age,
    formulaId,
    weight,
    height,
  });

  const formula = bodyDensityFormulas.find((f) => f.id === formulaId);
  console.log("B. Fórmula encontrada:", formula);

  if (!formula) {
    console.log("C. Fórmula não encontrada");
    return { density: 0, referenceUsed: "-" };
  }

  // Verifica se a idade está fora da faixa recomendada
  const ageWarning =
    age < formula.ageRange.min || age > formula.ageRange.max
      ? `Esta fórmula é recomendada para idades entre ${formula.ageRange.min} e ${formula.ageRange.max} anos`
      : undefined;

  console.log("C. Validando fórmula:", {
    formulaId,
    gender,
    age,
    ageWarning,
    requiredSkinfolds: formula.requiredSkinfolds,
    skinfolds,
  });

  const validationError = validateFormula(
    formula,
    skinfolds as Skinfolds,
    gender,
    age,
    false // Não usar validação estrita de idade
  );
  console.log("D. Erro de validação:", validationError);

  if (validationError) {
    console.log("E. Erro na validação, retornando 0");
    return { density: 0, referenceUsed: "-" };
  }

  const density = formula.calculate(
    skinfolds as Skinfolds,
    gender,
    age,
    weight,
    height
  );
  console.log("F. Densidade calculada:", density);

  return {
    density,
    referenceUsed: `${formula.name}`,
    ageWarning,
  };
};

/**
 * Calcula o percentual de gordura corporal usando a equação de Siri
 * Fórmula: %G = (4.95/D - 4.5) × 100
 * Fonte: Siri WE. Body composition from fluid spaces and density: analysis of methods. In: Brozek J, Henschel A, eds. Techniques for measuring body composition. Washington, DC: National Academy of Sciences, 1961:223-244.
 */
export const calculateBodyFatPercentage = (bodyDensity: number): number => {
  return (4.95 / bodyDensity - 4.5) * 100;
};

/**
 * Classifica o percentual de gordura corporal
 * Fonte: American College of Sports Medicine (ACSM)
 * Referência: ACSM's Guidelines for Exercise Testing and Prescription, 10th Edition
 * Valores de corte específicos por gênero
 */
export const getBodyFatClassification = (
  bodyFatPercentage: number,
  gender: "M" | "F"
): string => {
  if (gender === "M") {
    if (bodyFatPercentage < 6) return "Essencial";
    if (bodyFatPercentage < 14) return "Atlético";
    if (bodyFatPercentage < 18) return "Adequada";
    if (bodyFatPercentage < 25) return "Aceitável";
    return "Obesidade";
  } else {
    if (bodyFatPercentage < 14) return "Essencial";
    if (bodyFatPercentage < 21) return "Atlético";
    if (bodyFatPercentage < 25) return "Fitness";
    if (bodyFatPercentage < 32) return "Aceitável";
    return "Obesidade";
  }
};

/**
 * Calcula a massa de gordura corporal
 * Fórmula: Massa de gordura = Peso total × (%G/100)
 * Fonte: Heyward VH, Wagner DR. Applied Body Composition Assessment, 2nd ed. Champaign, IL: Human Kinetics, 2004.
 */
export const calculateFatMass = (
  weight: number,
  bodyFatPercentage: number
): number => {
  return weight * (bodyFatPercentage / 100);
};

/**
 * Calcula a massa óssea baseada em diâmetros ósseos
 * Fórmula simplificada: Massa óssea = Altura × 0.01 × Diâmetro do punho × Diâmetro do fêmur × 0.18
 * Fonte: Adaptado de Martin AD, Spenst LF, Drinkwater DT, Clarys JP. Anthropometric estimation of muscle mass in men. Med Sci Sports Exerc. 1990;22(5):729-33.
 
export const calculateBoneMass = (
  height: number,
  wristDiameter: number,
  femurDiameter: number
): number => {
  return height * 0.01 * wristDiameter * femurDiameter * 0.18;
};
*/
/**
 * Versão atualizada da função de cálculo de massa óssea utilizando
 * o algoritmo de Matiegka modificado por Drinkwater & Ross que considera o gênero
 */
export function calculateBoneMass(
  height: number,
  wristDiameter: number,
  femurDiameter: number,
  gender: "M" | "F"
): number {
  // Cálculo atualizado considerando gênero
  const factor = gender === "M" ? 1.0 : 0.9;
  const boneMass = height * 0.018 * wristDiameter * femurDiameter * factor;
  return boneMass;
}

/**
 * Calcula o peso residual (componente não-gordura, não-músculo, não-osso)
 * Fórmula: Peso residual = Peso total × Percentual residual
 * Percentuais: 24% para homens, 21% para mulheres
 * Fonte: Matiegka J. The testing of physical efficiency. Am J Phys Anthropol. 1921;4:223-230.
 */
export function calculateResidualWeight(
  weight: number,
  gender: "M" | "F"
): number {
  // Algoritmo de Würch: 24.1% do peso corporal para homens, 20.9% para mulheres
  const residualPercentage = gender === "M" ? 0.241 : 0.209;
  return weight * residualPercentage;
}

/**
 * Calcula a massa muscular
 * Fórmula: Massa muscular = Peso total - Massa de gordura - Massa óssea - Peso residual
 * Fonte: Matiegka J. The testing of physical efficiency. Am J Phys Anthropol. 1921;4:223-230.
 */
export const calculateMuscleMass = (
  weight: number,
  fatMass: number,
  boneMass: number,
  residualWeight: number
): number => {
  return weight - fatMass - boneMass - residualWeight;
};
