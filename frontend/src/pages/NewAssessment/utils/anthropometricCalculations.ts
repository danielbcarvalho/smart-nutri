// Tipos para dados antropométricos
export interface BasicData {
  weight: string;
  height: string;
  sittingHeight: string;
  kneeHeight: string;
}

export interface Circumferences {
  neck: string;
  shoulder: string;
  chest: string;
  waist: string;
  abdomen: string;
  hip: string;
  relaxedArm: string;
  contractedArm: string;
  forearm: string;
  proximalThigh: string;
  medialThigh: string;
  distalThigh: string;
  calf: string;
}

export interface Skinfolds {
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
}

export interface BoneDiameters {
  humerus: string;
  wrist: string;
  femur: string;
}

export interface Bioimpedance {
  fatPercentage: string;
  fatMass: string;
  muscleMassPercentage: string;
  muscleMass: string;
  fatFreeMass: string;
  boneMass: string;
  visceralFat: string;
  bodyWater: string;
  metabolicAge: string;
}

export interface AnthropometricResults {
  // Análises de pesos e medidas
  currentWeight: string;
  currentHeight: string;
  bmi: string;
  bmiClassification: string;
  idealWeightRange: string;
  waistHipRatio: string;
  waistHipRiskClassification: string;
  cmb: string;
  cmbClassification: string;

  // Análises por dobras e diâmetro ósseo
  bodyFatPercentage: string;
  idealFatPercentage: string;
  bodyFatClassification: string;
  fatMass: string;
  boneMass: string;
  muscleMass: string;
  residualWeight: string;
  fatFreeMass: string;
  skinfoldsSum: string;
  bodyDensity: string;
  referenceUsed: string;

  // Análises por bioimpedância
  bioimpedanceBodyFatPercentage: string;
  bioimpedanceIdealFatPercentage: string;
  bioimpedanceBodyFatClassification: string;
  bioimpedanceMuscleMassPercentage: string;
  bioimpedanceMuscleMass: string;
  bioimpedanceBodyWater: string;
  bioimpedanceBoneMass: string;
  bioimpedanceFatMass: string;
  bioimpedanceFatFreeMass: string;
  bioimpedanceVisceralFat: string;
  bioimpedanceMetabolicAge: string;
}

/**
 * Calcula o Índice de Massa Corporal (IMC)
 * Fórmula: IMC = peso (kg) / altura² (m)
 * Fonte: Organização Mundial da Saúde (OMS)
 * Referência: WHO. Physical status: the use and interpretation of anthropometry. Geneva: WHO, 1995.
 */
export const calculateBMI = (weight: number, heightCm: number): number => {
  const heightM = heightCm / 100;
  return weight / (heightM * heightM);
};

/**
 * Classifica o IMC segundo os critérios da OMS
 * Fonte: Organização Mundial da Saúde (OMS)
 * Referência: WHO. Physical status: the use and interpretation of anthropometry. Geneva: WHO, 1995.
 * Classificação:
 * < 18.5: Abaixo do peso
 * 18.5 - 24.9: Peso adequado
 * 25.0 - 29.9: Sobrepeso
 * 30.0 - 34.9: Obesidade grau I
 * 35.0 - 39.9: Obesidade grau II
 * ≥ 40.0: Obesidade grau III
 */
export const getBMIClassification = (
  bmi: number,
  gender?: "M" | "F"
): string => {
  if (bmi < 18.5) {
    return "Abaixo do peso";
  } else if (bmi >= 18.5 && bmi < 25) {
    return "Peso adequado";
  } else if (bmi >= 25 && bmi < 30) {
    return "Sobrepeso";
  } else if (bmi >= 30 && bmi < 35) {
    return "Obesidade grau I";
  } else if (bmi >= 35 && bmi < 40) {
    return "Obesidade grau II";
  } else {
    return "Obesidade grau III";
  }
};

