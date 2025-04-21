import { bodyDensityFormulas, validateFormula } from "../formulas";
import { Skinfolds } from "./types";

/**
 * Calcula a densidade corporal usando a fórmula selecionada
 * Fonte: Múltiplas fórmulas disponíveis (Pollock 3 dobras, Guedes, etc)
 * Retorna 0 se a fórmula não for válida ou não houver dados suficientes
 */
export const calculateBodyDensity = (
  skinfolds: Partial<Skinfolds>,
  gender: "M" | "F",
  age: number,
  formulaId: string = "pollock3"
): { density: number; referenceUsed: string } => {
  const formula = bodyDensityFormulas.find((f) => f.id === formulaId);

  if (!formula) {
    return { density: 0, referenceUsed: "-" };
  }

  const validationError = validateFormula(
    formula,
    skinfolds as Skinfolds,
    gender,
    age
  );

  if (validationError) {
    return { density: 0, referenceUsed: "-" };
  }

  const density = formula.calculate(skinfolds as Skinfolds, gender, age);

  return {
    density,
    referenceUsed: `${formula.name}`,
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
 */
export const calculateBoneMass = (
  height: number,
  wristDiameter: number,
  femurDiameter: number
): number => {
  return height * 0.01 * wristDiameter * femurDiameter * 0.18;
};

/**
 * Calcula o peso residual (componente não-gordura, não-músculo, não-osso)
 * Fórmula: Peso residual = Peso total × Percentual residual
 * Percentuais: 24% para homens, 21% para mulheres
 * Fonte: Matiegka J. The testing of physical efficiency. Am J Phys Anthropol. 1921;4:223-230.
 */
export const calculateResidualWeight = (
  weight: number,
  gender: "M" | "F"
): number => {
  const residualPercentage = gender === "M" ? 0.24 : 0.21;
  return weight * residualPercentage;
};

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
