import { BodyDensityFormula } from "./types";

export const guedesFormula: BodyDensityFormula = {
  id: "guedes",
  name: "Guedes (1985)",
  description:
    "Fórmula de Guedes desenvolvida para a população brasileira. Para homens: peitoral, abdômen e coxa. Para mulheres: coxa, suprailíaca e subescapular.",
  status: "active",
  requiredSkinfolds: [
    "thoracic",
    "abdominal",
    "thigh",
    "suprailiac",
    "subscapular",
  ],
  genderSupport: "both",
  ageRange: {
    min: 17,
    max: 27,
  },
  reference:
    "GUEDES, D.P. Estudo da gordura corporal através da mensuração dos valores de densidade corporal e da espessura de dobras cutâneas em universitários. Dissertação de Mestrado, Santa Maria: UFSM, 1985.",
  calculate: (skinfolds, gender) => {
    if (gender === "M") {
      const chest = parseFloat(skinfolds.thoracic || "0");
      const abdomen = parseFloat(skinfolds.abdominal || "0");
      const thigh = parseFloat(skinfolds.thigh || "0");

      return 1.17136 - 0.06706 * Math.log10(chest + abdomen + thigh);
    } else {
      const thigh = parseFloat(skinfolds.thigh || "0");
      const suprailiac = parseFloat(skinfolds.suprailiac || "0");
      const subscapular = parseFloat(skinfolds.subscapular || "0");

      return 1.1665 - 0.07063 * Math.log10(thigh + suprailiac + subscapular);
    }
  },
};
