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
    max: 30,
  },
  reference:
    "GUEDES, D.P. Estudo da gordura corporal através da mensuração dos valores de densidade corporal e da espessura de dobras cutâneas em universitários. Dissertação de Mestrado, Santa Maria: UFSM, 1985.",
  calculate: (skinfolds, gender) => {
    console.log("Calculando densidade corporal (Guedes):", {
      skinfolds,
      gender,
    });

    if (gender === "M") {
      const chest = parseFloat(skinfolds.thoracic || "0") || 0;
      const abdomen = parseFloat(skinfolds.abdominal || "0") || 0;
      const thigh = parseFloat(skinfolds.thigh || "0") || 0;

      console.log("Dobras para homens:", { chest, abdomen, thigh });

      const sum = chest + abdomen + thigh;
      if (sum === 0) {
        console.log("Soma das dobras é zero para homens");
        return 0;
      }

      const density = 1.17136 - 0.06706 * Math.log10(sum);
      console.log("Densidade calculada para homens:", density);
      return density;
    } else {
      const thigh = parseFloat(skinfolds.thigh || "0") || 0;
      const suprailiac = parseFloat(skinfolds.suprailiac || "0") || 0;
      const subscapular = parseFloat(skinfolds.subscapular || "0") || 0;

      console.log("Dobras para mulheres:", { thigh, suprailiac, subscapular });

      const sum = thigh + suprailiac + subscapular;
      if (sum === 0) {
        console.log("Soma das dobras é zero para mulheres");
        return 0;
      }

      const density = 1.1665 - 0.07063 * Math.log10(sum);
      console.log("Densidade calculada para mulheres:", density);
      return density;
    }
  },
};
