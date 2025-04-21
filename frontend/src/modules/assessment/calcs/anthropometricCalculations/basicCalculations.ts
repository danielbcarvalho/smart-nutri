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
 * Classifica o IMC de acordo com os parâmetros da OMS
 * O parâmetro gender é mantido para futura implementação específica por gênero
 */
export const getBMIClassification = (
  bmi: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
