// Funções auxiliares para converter Densidade Corporal (DC) em Percentual de Gordura (%G)
function calcularPercentualGorduraSiri(densidadeCorporal) {
  if (!densidadeCorporal || densidadeCorporal <= 0) return null; // Evita divisão por zero ou NaN
  return (4.95 / densidadeCorporal - 4.5) * 100;
}

function calcularPercentualGorduraBrozek(densidadeCorporal) {
  if (!densidadeCorporal || densidadeCorporal <= 0) return null;
  return (4.57 / densidadeCorporal - 4.142) * 100;
}

// --- Fórmulas de Pollock ---

/**
 * Calcula a Densidade Corporal (DC) usando o protocolo de Pollock 7 dobras.
 * @param {number} somatorio7Dobras - Soma das dobras: Tríceps, Subescapular, Peitoral, Axilar Média, Supraíliaca, Abdominal, Coxa.
 * @param {number} idade - Idade em anos.
 * @param {string} genero - 'M' para masculino, 'F' para feminino.
 * @returns {number|null} Densidade Corporal ou null se os inputs forem inválidos.
 */
function calcularDensidadePollock7(somatorio7Dobras, idade, genero) {
  if (somatorio7Dobras <= 0 || idade <= 0) return null;
  let densidade;
  const s7 = parseFloat(somatorio7Dobras);
  const id = parseFloat(idade);

  if (genero.toUpperCase() === "F") {
    // Mulheres: DC = 1.0970 - 0.00046971*Σ7 + 0.00000056*(Σ7)² - 0.00012828*idade
    densidade =
      1.097 - 0.00046971 * s7 + 0.00000056 * Math.pow(s7, 2) - 0.00012828 * id;
  } else if (genero.toUpperCase() === "M") {
    // Homens: DC = 1.1120 - 0.00043499*Σ7 + 0.00000055*(Σ7)² - 0.00028820*idade
    densidade =
      1.112 - 0.00043499 * s7 + 0.00000055 * Math.pow(s7, 2) - 0.0002882 * id;
  } else {
    return null; // Gênero inválido
  }
  return densidade;
}

/**
 * Calcula a Densidade Corporal (DC) usando o protocolo de Pollock 3 dobras.
 * @param {number} somatorio3Dobras - Soma das 3 dobras específicas para o gênero.
 *                                  Mulheres: Tríceps, Supraíliaca, Coxa.
 *                                  Homens: Peitoral, Abdominal, Coxa.
 * @param {number} idade - Idade em anos.
 * @param {string} genero - 'M' para masculino, 'F' para feminino.
 * @returns {number|null} Densidade Corporal ou null se os inputs forem inválidos.
 */
function calcularDensidadePollock3(somatorio3Dobras, idade, genero) {
  if (somatorio3Dobras <= 0 || idade <= 0) return null;
  let densidade;
  const s3 = parseFloat(somatorio3Dobras);
  const id = parseFloat(idade);

  if (genero.toUpperCase() === "F") {
    // Mulheres: DC = 1.099421 - 0.0009929*Σ3F + 0.0000023*(Σ3F)² - 0.0001392*idade
    densidade =
      1.099421 - 0.0009929 * s3 + 0.0000023 * Math.pow(s3, 2) - 0.0001392 * id;
  } else if (genero.toUpperCase() === "M") {
    // Homens: DC = 1.1093800 - 0.0008267*Σ3M + 0.0000016*(Σ3M)² - 0.0002574*idade
    densidade =
      1.10938 - 0.0008267 * s3 + 0.0000016 * Math.pow(s3, 2) - 0.0002574 * id;
  } else {
    return null; // Gênero inválido
  }
  return densidade;
}

// --- Fórmula de Guedes (1994) ---
/**
 * Calcula a Densidade Corporal (DC) usando o protocolo de Guedes.
 * @param {number} somatorioDobrasGuedes - Soma das dobras específicas para o gênero.
 *                                        Mulheres: Subescapular, Supraíliaca, Coxa.
 *                                        Homens: Triciptal, Supraíliaca, Abdominal.
 * @param {string} genero - 'M' para masculino, 'F' para feminino.
 * @returns {number|null} Densidade Corporal ou null se os inputs forem inválidos.
 */