/**
 * Calcula a faixa de peso ideal baseada no IMC
 * Utiliza os limites de IMC da OMS para peso adequado (18.5 - 24.9)
 * Fórmula: Peso = IMC × altura² (m)
 * Fonte: Organização Mundial da Saúde (OMS)
 */
export const calculateIdealWeightRange = (
  heightCm: number
): { min: number; max: number } => {
  const heightM = heightCm / 100;
  const minBMI = 18.5;
  const maxBMI = 24.9;

  return {
    min: parseFloat((minBMI * heightM * heightM).toFixed(1)),
    max: parseFloat((maxBMI * heightM * heightM).toFixed(1)),
  };
};

/**
 * Calcula a Relação Cintura/Quadril (RCQ)
 * Fórmula: RCQ = circunferência da cintura (cm) / circunferência do quadril (cm)
 * Fonte: Organização Mundial da Saúde (OMS)
 * Referência: WHO. Waist circumference and waist-hip ratio: report of a WHO expert consultation. Geneva: WHO, 2008.
 */
export const calculateWaistHipRatio = (
  waistCm: number,
  hipCm: number
): number => {
  return waistCm / hipCm;
};

/**
 * Classifica o risco metabólico baseado na RCQ
 * Fonte: Organização Mundial da Saúde (OMS)
 * Referência: WHO. Waist circumference and waist-hip ratio: report of a WHO expert consultation. Geneva: WHO, 2008.
 * Valores de corte específicos por gênero e faixa etária
 */
export const getWaistHipRiskClassification = (
  wcr: number,
  gender: "M" | "F",
  age: number
): string => {
  if (gender === "M") {
    if (age < 40) {
      if (wcr < 0.83) return "Baixo";
      if (wcr < 0.89) return "Moderado";
      if (wcr < 0.94) return "Alto";
      return "Muito alto";
    } else if (age < 60) {
      if (wcr < 0.84) return "Baixo";
      if (wcr < 0.91) return "Moderado";
      if (wcr < 0.96) return "Alto";
      return "Muito alto";
    } else {
      if (wcr < 0.88) return "Baixo";
      if (wcr < 0.95) return "Moderado";
      if (wcr < 1.0) return "Alto";
      return "Muito alto";
    }
  } else {
    // Feminino
    if (age < 40) {
      if (wcr < 0.71) return "Baixo";
      if (wcr < 0.78) return "Moderado";
      if (wcr < 0.82) return "Alto";
      return "Muito alto";
    } else if (age < 60) {
      if (wcr < 0.72) return "Baixo";
      if (wcr < 0.79) return "Moderado";
      if (wcr < 0.84) return "Alto";
      return "Muito alto";
    } else {
      if (wcr < 0.73) return "Baixo";
      if (wcr < 0.8) return "Moderado";
      if (wcr < 0.87) return "Alto";
      return "Muito alto";
    }
  }
};

/**
 * Calcula a Circunferência Muscular do Braço (CMB)
 * Fórmula: CMB = Circunferência do braço - (π × Dobra cutânea tricipital)
 * Fonte: Frisancho AR. New norms of upper limb fat and muscle areas for assessment of nutritional status. Am J Clin Nutr. 1981;34(11):2540-5.
 * Nota: A dobra cutânea é convertida de mm para cm antes do cálculo
 */
export const calculateCMB = (
  armCircumferenceCm: number,
  tricepsSkinFoldMm: number
): number => {
  // Converte dobra cutânea de mm para cm
  const tricepsSkinFoldCm = tricepsSkinFoldMm / 10;

  // Fórmula: CMB = Circunferência do braço - (π * Dobra cutânea tricipital)
  return armCircumferenceCm - Math.PI * tricepsSkinFoldCm;
};

/**
 * Classifica a CMB baseada em tabelas de referência
 * Fonte: Frisancho AR. New norms of upper limb fat and muscle areas for assessment of nutritional status. Am J Clin Nutr. 1981;34(11):2540-5.
 * Valores de corte específicos por gênero e faixa etária
 */
