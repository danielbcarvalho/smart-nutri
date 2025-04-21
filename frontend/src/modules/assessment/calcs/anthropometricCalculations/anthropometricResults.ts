import { AnthropometricResults, Skinfolds } from "./types";
import {
  calculateBMI,
  getBMIClassification,
  calculateIdealWeightRange,
} from "./basicCalculations";
import {
  calculateWaistHipRatio,
  getWaistHipRiskClassification,
  calculateCMB,
  getCMBClassification,
} from "./bodyRelations";
import {
  calculateBodyDensity,
  calculateBodyFatPercentage,
  getBodyFatClassification,
  calculateFatMass,
  calculateBoneMass,
  calculateResidualWeight,
  calculateMuscleMass,
} from "./bodyComposition";
import { bodyDensityFormulas } from "../formulas";

/**
 * Função mestra que realiza todos os cálculos antropométricos
 * Recebe os dados de medidas e retorna os resultados calculados
 */
export const calculateAnthropometricResults = ({
  gender = "M",
  age = 30,
  weight,
  height,
  skinfolds,
  circumferences,
  boneDiameters,
  bioimpedance,
  skinfoldFormula = "pollock3",
}: {
  gender?: "M" | "F" | undefined;
  age: number;
  weight: number;
  height: number;
  skinfolds: {
    tricipital: number;
    bicipital: number;
    abdominal: number;
    subscapular: number;
    axillaryMedian: number;
    thigh: number;
    thoracic: number;
    suprailiac: number;
    calf: number;
    supraspinal: number;
  };
  circumferences: {
    neck: number;
    waist: number;
    abdomen: number;
    hip: number;
    relaxedArm: number;
    contractedArm: number;
    forearm: number;
    proximalThigh: number;
    medialThigh: number;
    distalThigh: number;
    calf: number;
  };
  boneDiameters: {
    humerus: number;
    wrist: number;
    femur: number;
  };
  bioimpedance: {
    fatPercentage: number;
    fatMass: number;
    muscleMassPercentage: number;
    muscleMass: number;
    fatFreeMass: number;
    boneMass: number;
    visceralFat: number;
    bodyWater: number;
    metabolicAge: number;
  };
  skinfoldFormula?: string;
}): AnthropometricResults => {
  // Resultado padrão com valores vazios
  const results: AnthropometricResults = {
    currentWeight: "",
    currentHeight: "",
    bmi: "",
    bmiClassification: "",
    idealWeightRange: "",
    waistHipRatio: "",
    waistHipRiskClassification: "",
    cmb: "",
    cmbClassification: "",
    bodyFatPercentage: "",
    idealFatPercentage: "",
    bodyFatClassification: "",
    fatMass: "",
    boneMass: "",
    muscleMass: "",
    residualWeight: "",
    fatFreeMass: "",
    skinfoldsSum: "",
    bodyDensity: "",
    referenceUsed: "",
    bioimpedanceBodyFatPercentage: "",
    bioimpedanceIdealFatPercentage: "",
    bioimpedanceBodyFatClassification: "",
    bioimpedanceMuscleMassPercentage: "",
    bioimpedanceMuscleMass: "",
    bioimpedanceBodyWater: "",
    bioimpedanceBoneMass: "",
    bioimpedanceFatMass: "",
    bioimpedanceFatFreeMass: "",
    bioimpedanceVisceralFat: "",
    bioimpedanceMetabolicAge: "",
  };

  // Cálculos básicos de pesos e medidas
  if (!isNaN(weight)) {
    results.currentWeight = `${weight} kg`;
  }

  if (!isNaN(height)) {
    results.currentHeight = `${height} cm`;
  }

  // IMC e classificação
  if (!isNaN(weight) && !isNaN(height)) {
    const bmi = calculateBMI(weight, height);
    results.bmi = bmi.toFixed(1);
    results.bmiClassification = getBMIClassification(bmi, gender);

    // Faixa de peso ideal
    const idealRange = calculateIdealWeightRange(height);
    results.idealWeightRange = `${idealRange.min} a ${idealRange.max} kg`;
  }

  // Relação Cintura/Quadril
  if (
    circumferences &&
    typeof circumferences.waist === "number" &&
    !isNaN(circumferences.waist) &&
    typeof circumferences.hip === "number" &&
    !isNaN(circumferences.hip)
  ) {
    const wcr = calculateWaistHipRatio(
      circumferences.waist,
      circumferences.hip
    );
    results.waistHipRatio = wcr.toFixed(2);
    results.waistHipRiskClassification = getWaistHipRiskClassification(
      wcr,
      gender as "M" | "F",
      age
    );
  }

  // Circunferência Muscular do Braço
  if (
    circumferences &&
    skinfolds &&
    !isNaN(circumferences.relaxedArm) &&
    !isNaN(skinfolds.tricipital)
  ) {
    const cmb = calculateCMB(circumferences.relaxedArm, skinfolds.tricipital);
    results.cmb = `${cmb.toFixed(1)} cm`;
    results.cmbClassification = getCMBClassification(
      cmb,
      gender as "M" | "F",
      age
    );
  }

  // Análises por dobras cutâneas
  // Cálculo da densidade corporal e percentual de gordura
  if (
    skinfolds &&
    Object.values(skinfolds).some((value) => !isNaN(value) && value > 0)
  ) {
    // Convert the numeric skinfolds to the string format expected by calculateBodyDensity
    const skinfoldValues: Record<string, string> = {};
    Object.entries(skinfolds).forEach(([key, value]) => {
      if (!isNaN(value) && value > 0) {
        // Converte número para string conforme esperado pelo tipo Skinfolds
        skinfoldValues[key] = String(value);
      }
    });

    const { density, referenceUsed } = calculateBodyDensity(
      skinfoldValues as Partial<Skinfolds>,
      gender as "M" | "F",
      age,
      skinfoldFormula
    );

    if (density > 0) {
      results.bodyDensity = density.toFixed(4);
      results.referenceUsed = referenceUsed;

      const bodyFatPercentage = calculateBodyFatPercentage(density);

      results.bodyFatPercentage = `${bodyFatPercentage.toFixed(1)}%`;
      results.bodyFatClassification = getBodyFatClassification(
        bodyFatPercentage,
        gender as "M" | "F"
      );

      // Valores ideais de percentual de gordura
      results.idealFatPercentage = gender === "M" ? "10% a 18%" : "18% a 25%";

      // Cálculo das massas
      if (!isNaN(weight)) {
        const fatMass = calculateFatMass(weight, bodyFatPercentage);
        results.fatMass = `${fatMass.toFixed(1)} kg`;

        // Massa livre de gordura (deve ser calculada logo após a massa gorda)
        const fatFreeMass = weight - fatMass;
        results.fatFreeMass = `${fatFreeMass.toFixed(1)} kg`;

        // Peso residual (deve ser calculado antes da massa muscular)
        const residualWeight = calculateResidualWeight(
          weight,
          gender as "M" | "F"
        );
        results.residualWeight = `${residualWeight.toFixed(1)} kg`;

        // Cálculo da massa óssea se tiver diâmetros
        if (
          boneDiameters &&
          !isNaN(boneDiameters.wrist) &&
          !isNaN(boneDiameters.femur) &&
          !isNaN(height)
        ) {
          const boneMass = calculateBoneMass(
            height,
            boneDiameters.wrist,
            boneDiameters.femur
          );
          results.boneMass = `${boneMass.toFixed(1)} kg`;

          // Massa muscular (calculada por último pois depende de todas as outras massas)
          const muscleMass = calculateMuscleMass(
            weight,
            fatMass,
            boneMass,
            residualWeight
          );
          results.muscleMass = `${muscleMass.toFixed(1)} kg`;
        }
      }

      // Somatório de dobras
      const formula = bodyDensityFormulas.find((f) => f.id === skinfoldFormula);
      if (formula) {
        // Pega apenas as dobras do protocolo selecionado
        const protocolSkinfolds = formula.requiredSkinfolds
          .map((fold) => skinfolds[fold as keyof typeof skinfolds] || 0)
          .filter((value) => !isNaN(value) && value > 0);

        if (protocolSkinfolds.length > 0) {
          const sum = protocolSkinfolds.reduce((acc, curr) => acc + curr, 0);
          results.skinfoldsSum = `${sum.toFixed(1)} mm`;
        }
      }
    }
  }

  // Análises por bioimpedância
  if (bioimpedance && !isNaN(bioimpedance.fatPercentage)) {
    results.bioimpedanceBodyFatPercentage = `${bioimpedance.fatPercentage}%`;
    results.bioimpedanceBodyFatClassification = getBodyFatClassification(
      bioimpedance.fatPercentage,
      gender as "M" | "F"
    );
    results.bioimpedanceIdealFatPercentage =
      gender === "M" ? "12% a 18%" : "18% a 25%";
  }

  if (bioimpedance && !isNaN(bioimpedance.muscleMassPercentage)) {
    results.bioimpedanceMuscleMassPercentage = `${bioimpedance.muscleMassPercentage}%`;
  }

  if (bioimpedance && !isNaN(bioimpedance.muscleMass)) {
    results.bioimpedanceMuscleMass = `${bioimpedance.muscleMass} kg`;
  }

  if (bioimpedance && !isNaN(bioimpedance.bodyWater)) {
    results.bioimpedanceBodyWater = `${bioimpedance.bodyWater}%`;
  }

  if (bioimpedance && !isNaN(bioimpedance.boneMass)) {
    results.bioimpedanceBoneMass = `${bioimpedance.boneMass} kg`;
  }

  if (bioimpedance && !isNaN(bioimpedance.fatMass)) {
    results.bioimpedanceFatMass = `${bioimpedance.fatMass} kg`;
  }

  if (bioimpedance && !isNaN(bioimpedance.fatFreeMass)) {
    results.bioimpedanceFatFreeMass = `${bioimpedance.fatFreeMass} kg`;
  }

  if (bioimpedance && !isNaN(bioimpedance.visceralFat)) {
    results.bioimpedanceVisceralFat = bioimpedance.visceralFat.toString();
  }

  if (bioimpedance && !isNaN(bioimpedance.metabolicAge)) {
    results.bioimpedanceMetabolicAge = `${bioimpedance.metabolicAge} anos`;
  }

  return results;
};
