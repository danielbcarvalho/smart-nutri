// anthropometricResults.ts
import { AnthropometricResults, Skinfolds } from "./types";
import {
  calculateBMI,
  getBMIClassification,
  calculateIdealWeightRange,
} from "./basicCalculations";
import {
  calculateWaistHipRatio,
  getWaistHipRiskClassification,
} from "./bodyRelations";
import {
  calculateBodyDensity,
  calculateBodyFatPercentage,
  getBodyFatClassification,
  calculateFatMass,
  calculateBoneMass,
  calculateResidualWeight,
  calculateMuscleMass,
  getIdealFatPercentageRange,
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
  };

  // Validação inicial dos dados
  const validGender = gender as "M" | "F";
  const validWeight = !isNaN(weight) && weight > 0 ? weight : 0;
  const validHeight = !isNaN(height) && height > 0 ? height : 0;

  // Cálculos básicos de pesos e medidas
  if (validWeight) {
    results.currentWeight = `${validWeight.toFixed(1)} kg`;
  }

  if (validHeight) {
    results.currentHeight = `${validHeight.toFixed(1)} cm`;
  }

  // IMC e classificação
  if (validWeight && validHeight) {
    const bmi = calculateBMI(validWeight, validHeight);
    results.bmi = bmi.toFixed(1);
    results.bmiClassification = getBMIClassification(bmi, validGender);

    // Faixa de peso ideal
    const idealRange = calculateIdealWeightRange(validHeight);
    results.idealWeightRange = `${idealRange.min.toFixed(
      1
    )} a ${idealRange.max.toFixed(1)} kg`;
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
      validGender,
      age
    );
  }

  // Análises por dobras cutâneas
  if (
    skinfolds &&
    Object.values(skinfolds).some((value) => !isNaN(value) && value > 0)
  ) {
    // Converte as dobras para o formato esperado
    const skinfoldValues: Record<string, string> = {};
    Object.entries(skinfolds).forEach(([key, value]) => {
      if (!isNaN(value) && value >= 0) {
        skinfoldValues[key] = String(value);
      }
    });

    // Obtém a fórmula selecionada
    const formula = bodyDensityFormulas.find((f) => f.id === skinfoldFormula);

    // Cálculo da densidade corporal
    const { density, referenceUsed } = calculateBodyDensity(
      skinfoldValues as Partial<Skinfolds>,
      validGender,
      age,
      skinfoldFormula
    );

    if (density > 0) {
      results.bodyDensity = density.toFixed(3);
      results.referenceUsed = referenceUsed;

      // Cálculo do percentual de gordura usando a equação de Siri
      const bodyFatPercentage = calculateBodyFatPercentage(density);
      results.bodyFatPercentage = `${bodyFatPercentage.toFixed(1)}%`;

      // Classificação do percentual de gordura
      results.bodyFatClassification = getBodyFatClassification(
        bodyFatPercentage,
        validGender
      );

      // Valores ideais de percentual de gordura baseados em literatura científica
      const idealRange = getIdealFatPercentageRange(validGender, age);
      results.idealFatPercentage = `${idealRange.min}% a ${idealRange.max}%`;

      // Somatório de dobras
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

      // Cálculos de composição corporal
      if (validWeight) {
        // Massa de gordura
        const fatMass = calculateFatMass(validWeight, bodyFatPercentage);
        results.fatMass = `${fatMass.toFixed(1)} kg`;

        // Massa livre de gordura
        const fatFreeMass = validWeight - fatMass;
        results.fatFreeMass = `${fatFreeMass.toFixed(1)} kg`;

        // Peso residual (baseado no gênero)
        const residualWeight = calculateResidualWeight(
          validWeight,
          validGender
        );
        results.residualWeight = `${residualWeight.toFixed(1)} kg`;

        // Cálculo da massa óssea
        if (
          boneDiameters &&
          !isNaN(boneDiameters.wrist) &&
          !isNaN(boneDiameters.femur) &&
          validHeight
        ) {
          // Massa óssea usando diâmetros ósseos
          const boneMass = calculateBoneMass(
            validHeight,
            boneDiameters.wrist,
            boneDiameters.femur,
            validGender
          );
          results.boneMass = `${boneMass.toFixed(1)} kg`;

          // Massa muscular (via método de subtração das outras massas)
          const muscleMass = calculateMuscleMass(
            validWeight,
            fatMass,
            boneMass,
            residualWeight
          );
          results.muscleMass = `${muscleMass.toFixed(1)} kg`;
        }
      }
    }
  }

  return results;
};