export const getCMBClassification = (
  cmb: number,
  gender: "M" | "F",
  age: number
): string => {
  console.log("🚀 ~ anthropometricCalculations.ts:205 ~ age 🚀🚀🚀:", age);
  // Classificação para homens
  if (gender === "M") {
    if (age >= 20 && age < 30) {
      if (cmb < 20.0) return "Muito baixo";
      if (cmb < 24.0) return "Baixo";
      if (cmb < 28.0) return "Adequado";
      if (cmb < 32.0) return "Alto";
      return "Muito alto";
    } else if (age >= 30 && age < 40) {
      if (cmb < 19.5) return "Muito baixo";
      if (cmb < 23.5) return "Baixo";
      if (cmb < 27.5) return "Adequado";
      if (cmb < 31.5) return "Alto";
      return "Muito alto";
    } else if (age >= 40 && age < 50) {
      if (cmb < 19.0) return "Muito baixo";
      if (cmb < 23.0) return "Baixo";
      if (cmb < 27.0) return "Adequado";
      if (cmb < 31.0) return "Alto";
      return "Muito alto";
    } else if (age >= 50) {
      if (cmb < 18.5) return "Muito baixo";
      if (cmb < 22.5) return "Baixo";
      if (cmb < 26.5) return "Adequado";
      if (cmb < 30.5) return "Alto";
      return "Muito alto";
    }
  }
  // Classificação para mulheres
  else {
    if (age >= 20 && age < 30) {
      if (cmb < 15.0) return "Muito baixo";
      if (cmb < 19.0) return "Baixo";
      if (cmb < 23.0) return "Adequado";
      if (cmb < 27.0) return "Alto";
      return "Muito alto";
    } else if (age >= 30 && age < 40) {
      if (cmb < 14.5) return "Muito baixo";
      if (cmb < 18.5) return "Baixo";
      if (cmb < 22.5) return "Adequado";
      if (cmb < 26.5) return "Alto";
      return "Muito alto";
    } else if (age >= 40 && age < 50) {
      if (cmb < 14.0) return "Muito baixo";
      if (cmb < 18.0) return "Baixo";
      if (cmb < 22.0) return "Adequado";
      if (cmb < 26.0) return "Alto";
      return "Muito alto";
    } else if (age >= 50) {
      if (cmb < 13.5) return "Muito baixo";
      if (cmb < 17.5) return "Baixo";
      if (cmb < 21.5) return "Adequado";
      if (cmb < 25.5) return "Alto";
      return "Muito alto";
    } else {
      return "Não se aplica";
    }
  }
};

/**
 * Calcula a densidade corporal usando a equação de Pollock 3 dobras
 * Fonte: Pollock ML, Schmidt DH, Jackson AS. Measurement of cardiorespiratory fitness and body composition in the clinical setting. Compr Ther. 1980;6(9):12-27.
 * Fórmulas:
 * Homens: D = 1.10938 - 0.0008267(X) + 0.0000016(X²) - 0.0002574(idade)
 * Mulheres: D = 1.0994921 - 0.0009929(X) + 0.0000023(X²) - 0.0001392(idade)
 * Onde X é a soma das dobras cutâneas (peitoral, abdominal e coxa para homens; tríceps, suprailíaca e coxa para mulheres)
 */
