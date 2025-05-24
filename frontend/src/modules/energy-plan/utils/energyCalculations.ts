import { EnergyFormula } from "../enums/energy-formulas.enum";

export interface TMBCalculationParams {
  formulaKey: string;
  weightKg: number;
  heightCm: number;
  ageYears: number;
  gender: "male" | "female" | "other";
  fatFreeMassKg?: number;
}

export interface GETCalculationParams {
  tmbKcal: number;
  activityFactorValue: number;
  injuryFactorValue: number;
  additionalMetTotalKcal?: number;
  weightGoalKcalAdjustment?: number;
  additionalPregnancyKcal?: number;
}

export const calculateTMB = (params: TMBCalculationParams): number => {
  const { formulaKey, weightKg, heightCm, ageYears, gender, fatFreeMassKg } =
    params;

  switch (formulaKey) {
    case EnergyFormula.HARRIS_BENEDICT_1984:
      if (gender === "male") {
        return 66.5 + 13.75 * weightKg + 5.003 * heightCm - 6.775 * ageYears;
      } else {
        return 655.1 + 9.563 * weightKg + 1.85 * heightCm - 4.676 * ageYears;
      }

    case EnergyFormula.FAO_WHO_2004:
      if (gender === "male") {
        if (ageYears < 3) return 60.9 * weightKg - 54;
        if (ageYears < 10) return 22.7 * weightKg + 495;
        if (ageYears < 18) return 17.5 * weightKg + 651;
        if (ageYears < 30) return 15.3 * weightKg + 679;
        if (ageYears < 60) return 11.6 * weightKg + 879;
        return 13.5 * weightKg + 487;
      } else {
        if (ageYears < 3) return 61.0 * weightKg - 51;
        if (ageYears < 10) return 22.5 * weightKg + 499;
        if (ageYears < 18) return 12.2 * weightKg + 746;
        if (ageYears < 30) return 14.7 * weightKg + 496;
        if (ageYears < 60) return 8.7 * weightKg + 829;
        return 10.5 * weightKg + 596;
      }

    case EnergyFormula.IOM_EER_2005:
      // IOM EER 2005 formula
      if (gender === "male") {
        if (ageYears < 3) {
          return (
            88.5 - 61.9 * ageYears + 26.7 * weightKg + (903 * heightCm) / 100
          );
        } else if (ageYears < 8) {
          return (
            88.5 - 61.9 * ageYears + 26.7 * weightKg + (903 * heightCm) / 100
          );
        } else if (ageYears < 18) {
          return (
            88.5 - 61.9 * ageYears + 26.7 * weightKg + (903 * heightCm) / 100
          );
        } else if (ageYears < 30) {
          return (
            662 - 9.53 * ageYears + 15.91 * weightKg + (539.6 * heightCm) / 100
          );
        } else if (ageYears < 60) {
          return (
            662 - 9.53 * ageYears + 15.91 * weightKg + (539.6 * heightCm) / 100
          );
        } else {
          return (
            662 - 9.53 * ageYears + 15.91 * weightKg + (539.6 * heightCm) / 100
          );
        }
      } else {
        if (ageYears < 3) {
          return (
            135.3 - 30.8 * ageYears + 10 * weightKg + (934 * heightCm) / 100
          );
        } else if (ageYears < 8) {
          return (
            135.3 - 30.8 * ageYears + 10 * weightKg + (934 * heightCm) / 100
          );
        } else if (ageYears < 18) {
          return (
            135.3 - 30.8 * ageYears + 10 * weightKg + (934 * heightCm) / 100
          );
        } else if (ageYears < 30) {
          return (
            354 - 6.91 * ageYears + 9.36 * weightKg + (726 * heightCm) / 100
          );
        } else if (ageYears < 60) {
          return (
            354 - 6.91 * ageYears + 9.36 * weightKg + (726 * heightCm) / 100
          );
        } else {
          return (
            354 - 6.91 * ageYears + 9.36 * weightKg + (726 * heightCm) / 100
          );
        }
      }

    case EnergyFormula.MIFFLIN_ST_JEOR_1990:
      if (gender === "male") {
        return 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5;
      } else {
        return 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161;
      }

    case EnergyFormula.MIFFLIN_ST_JEOR_MODIFIED_1980:
      if (gender === "male") {
        return (
          10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5 - 0.5 * weightKg
        );
      } else {
        return (
          10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161 - 0.5 * weightKg
        );
      }

    default:
      return 0;
  }
};

export const calculateGET = (params: GETCalculationParams): number => {
  const {
    tmbKcal,
    activityFactorValue,
    injuryFactorValue,
    additionalMetTotalKcal = 0,
    weightGoalKcalAdjustment = 0,
    additionalPregnancyKcal = 0,
  } = params;

  return (
    tmbKcal * activityFactorValue * injuryFactorValue +
    additionalMetTotalKcal +
    weightGoalKcalAdjustment +
    additionalPregnancyKcal
  );
};

export const calculateAge = (
  birthDate: string | Date,
  calculationDate: string | Date
): number => {
  const birth = new Date(birthDate);
  const calc = new Date(calculationDate);
  let age = calc.getFullYear() - birth.getFullYear();
  const monthDiff = calc.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && calc.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};
