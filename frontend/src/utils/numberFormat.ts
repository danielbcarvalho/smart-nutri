/**
 * Formata um número para exibição, removendo zeros desnecessários após a vírgula
 * @param value - O número a ser formatado
 * @param maxDecimals - Número máximo de casas decimais (padrão: 2)
 * @returns O número formatado como string
 *
 * Exemplos:
 * formatNumber(10.00) -> "10"
 * formatNumber(10.50) -> "10.5"
 * formatNumber(10.55) -> "10.55"
 * formatNumber(10.555) -> "10.56"
 */
export const formatNumber = (
  value: number | string,
  maxDecimals: number = 2
): string => {
  // Converte para número se for string
  const num = typeof value === "string" ? parseFloat(value) : value;

  // Verifica se é um número válido
  if (isNaN(num)) return "0";

  // Formata o número com o número máximo de casas decimais
  const formatted = num.toFixed(maxDecimals);

  // Remove zeros desnecessários após a vírgula
  return formatted.replace(/\.?0+$/, "");
};
