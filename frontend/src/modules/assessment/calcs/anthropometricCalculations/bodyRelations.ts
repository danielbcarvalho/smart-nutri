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
    }
  }

  // Caso não se encaixe nas faixas etárias definidas
  return "Não se aplica";
};
