export const FORMULA_DESCRIPTIONS = {
  harris_benedict_1984: {
    name: "Harris-Benedict (1984)",
    description:
      "Fórmula clássica para cálculo de TMB, baseada em estudos de 1919 revisados em 1984.",
    formula: {
      male: "TMB = 66.5 + (13.75 × peso) + (5.003 × altura) - (6.775 × idade)",
      female:
        "TMB = 655.1 + (9.563 × peso) + (1.850 × altura) - (4.676 × idade)",
    },
  },
  fao_who_2004: {
    name: "FAO/OMS (2004)",
    description:
      "Fórmula recomendada pela FAO/OMS para diferentes faixas etárias.",
    formula: {
      male: "Varia conforme idade:\n0-3 anos: 60.9 × peso - 54\n3-10 anos: 22.7 × peso + 495\n10-18 anos: 17.5 × peso + 651\n18-30 anos: 15.3 × peso + 679\n30-60 anos: 11.6 × peso + 879\n>60 anos: 13.5 × peso + 487",
      female:
        "Varia conforme idade:\n0-3 anos: 61.0 × peso - 51\n3-10 anos: 22.5 × peso + 499\n10-18 anos: 12.2 × peso + 746\n18-30 anos: 14.7 × peso + 496\n30-60 anos: 8.7 × peso + 829\n>60 anos: 10.5 × peso + 596",
    },
  },
  iom_eer_2005: {
    name: "IOM EER (2005)",
    description:
      "Fórmula do Institute of Medicine para estimativa de gasto energético.",
    formula: {
      male: "Varia conforme idade e inclui ajustes para atividade física.",
      female: "Varia conforme idade e inclui ajustes para atividade física.",
    },
  },
  mifflin_st_jeor_1990: {
    name: "Mifflin-St Jeor (1990)",
    description: "Fórmula moderna e precisa para cálculo de TMB em adultos.",
    formula: {
      male: "TMB = (10 × peso) + (6.25 × altura) - (5 × idade) + 5",
      female: "TMB = (10 × peso) + (6.25 × altura) - (5 × idade) - 161",
    },
  },
  mifflin_st_jeor_modified_1980: {
    name: "Mifflin-St Jeor Modificada (1980)",
    description: "Versão adaptada para indivíduos com sobrepeso ou obesidade.",
    formula: {
      male: "TMB = (10 × peso) + (6.25 × altura) - (5 × idade) + 5 - (0.5 × peso)",
      female:
        "TMB = (10 × peso) + (6.25 × altura) - (5 × idade) - 161 - (0.5 × peso)",
    },
  },
};

export const ACTIVITY_FACTOR_DESCRIPTIONS = {
  "1.200": {
    name: "Sedentário",
    description: "Pouca ou nenhuma atividade física diária",
  },
  "1.375": {
    name: "Pouco ativo",
    description: "Atividade física leve 1-3 dias por semana",
  },
  "1.550": {
    name: "Ativo",
    description: "Atividade física moderada 3-5 dias por semana",
  },
  "1.725": {
    name: "Muito ativo",
    description: "Atividade física intensa 6-7 dias por semana",
  },
  "1.900": {
    name: "Atlético",
    description:
      "Atividade física muito intensa diária ou trabalho físico pesado",
  },
};

export const INJURY_FACTOR_DESCRIPTIONS = {
  "1.000": {
    name: "Saudável",
    description: "Sem lesões ou condições especiais",
  },
  "1.200": {
    name: "Pós-operatório simples",
    description: "Recuperação de cirurgia simples",
  },
  "1.350": {
    name: "Trauma moderado",
    description: "Lesões ou traumas moderados",
  },
  "1.500": {
    name: "Infecção grave",
    description: "Infecções graves ou queimaduras",
  },
};
