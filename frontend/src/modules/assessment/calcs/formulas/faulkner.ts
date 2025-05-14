import { BodyDensityFormula } from "./types";

export const faulknerFormula: BodyDensityFormula = {
  id: "faulkner",
  name: "Faulkner (1968)",
  description:
    "Protocolo de Faulkner que calcula o percentual de gordura diretamente, sem passar pela densidade corporal. " +
    "Utiliza 4 dobras cutâneas comuns para ambos os gêneros: " +
    "Tricipital (posterior do braço, ponto médio entre acrômio e olécrano), " +
    "Subescapular (diagonal abaixo do ângulo inferior da escápula), " +
    "Abdominal (vertical, 2cm lateral à cicatriz umbilical) e " +
    "Supra-ilíaca (diagonal acima da crista ilíaca, linha axilar anterior/média). " +
    "Fórmula: %G = (Σdobras * 0,153) + 5,783. " +
    "Nota: Esta fórmula calcula o percentual de gordura diretamente, sem usar densidade corporal.",
  status: "active",
  requiredSkinfolds: ["tricipital", "subscapular", "abdominal", "suprailiac"],
  genderSupport: "both",
  ageRange: {
    min: 18,
    max: 60,
  },
  reference:
    "FAULKNER, J.A. (1968). Physiology of swimming and diving. In: H.B. Falls (Ed.), Exercise Physiology. New York: Academic Press.",
  calculate: (skinfolds) => {
    // Parse das dobras, converte string inválida em 0
    const triceps = parseFloat(skinfolds.tricipital || "0") || 0;
    const subscap = parseFloat(skinfolds.subscapular || "0") || 0;
    const abdominal = parseFloat(skinfolds.abdominal || "0") || 0;
    const suprailiac = parseFloat(skinfolds.suprailiac || "0") || 0;

    // Soma das 4 dobras
    const sum = triceps + subscap + abdominal + suprailiac;
    if (sum <= 0) return NaN;

    // %G = (Σdobras * 0,153) + 5,783
    const bodyFatPercentage = sum * 0.153 + 5.783;

    // Convertendo percentual de gordura para densidade corporal
    // DC = (495 / %G) - 450
    const density = 495 / bodyFatPercentage - 450;

    return density;
  },
  // Função para determinar as dobras requeridas (mesmas para ambos os gêneros)
  getRequiredSkinfolds: () => {
    return ["tricipital", "subscapular", "abdominal", "suprailiac"];
  },
};
