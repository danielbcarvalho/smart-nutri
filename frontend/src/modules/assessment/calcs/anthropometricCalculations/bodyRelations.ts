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
