import { Skinfolds } from "../anthropometricCalculations";

export type Gender = "M" | "F";

export type SkinfoldType = keyof Skinfolds;

export type SkinfoldsInput = {
  tricipital: string;
  bicipital: string;
  abdominal: string;
  subscapular: string;
  axillaryMedian: string;
  thigh: string;
  thoracic: string;
  suprailiac: string;
  calf: string;
  supraspinal: string;
};

export interface AgeRange {
  min: number;
  max: number;
}

export interface BodyDensityFormula {
  id: string;
  name: string;
  description: string;
  status: "active" | "coming_soon";
  requiredSkinfolds: SkinfoldType[];
  genderSupport: "both" | "male_only" | "female_only";
  ageRange: AgeRange;
  reference: string;
  calculate: (
    skinfolds: Skinfolds,
    gender: Gender,
    age: number,
    weight?: number,
    height?: number
  ) => number;
  getRequiredSkinfolds?: (gender: string, age: number) => SkinfoldType[];
}

export interface FormulaValidationError {
  type: "gender" | "age" | "missing_skinfolds";
  message: string;
}

export function validateFormula(
  formula: BodyDensityFormula,
  skinfolds: Skinfolds,
  gender: "M" | "F",
  age: number,
  strictValidation: boolean = false
): FormulaValidationError | null {
  // Validar gênero
  if (
    (formula.genderSupport === "male_only" && gender === "F") ||
    (formula.genderSupport === "female_only" && gender === "M")
  ) {
    return {
      type: "gender",
      message: `Esta fórmula é válida apenas para ${
        formula.genderSupport === "male_only" ? "homens" : "mulheres"
      }`,
    };
  }

  // Validar idade (apenas se strictValidation for true)
  if (
    strictValidation &&
    (age < formula.ageRange.min || age > formula.ageRange.max)
  ) {
    return {
      type: "age",
      message: `Esta fórmula é válida apenas para idades entre ${formula.ageRange.min} e ${formula.ageRange.max} anos`,
    };
  }

  // Validar dobras necessárias
  const validSkinfolds = formula.requiredSkinfolds.filter(
    (fold) =>
      skinfolds[fold] &&
      skinfolds[fold] !== "" &&
      parseFloat(skinfolds[fold]) > 0
  );

  // Se não houver nenhuma dobra válida, retorna erro
  if (validSkinfolds.length === 0) {
    return {
      type: "missing_skinfolds",
      message: `É necessário preencher pelo menos uma das dobras: ${formula.requiredSkinfolds.join(
        ", "
      )}`,
    };
  }

  return null;
}
