// faulkner.ts
import { BodyDensityFormula, SkinfoldsInput } from "./types"; // Assumindo que SkinfoldsInput é o tipo do parâmetro skinfolds

export const faulknerFormula: BodyDensityFormula = {
  id: "faulkner",
  name: "Faulkner (1968)",
  description:
    "Protocolo de Faulkner que calcula o percentual de gordura diretamente. " +
    "Utiliza 4 dobras cutâneas comuns para ambos os gêneros: " +
    "Tricipital, Subescapular, Abdominal e Supra-ilíaca. " +
    "Fórmula: %G = (Σdobras * 0.153) + 5.783. " +
    "Nota: A densidade corporal é estimada a partir do %G calculado usando a fórmula de Siri invertida.",
  status: "active",
  requiredSkinfolds: ["tricipital", "subscapular", "abdominal", "suprailiac"],
  genderSupport: "both",
  ageRange: {
    min: 18,
    max: 60, // Ajuste conforme validação do protocolo original
  },
  reference:
    "FAULKNER, J.A. (1968). Physiology of swimming and diving. In: H.B. Falls (Ed.), Exercise Physiology. New York: Academic Press.",
  calculate: (skinfolds: SkinfoldsInput) => {
    const triceps = parseFloat(skinfolds.tricipital || "0") || 0;
    const subscap = parseFloat(skinfolds.subscapular || "0") || 0;
    const abdominal = parseFloat(skinfolds.abdominal || "0") || 0;
    const suprailiac = parseFloat(skinfolds.suprailiac || "0") || 0;

    const sum = triceps + subscap + abdominal + suprailiac;
    if (sum <= 0) return NaN;

    // %G = (Σdobras * 0.153) + 5.783
    const bodyFatPercentage = sum * 0.153 + 5.783;

    // Validar %G antes da conversão para densidade
    if (bodyFatPercentage <= 0 || bodyFatPercentage >= 100) {
      // Percentual de gordura fisiologicamente implausível
      return NaN;
    }

    // Convertendo %G para uma fração (ex: 20.5% -> 0.205)
    const bodyFatFraction = bodyFatPercentage / 100;

    // Estimando a densidade corporal a partir do %G usando a fórmula de Siri invertida:
    // %G_Siri = (4.95/DC - 4.5) * 100  =>  DC = 4.95 / ( (%G_Siri / 100) + 4.5 )
    const density = 4.95 / (bodyFatFraction + 4.5);

    if (isNaN(density) || !isFinite(density) || density <= 0) {
      return NaN; // Densidade calculada inválida
    }

    return density;
  },
  getRequiredSkinfolds: () => {
    return ["tricipital", "subscapular", "abdominal", "suprailiac"];
  },
};
