import { BodyDensityFormula } from "./types";

export const guedesFormula: BodyDensityFormula = {
  id: "guedes",
  name: "Guedes",
  description:
    "Fórmula de Guedes. Para homens: tríceps, suprailíaca e abdominal (paraumbilical). Para mulheres: subescapular, suprailíaca e coxa.",
  status: "active",
  requiredSkinfolds: [
    "tricipital",
    "suprailiac",
    "abdominal",
    "subscapular",
    "thigh",
  ],
  genderSupport: "both",
  ageRange: {
    min: 18,
    max: 60,
  },
  reference:
    "Protocolo Guedes conforme Periodization Online (dobras específicas por sexo; D = 1,17136 - 0,06706 * log10(soma)).",
  calculate: (skinfolds, gender) => {
    const genderUpper = gender?.toUpperCase();
    let sum = 0;

    if (genderUpper === "M") {
      const triceps = parseFloat(skinfolds.tricipital || "0") || 0;
      const suprailiac = parseFloat(skinfolds.suprailiac || "0") || 0;
      const abdominal = parseFloat(skinfolds.abdominal || "0") || 0;
      sum = triceps + suprailiac + abdominal;
    } else if (genderUpper === "F") {
      const subscapular = parseFloat(skinfolds.subscapular || "0") || 0;
      const suprailiac = parseFloat(skinfolds.suprailiac || "0") || 0;
      const thigh = parseFloat(skinfolds.thigh || "0") || 0;
      sum = subscapular + suprailiac + thigh;
    } else {
      return NaN;
    }

    if (sum <= 0) {
      return NaN;
    }

    return 1.17136 - 0.06706 * Math.log10(sum);
  },
};
