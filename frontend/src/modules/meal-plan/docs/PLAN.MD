Conceito Principal: Transformar a seção "Análise de Nutrientes" em um "Painel Comparativo: Plano Alimentar vs. Metas Energéticas".
Ideias Visuais e Funcionais:
Resumo Calórico Comparativo:
Visual: Uma barra de progresso horizontal ou um "gauge" (medidor).
Funcionamento:
A "meta" seria o GET (Gasto Energético Total) calculado no Plano Energético.
O "valor atual" seriam as calorias totais do Plano Alimentar.
Exibir claramente:
Calorias Prescritas: XXXX Kcal
Meta Calórica (GET): YYYY Kcal
Diferença: +/- ZZZ Kcal (com cor indicativa: verde se próximo da meta, amarelo se um pouco distante, vermelho se muito distante ou na direção oposta da meta – ex: superávit quando o objetivo é déficit).
Percentual da meta atingida: XX%
Comparativo de Macronutrientes (Grama a Grama):
Visual: Usar "Bullet Graphs" para cada macronutriente (Proteínas, Carboidratos, Lipídios). Bullet graphs são ótimos para comparar um valor atual com uma meta e faixas de desempenho.
Funcionamento (para cada macro):
Barra principal: Gramas do macronutriente no Plano Alimentar.
Marcador vertical (target line): Gramas do macronutriente definidas como meta no Plano Energético.
Faixas de fundo (opcional, mas recomendado): Poderiam representar as faixas de referência (ex: para Proteínas, a meta é 20% do VET, mas a faixa de referência é 10-35%. Essas faixas convertidas para gramas poderiam ser o fundo).
Texto: "Prescrito: Xg / Meta: Yg" ao lado ou abaixo de cada gráfico.
Distribuição Percentual de Macronutrientes (Comparativo VET%):
Visual: Manter o gráfico de rosca (donut chart) atual para o Plano Alimentar. Ao lado de cada item da legenda, ou diretamente no gráfico (se não poluir), adicionar a meta percentual.
Funcionamento:
O gráfico de rosca exibe as porcentagens de Proteínas, Carboidratos e Lipídios do Plano Alimentar atual.
Legenda/Texto:
Proteínas: AA% (Meta: BB%)
Carboidratos: CC% (Meta: DD%)
Lipídios: EE% (Meta: FF%)
Pode-se usar pequenos indicadores visuais (ex: um pequeno ponto verde/amarelo/vermelho) ao lado de cada item para indicar quão próximo o prescrito está da meta percentual.
Densidade Calórica:
Este é um indicador do plano alimentar em si. Pode ser mantido como está, pois não há uma "meta" de densidade calórica direta do plano energético.
Poderia, opcionalmente, ter um texto explicativo ou um valor de referência geral, se aplicável.
Esboço Visual Conceitual:
+--------------------------------------------------------------------------+
| Análise Comparativa: Plano Alimentar vs. Metas Energéticas |
+--------------------------------------------------------------------------+
| |
| [ Resumo Calórico ] |
| Calorias Prescritas: 1850 Kcal Meta (GET): 2000 Kcal Dif: -150 Kcal |
| [########## progres sbar #80%#####| Target Line ] 92.5% da meta |
| |
+--------------------------------------------------------------------------+
| |
| [ Comparativo de Macronutrientes (g) ] |
| |
| Proteínas Prescrito: 88.6g / Meta: 100g |
| [========= bar =========| Target Line ] (Faixas de fundo opcionais) |
| |
| Carboidratos Prescrito: 168.4g / Meta: 250g |
| [====== bar ===| Target Line ] |
| |
| Lipídios Prescrito: 43.0g / Meta: 67g |
| [======== bar =====| Target Line ] |
| |
+--------------------------------------------------------------------------+
| |
| [ Distribuição Percentual de Macros (% VET) ] [ Densidade Calórica ]|
| | |
| (Donut Chart para Plano Alimentar) | (Barra atual) |
| /\ | 1.40 Kcal/g |
| / \ Proteínas: 25% (Meta: 20%) [G] | [##### Baixa ####] |
| | | Carboidratos: 45% (Meta: 50%) [A] | |
| \ / Lipídios: 30% (Meta: 30%) [G] | |
| \/ | |
| | |
+--------------------------------------------------------------------------+
| [ Botão: Salvar e ver planejamento ] |
+--------------------------------------------------------------------------+
Use code with caution.
(Legenda para o Donut: [G] = Verde/OK, [A] = Amarelo/Atenção, [V] = Vermelho/Fora)
Documentação de Implementação Melhorada para o Desenvolvedor:
Funcionalidade: Análise Comparativa de Nutrientes - Plano Alimentar vs. Plano Energético

1. Objetivo:
   Apresentar ao nutricionista uma comparação visual e numérica clara entre os nutrientes calculados para o Plano Alimentar prescrito e as metas definidas no Plano Energético do paciente. Isso permite ajustes finos no plano alimentar para atingir os objetivos nutricionais e calóricos.
2. Origem dos Dados:
   Plano Alimentar (Prescrito):
   calorias_prescritas_total: Soma das calorias de todos os alimentos/refeições do plano.
   proteinas_prescritas_g: Soma das gramas de proteínas.
   carboidratos_prescritos_g: Soma das gramas de carboidratos.
   lipidios_prescritos_g: Soma das gramas de lipídios.
   proteinas_prescritas_vet_perc: (proteinas_prescritas_g _ 4) / calorias_prescritas_total _ 100.
   carboidratos_prescritos_vet_perc: (carboidratos_prescritos_g _ 4) / calorias_prescritas_total _ 100.
   lipidios_prescritos_vet_perc: (lipidios_prescritos_g _ 9) / calorias_prescritas_total _ 100.
   densidade_calorica: calorias_prescritas_total / peso_total_alimentos_g.
   Plano Energético (Metas):
   meta_calorica_get: Gasto Energético Total (GET) calculado.
   meta_proteinas_perc: Percentual de proteínas definido para o VET.
   meta_carboidratos_perc: Percentual de carboidratos definido para o VET.
   meta_lipidios_perc: Percentual de lipídios definido para o VET.
   meta_proteinas_g: (meta_proteinas_perc / 100) _ meta_calorica_get / 4.
   meta_carboidratos_g: (meta_carboidratos_perc / 100) _ meta_calorica_get / 4.
   meta_lipidios_g: (meta_lipidios_perc / 100) \* meta_calorica_get / 9.
   Faixas de Referência para macronutrientes (ex: IOM):
   ref_proteinas_perc_min, ref_proteinas_perc_max (ex: 10%, 35%)
   ref_carboidratos_perc_min, ref_carboidratos_perc_max (ex: 45%, 65%)
   ref_lipidios_perc_min, ref_lipidios_perc_max (ex: 20%, 35%)
3. Componentes Visuais e Lógica:
   3.1. Card: Resumo Calórico

- Título: "Balanço Calórico Total" ou similar.
- Dados Exibidos:
- Texto: "Calorias Prescritas: [calorias_prescritas_total] Kcal"
- Texto: "Meta Calórica (GET): [meta_calorica_get] Kcal"
- Cálculo da Diferença: diferenca_kcal = calorias_prescritas_total - meta_calorica_get
- Texto: "Diferença: [diferenca_kcal] Kcal" (Exibir com sinal +/-).
- Estilo Condicional (Diferença):
- Se ABS(diferenca_kcal) <= 0.10 \* meta_calorica_get (até 10% da meta): Cor Verde.
- Se 0.10 _ meta_calorica_get < ABS(diferenca_kcal) <= 0.20 _ meta_calorica_get (entre 10% e 20%): Cor Amarela.
- Se ABS(diferenca_kcal) > 0.20 \* meta_calorica_get (mais de 20%): Cor Vermelha.
- Considerar o objetivo: Se meta é déficit e há superávit, ou vice-versa, intensificar alerta (ex: vermelho direto).
- Visualização (Barra de Progresso):
- Tipo: Barra de progresso horizontal.
- Valor Máximo da Barra: meta_calorica_get.
- Valor Atual (Preenchimento): calorias_prescritas_total.
- Rótulo na Barra ou ao lado: (calorias_prescritas_total / meta_calorica_get \* 100) % da meta.
- Cor da barra pode seguir a lógica da diferenca_kcal.
  3.2. Card: Comparativo de Macronutrientes (em Gramas)
- Título: "Macronutrientes: Prescrito vs. Meta (g)"
- Repetir para cada macronutriente (Proteínas, Carboidratos, Lipídios):
- Nome do Macronutriente (Ex: "Proteínas")
- Textos:
- "Prescrito: [proteinas_prescritas_g] g"
- "Meta: [meta_proteinas_g] g"
- "Diferença: [proteinas_prescritas_g - meta_proteinas_g] g" (com sinal +/-)
- Visualização (Bullet Graph):
- measure: [proteinas_prescritas_g] (Valor principal, barra mais proeminente).
- marker: [meta_proteinas_g] (Linha vertical indicando a meta).
- ranges (Faixas de fundo, opcionais):
- range1_min = (ref_proteinas_perc_min / 100) \* meta_calorica_get / 4
- range1_max = (ref_proteinas_perc_max / 100) \* meta_calorica_get / 4
- Pode haver múltiplas faixas (ex: "Baixo", "Ideal", "Alto"). Cores suaves para as faixas.
- Cor da measure pode ser condicional (verde se próximo da meta, amarelo/vermelho se distante).
  3.3. Card: Distribuição Percentual de Macronutrientes (% VET)
- Título: "Distribuição Calórica: Prescrito vs. Meta (% VET)"
- Visualização (Gráfico de Rosca - Donut Chart):
- Dados: proteinas_prescritas_vet_perc, carboidratos_prescritos_vet_perc, lipidios_prescritos_vet_perc.
- Cores consistentes com o sistema.
- Legenda/Textos Adjacentes:
- Para cada macronutriente:
- "Proteínas: [proteinas_prescritas_vet_perc]% (Meta: [meta_proteinas_perc]%)"
- "Carboidratos: [carboidratos_prescritos_vet_perc]% (Meta: [meta_carboidratos_perc]%)"
- "Lipídios: [lipidios_prescritos_vet_perc]% (Meta: [meta_lipidios_perc]%)"
- Indicador Visual (opcional): Um pequeno ícone (círculo colorido, seta para cima/baixo) ao lado de cada item para indicar se o prescrito está acima, abaixo ou alinhado com a meta percentual.
- Verde: ABS(prescrito_perc - meta_perc) <= 2 (diferença de até 2 pontos percentuais)
- Amarelo: 2 < ABS(prescrito_perc - meta_perc) <= 5
- Vermelho: ABS(prescrito_perc - meta_perc) > 5
  3.4. Card: Densidade Calórica (Manter como está ou com pequena melhoria)
- Título: "Densidade Calórica do Plano"
- Visualização: Barra horizontal como a atual.
- Dado: [densidade_calorica] Kcal/g
- Texto: "Baixa", "Média", "Alta" (conforme as faixas atuais).
- Pode adicionar um tooltip com faixas de referência gerais se fizer sentido.

4. Interações:
   Tooltips: Ao passar o mouse sobre os gráficos (barra de progresso, bullet graphs, segmentos do donut), exibir tooltips com os valores exatos (Prescrito, Meta, Diferença).
   Responsividade: Garantir que os gráficos e informações sejam bem visualizados em diferentes tamanhos de tela.
5. Tratamento de Casos Especiais:
   Plano Energético não preenchido: Se não houver metas definidas no Plano Energético, a seção de comparação deve indicar isso claramente (ex: "Complete o Plano Energético para ver a análise comparativa") ou exibir apenas os dados do Plano Alimentar (como o layout atual).
   Dados Ausentes: Tratar ausência de valores específicos (ex: se um macronutriente não tiver meta definida) de forma graciosa, ocultando a comparação para esse item específico ou mostrando "N/A".
6. Estilo e UI/UX:
   Manter a consistência visual com o restante do sistema Smart Nutri (cores, fontes, espaçamentos).
   Priorizar a clareza e a fácil interpretação dos dados. Evitar poluição visual.
   Usar cores de forma significativa e acessível (considerar daltonismo para combinações de verde/vermelho, usando também ícones ou texturas se necessário).
7. Próximos Passos (Sugestões de Evolução Futura):
   Comparativo de Micronutrientes (Vitaminas, Minerais) se as metas forem definidas.
   Alertas/Notificações mais proativas se o plano estiver muito desalinhado com as metas.
   Sugestões automáticas (simples) baseadas nas discrepâncias.
