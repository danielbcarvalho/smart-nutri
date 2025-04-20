import { bodyDensityFormulas, validateFormula } from "./formulas";

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
 * Function to get BMI classification, may receive gender parameter but doesn't use it yet
 * Kept for future use if gender-specific classifications are added
 */
export const getBMIClassification = (
  bmi: number,
  _gender?: "M" | "F"
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
    const skinfoldValues: Partial<Skinfolds> = {};
    Object.entries(skinfolds).forEach(([key, value]) => {
      if (!isNaN(value) && value > 0) {
        skinfoldValues[key as keyof Skinfolds] = value;
      }
    });

    const { density, referenceUsed } = calculateBodyDensity(
      skinfoldValues,
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