export const calculateBodyDensity = (
  skinfolds: Partial<Skinfolds>,
  gender: "M" | "F",
  age: number,
  formula: string = "pollock3"
): number => {
  // Implementação para Pollock 3 dobras
  if (formula === "pollock3") {
    const chest = parseFloat(skinfolds.thoracic || "0");
    const abdomen = parseFloat(skinfolds.abdominal || "0");
    const thigh = parseFloat(skinfolds.thigh || "0");
    const triceps = parseFloat(skinfolds.tricipital || "0");
    const suprailiac = parseFloat(skinfolds.suprailiac || "0");

    const sumSkinfolds =
      gender === "M" ? chest + abdomen + thigh : triceps + suprailiac + thigh;

    if (gender === "M") {
      return (
        1.10938 -
        0.0008267 * sumSkinfolds +
        0.0000016 * sumSkinfolds * sumSkinfolds -
        0.0002574 * age
      );
    } else {
      return (
        1.0994921 -
        0.0009929 * sumSkinfolds +
        0.0000023 * sumSkinfolds * sumSkinfolds -
        0.0001392 * age
      );
    }
  }

  // Implemente outras fórmulas conforme necessário
  return 0;
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

/**
 * Função mestra que realiza todos os cálculos antropométricos
 * Integra todas as medidas e fórmulas para gerar um relatório completo
 * Utiliza as seguintes fontes:
 * - OMS para IMC e RCQ
 * - Pollock para densidade corporal
 * - Siri para percentual de gordura
 * - Frisancho para CMB
 * - Matiegka para composição corporal
 */
export const calculateAnthropometricResults = (
  basicData: BasicData,
  circumferences: Circumferences,
  skinfolds: Skinfolds,
  boneDiameters: BoneDiameters,
  bioimpedance: Bioimpedance,
  gender: "M" | "F" = "M",
  age: number = 30,
  skinfoldFormula: string = "pollock3"
): AnthropometricResults => {
  // Valores padrão para resultados
  const results: AnthropometricResults = {
    currentWeight: "-",
    currentHeight: "-",
    bmi: "-",
    bmiClassification: "-",
    idealWeightRange: "-",
    waistHipRatio: "-",
    waistHipRiskClassification: "-",
    cmb: "-",
    cmbClassification: "-",
    bodyFatPercentage: "-",
    idealFatPercentage: "-",
    bodyFatClassification: "-",
    fatMass: "-",
    boneMass: "-",
    muscleMass: "-",
    residualWeight: "-",
    fatFreeMass: "-",
    skinfoldsSum: "-",
    bodyDensity: "-",
    referenceUsed: skinfoldFormula === "pollock3" ? "Pollock 3, 1978" : "-",
    bioimpedanceBodyFatPercentage: "-",
    bioimpedanceIdealFatPercentage: "-",
    bioimpedanceBodyFatClassification: "-",
    bioimpedanceMuscleMassPercentage: "-",
    bioimpedanceMuscleMass: "-",
    bioimpedanceBodyWater: "-",
    bioimpedanceBoneMass: "-",
    bioimpedanceFatMass: "-",
    bioimpedanceFatFreeMass: "-",
    bioimpedanceVisceralFat: "-",
    bioimpedanceMetabolicAge: "-",
  };

  // Cálculos básicos de pesos e medidas
  const weight = parseFloat(basicData.weight);
  const height = parseFloat(basicData.height);

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
  const waist = parseFloat(circumferences.waist);
  const hip = parseFloat(circumferences.hip);

  if (!isNaN(waist) && !isNaN(hip)) {
    const wcr = calculateWaistHipRatio(waist, hip);
    results.waistHipRatio = wcr.toFixed(2);
    results.waistHipRiskClassification = getWaistHipRiskClassification(
      wcr,
      gender,
      age
    );
  }

  // Circunferência Muscular do Braço
  const relaxedArm = parseFloat(circumferences.relaxedArm);
  const triceps = parseFloat(skinfolds.tricipital);

  if (!isNaN(relaxedArm) && !isNaN(triceps)) {
    const cmb = calculateCMB(relaxedArm, triceps);
    results.cmb = `${cmb.toFixed(1)} cm`;
    results.cmbClassification = getCMBClassification(cmb, gender, age);
  }

  // Análises por dobras cutâneas
  // Cálculo da densidade corporal e percentual de gordura
  if (Object.values(skinfolds).some((value) => value !== "")) {
    const density = calculateBodyDensity(
      skinfolds,
      gender,
      age,
      skinfoldFormula
    );

    if (density > 0) {
      results.bodyDensity = density.toFixed(4);

      const bodyFatPercentage = calculateBodyFatPercentage(density);
      results.bodyFatPercentage = `${bodyFatPercentage.toFixed(1)}%`;
      results.bodyFatClassification = getBodyFatClassification(
        bodyFatPercentage,
        gender
      );

      // Valores ideais de percentual de gordura
      results.idealFatPercentage = gender === "M" ? "12% a 18%" : "18% a 25%";

      // Cálculo das massas
      if (!isNaN(weight)) {
        const fatMass = calculateFatMass(weight, bodyFatPercentage);
        results.fatMass = `${fatMass.toFixed(1)} kg`;

        // Cálculo da massa óssea se tiver diâmetros
        const wristDiameter = parseFloat(boneDiameters.wrist);
        const femurDiameter = parseFloat(boneDiameters.femur);

        if (!isNaN(wristDiameter) && !isNaN(femurDiameter) && !isNaN(height)) {
          const boneMass = calculateBoneMass(
            height,
            wristDiameter,
            femurDiameter
          );
          results.boneMass = `${boneMass.toFixed(1)} kg`;

          // Peso residual
          const residualWeight = calculateResidualWeight(weight, gender);
          results.residualWeight = `${residualWeight.toFixed(1)} kg`;

          // Massa muscular
          const muscleMass = calculateMuscleMass(
            weight,
            fatMass,
            boneMass,
            residualWeight
          );
          results.muscleMass = `${muscleMass.toFixed(1)} kg`;

          // Massa livre de gordura
          const fatFreeMass = weight - fatMass;
          results.fatFreeMass = `${fatFreeMass.toFixed(1)} kg`;
        }
      }

      // Somatório de dobras
      const validSkinfolds = Object.values(skinfolds)
        .filter((v) => v !== "")
        .map((v) => parseFloat(v));
      if (validSkinfolds.length > 0) {
        const sum = validSkinfolds.reduce((acc, curr) => acc + curr, 0);
        results.skinfoldsSum = `${sum.toFixed(1)} mm`;
      }
    }
  }

  // Análises por bioimpedância
  if (bioimpedance.fatPercentage) {
    const fatPercentage = parseFloat(bioimpedance.fatPercentage);
    results.bioimpedanceBodyFatPercentage = `${fatPercentage}%`;
    results.bioimpedanceBodyFatClassification = getBodyFatClassification(
      fatPercentage,
      gender
    );
    results.bioimpedanceIdealFatPercentage =
      gender === "M" ? "12% a 18%" : "18% a 25%";
  }

  if (bioimpedance.muscleMassPercentage) {
    results.bioimpedanceMuscleMassPercentage = `${bioimpedance.muscleMassPercentage}%`;
  }

  if (bioimpedance.muscleMass) {
    results.bioimpedanceMuscleMass = `${bioimpedance.muscleMass} kg`;
  }

  if (bioimpedance.bodyWater) {
    results.bioimpedanceBodyWater = `${bioimpedance.bodyWater}%`;
  }

  if (bioimpedance.boneMass) {
    results.bioimpedanceBoneMass = `${bioimpedance.boneMass} kg`;
  }

  if (bioimpedance.fatMass) {
    results.bioimpedanceFatMass = `${bioimpedance.fatMass} kg`;
  }

  if (bioimpedance.fatFreeMass) {
    results.bioimpedanceFatFreeMass = `${bioimpedance.fatFreeMass} kg`;
  }

  if (bioimpedance.visceralFat) {
    results.bioimpedanceVisceralFat = bioimpedance.visceralFat;
  }

  if (bioimpedance.metabolicAge) {
    results.bioimpedanceMetabolicAge = `${bioimpedance.metabolicAge} anos`;
  }

  return results;
};