function calcularDensidadeGuedes(somatorioDobrasGuedes, genero) {
  if (somatorioDobrasGuedes <= 0) return null;
  let densidade;
  const sg = parseFloat(somatorioDobrasGuedes);

  if (genero.toUpperCase() === "F") {
    // Mulheres: DC = 1.16650 - 0.07063 * log10(ΣGuedesF)
    densidade = 1.1665 - 0.07063 * Math.log10(sg);
  } else if (genero.toUpperCase() === "M") {
    // Homens: DC = 1.1714 - 0.0671 * log10(ΣGuedesM)
    densidade = 1.1714 - 0.0671 * Math.log10(sg);
  } else {
    return null; // Gênero inválido
  }
  return densidade;
}

// --- Fórmula de Petroski (1995) ---
/**
 * Calcula a Densidade Corporal (DC) usando o protocolo de Petroski.
 * @param {number} somatorioDobrasPetroski - Soma das dobras específicas para o gênero.
 *                                          Mulheres: Axilar Média, Supraíliaca, Coxa, Panturrilha Medial.
 *                                          Homens: Triciptal, Subescapular, Supraíliaca, Panturrilha Medial.
 * @param {number} idade - Idade em anos.
 * @param {string} genero - 'M' para masculino, 'F' para feminino.
 * @returns {number|null} Densidade Corporal ou null se os inputs forem inválidos.
 */
function calcularDensidadePetroski(somatorioDobrasPetroski, idade, genero) {
  if (somatorioDobrasPetroski <= 0 || idade <= 0) return null;
  let densidade;
  const sp = parseFloat(somatorioDobrasPetroski);
  const id = parseFloat(idade);

  if (genero.toUpperCase() === "F") {
    // Mulheres: DC = 1.19547130 - 0.07513507*log10(ΣPetroskiF) - 0.00041072*idade
    densidade = 1.1954713 - 0.07513507 * Math.log10(sp) - 0.00041072 * id;
  } else if (genero.toUpperCase() === "M") {
    // Homens: DC = 1.10726863 - 0.00081201*ΣPetroskiM + 0.00000212*(ΣPetroskiM)² - 0.00041761*idade
    densidade =
      1.10726863 -
      0.00081201 * sp +
      0.00000212 * Math.pow(sp, 2) -
      0.00041761 * id;
  } else {
    return null; // Gênero inválido
  }
  return densidade;
}

// --- Fórmula de Durnin & Womersley (1974) ---
/**
 * Calcula a Densidade Corporal (DC) usando o protocolo de Durnin & Womersley.
 * @param {number} somatorioDobrasDurnin - Soma das dobras: Bíceps, Tríceps, Subescapular, Supraíliaca.
 * @param {string} genero - 'M' para masculino, 'F' para feminino.
 *                         Nota: As fórmulas originais de D&W têm constantes que variam com a idade.
 *                         Esta implementação usa as fórmulas simplificadas do código original, que podem não cobrir todas as faixas etárias de D&W.
 * @returns {number|null} Densidade Corporal ou null se os inputs forem inválidos.
 */
function calcularDensidadeDurninWomersley(somatorioDobrasDurnin, genero) {
  if (somatorioDobrasDurnin <= 0) return null;
  let densidade;
  const sd = parseFloat(somatorioDobrasDurnin);

  // As fórmulas no código original parecem ser específicas para uma faixa etária
  // ou uma simplificação. As tabelas de Durnin & Womersley são mais complexas,
  // variando constantes com idade e gênero.
  if (genero.toUpperCase() === "F") {
    // Mulheres: DC =  1.1567 - 0.0717 * log10(ΣDurnin)
    densidade = 1.1567 - 0.0717 * Math.log10(sd);
  } else if (genero.toUpperCase() === "M") {
    // Homens: DC =  1.1765 - 0.0744 * log10(ΣDurnin)
    densidade = 1.1765 - 0.0744 * Math.log10(sd);
  } else {
    return null; // Gênero inválido
  }
  return densidade;
}

// --- Fórmula de Faulkner (1968) ---
/**
 * Calcula o Percentual de Gordura (%G) diretamente usando o protocolo de Faulkner.
 * @param {number} somatorioDobrasFaulkner - Soma das dobras: Tríceps, Subescapular, Supraíliaca, Abdominal.
 * @returns {number|null} Percentual de Gordura ou null se o input for inválido.
 */
function calcularPercentualGorduraFaulkner(somatorioDobrasFaulkner) {
  if (somatorioDobrasFaulkner <= 0) return null;
  const sf = parseFloat(somatorioDobrasFaulkner);
  // %G = (ΣFaulkner * 0,153) + 5,783
  return sf * 0.153 + 5.783;
}

