/**
 * Formata uma medida caseira para exibição, ajustando o plural/singular baseado na quantidade
 * @param measure - A medida caseira a ser formatada (ex: "Unidade(s) pequena(s)")
 * @param quantity - A quantidade do item
 * @returns A medida formatada (ex: "Unidade pequena" ou "Unidades pequenas")
 *
 * Exemplos:
 * formatMeasure("Unidade(s) pequena(s)", 1) -> "Unidade pequena"
 * formatMeasure("Unidade(s) pequena(s)", 2) -> "Unidades pequenas"
 * formatMeasure("grama(s)", 1) -> "grama"
 * formatMeasure("grama(s)", 2) -> "gramas"
 */
export const formatMeasure = (measure: string, quantity: number): string => {
  // Se a quantidade for 1, remove os (s) e espaços extras
  if (quantity === 1) {
    return measure.replace(/\(s\)/g, "").replace(/\s+/g, " ").trim();
  }

  // Se a quantidade for maior que 1, substitui (s) por s
  return measure.replace(/\(s\)/g, "s").replace(/\s+/g, " ").trim();
};
