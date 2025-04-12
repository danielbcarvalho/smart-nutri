import { Skinfolds } from "../anthropometricCalculations";

export type Gender = "M" | "F";

export type SkinfoldType = keyof Skinfolds;

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
  calculate: (skinfolds: Skinfolds, gender: Gender, age: number) => number;
}

export interface FormulaValidationError {
  type: "gender" | "age" | "missing_skinfolds";
  message: string;
}

export function validateFormula(
  formula: BodyDensityFormula,
  skinfolds: Skinfolds,
  gender: "M" | "F",
  age: number
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

  // Validar idade
  if (age < formula.ageRange.min || age > formula.ageRange.max) {
    return {
      type: "age",
      message: `Esta fórmula é válida apenas para idades entre ${formula.ageRange.min} e ${formula.ageRange.max} anos`,
    };
  }

  // Validar dobras necessárias
  const missingSkinfolds = formula.requiredSkinfolds.filter(
    (fold) => !skinfolds[fold] || skinfolds[fold] === ""
  );

  if (missingSkinfolds.length > 0) {
    return {
      type: "missing_skinfolds",
      message: `Necessário preencher as dobras: ${missingSkinfolds.join(", ")}`,
    };
  }

  return null;
}