// --- EXEMPLOS DE USO ---
console.log("--- Exemplos de Cálculo de Percentual de Gordura ---");

// Dados de exemplo (ajuste conforme necessário)
const idadeExemplo = 30;
const generoExemplo = "M"; // ou 'F'

// Pollock 7 dobras
const soma7PollockExemplo = 100; // Soma das 7 dobras em mm
const dcPollock7 = calcularDensidadePollock7(
  soma7PollockExemplo,
  idadeExemplo,
  generoExemplo
);
if (dcPollock7) {
  const pgPollock7Siri = calcularPercentualGorduraSiri(dcPollock7);
  const pgPollock7Brozek = calcularPercentualGorduraBrozek(dcPollock7);
  console.log(`Pollock 7 (DC): ${dcPollock7.toFixed(4)}`);
  console.log(
    `  %G (Siri): ${pgPollock7Siri ? pgPollock7Siri.toFixed(2) + "%" : "N/A"}`
  );
  console.log(
    `  %G (Brozek): ${
      pgPollock7Brozek ? pgPollock7Brozek.toFixed(2) + "%" : "N/A"
    }`
  );
} else {
  console.log("Pollock 7: Dados de entrada inválidos.");
}

// Pollock 3 dobras (Exemplo para Homem: Peitoral, Abdominal, Coxa)
const soma3PollockExemploM = 60; // Soma das 3 dobras para homens em mm
const dcPollock3M = calcularDensidadePollock3(
  soma3PollockExemploM,
  idadeExemplo,
  "M"
);
if (dcPollock3M) {
  const pgPollock3MSiri = calcularPercentualGorduraSiri(dcPollock3M);
  console.log(
    `Pollock 3 (Homem, DC): ${dcPollock3M.toFixed(4)}, %G (Siri): ${
      pgPollock3MSiri ? pgPollock3MSiri.toFixed(2) + "%" : "N/A"
    }`
  );
}

// Guedes (Exemplo para Mulher: Subescapular, Supraíliaca, Coxa)
const somaGuedesExemploF = 70; // Soma das dobras para Guedes (Mulher)
const dcGuedesF = calcularDensidadeGuedes(somaGuedesExemploF, "F");
if (dcGuedesF) {
  const pgGuedesFSiri = calcularPercentualGorduraSiri(dcGuedesF);
  console.log(
    `Guedes (Mulher, DC): ${dcGuedesF.toFixed(4)}, %G (Siri): ${
      pgGuedesFSiri ? pgGuedesFSiri.toFixed(2) + "%" : "N/A"
    }`
  );
}

// Petroski (Exemplo para Homem)
const somaPetroskiExemploM = 80; // Soma das dobras para Petroski (Homem)
const dcPetroskiM = calcularDensidadePetroski(
  somaPetroskiExemploM,
  idadeExemplo,
  "M"
);
if (dcPetroskiM) {
  const pgPetroskiMSiri = calcularPercentualGorduraSiri(dcPetroskiM);
  console.log(
    `Petroski (Homem, DC): ${dcPetroskiM.toFixed(4)}, %G (Siri): ${
      pgPetroskiMSiri ? pgPetroskiMSiri.toFixed(2) + "%" : "N/A"
    }`
  );
}

// Durnin & Womersley (Exemplo para Mulher)
const somaDurninExemploF = 90; // Soma das dobras para Durnin (Mulher)
const dcDurninF = calcularDensidadeDurninWomersley(somaDurninExemploF, "F");
if (dcDurninF) {
  const pgDurninFSiri = calcularPercentualGorduraSiri(dcDurninF);
  console.log(
    `Durnin & Womersley (Mulher, DC): ${dcDurninF.toFixed(4)}, %G (Siri): ${
      pgDurninFSiri ? pgDurninFSiri.toFixed(2) + "%" : "N/A"
    }`
  );
}

// Faulkner
const somaFaulknerExemplo = 85; // Soma das dobras para Faulkner
const pgFaulkner = calcularPercentualGorduraFaulkner(somaFaulknerExemplo);
if (pgFaulkner) {
  console.log(`Faulkner %G: ${pgFaulkner.toFixed(2)}%`);
} else {
  console.log("Faulkner: Dados de entrada inválidos.");
}
