# Documentação do Módulo Frontend: Planejamento Energético

---

## 1. Visão Geral

O módulo de Planejamento Energético no frontend permite ao nutricionista criar, visualizar, editar e gerenciar planos energéticos de pacientes, incluindo cálculos de TMB/GET, seleção de fórmulas, fatores de atividade, ajustes clínicos e integração futura com o módulo de planos alimentares.

---

## 2. Estrutura do Módulo

```
src/modules/energy-plan/
├── components/
│   ├── EnergyPlanForm.tsx         # Formulário principal (criação/edição)
│   ├── EnergyPlanFormModal.tsx    # Modal que encapsula o formulário
├── hooks/
│   └── useEnergyPlans.ts          # Hooks React Query para buscar planos
├── pages/
│   └── EnergyPlanPage.tsx         # Página de listagem dos planos do paciente
├── services/
│   └── energyPlanService.ts       # Serviço de API (axios)
├── ENERGY_PLAN_MODULE_PLAN.md     # Planejamento detalhado do módulo
```

---

## 3. Fluxos Principais

### 3.1. Listagem de Planos

- **Arquivo:** `pages/EnergyPlanPage.tsx`
- Busca todos os planos do paciente via hook `usePatientEnergyPlans`.
- Exibe cards com nome, data, fórmula e GET calculado.
- Botão para criar novo plano (abre modal).

### 3.2. Criação de Plano

- **Arquivo:** `components/EnergyPlanFormModal.tsx` + `components/EnergyPlanForm.tsx`
- Modal com formulário dividido em seções:
  - Dados antropométricos (altura, peso, massa magra)
  - Fórmulas padronizadas (equação, nível de atividade, fator clínico)
  - Ajustes refinados (botões para MET, peso, fatores adicionais)
  - Resultados (TMB/GET, pendente de cálculo)
- Validação dos campos obrigatórios.
- (Em andamento) Integração do submit com API.

### 3.3. Edição/Exclusão

- **Planejado:** Ações de editar/excluir plano nos cards da listagem.
- **Status:** Ainda não implementado.

---

## 4. Padrões e Decisões Arquiteturais

- **React Query** para cache e fetch de dados.
- **Material-UI** para UI, responsividade e acessibilidade.
- **React Hook Form** para controle e validação dos formulários.
- **Modularização:** Cada domínio tem seu próprio diretório, componentes e serviços.
- **Tipagem forte:** Uso de TypeScript em todos os arquivos.
- **Estilo:** Inputs e botões compactos, agrupamento visual por seções, uso de Cards para clareza.

---

## 5. Pontos de Extensão e Integração

- **Integração com MealPlan:** O EnergyPlan será usado como referência para metas calóricas/macronutrientes no módulo de planos alimentares.
- **Cálculo dinâmico:** O frontend é responsável por calcular TMB/GET em tempo real conforme inputs do usuário.
- **Ajustes refinados:** Botões para abrir modais de MET, VENTA, gestação, etc (ainda não implementados).

---

## 6. O que já está pronto

- Estrutura de pastas e arquivos do módulo.
- Página de listagem de planos energéticos.
- Modal de criação com formulário validado e layout compacto.
- Serviço de API e hooks para fetch/listagem.
- Integração visual com o restante do sistema (sidebar, navegação, tema).

---

## 7. O que falta implementar (Gap Analysis)

- [ ] **Integração do submit do formulário com a API** (criação de plano)
- [ ] **Cálculo dinâmico de TMB/GET** no frontend (conforme fórmulas e fatores)
- [ ] **Ações de editar/excluir** plano na listagem
- [ ] **Modais de ajustes refinados** (MET, VENTA, gestação, etc)
- [ ] **Feedback visual de sucesso/erro** ao salvar plano
- [ ] **Atualização automática da listagem** após criar/editar/excluir
- [ ] **Integração com MealPlan** (dropdown para selecionar EnergyPlan ao criar plano alimentar)
- [ ] **Testes unitários e2e** para os fluxos principais
- [ ] **Documentação de exemplos de payloads e respostas**

---

## 8. Sugestão de Próximos Passos

1. **Finalizar integração do submit do formulário com a API**
   - Usar React Query mutation para criar plano e atualizar listagem.
2. **Implementar cálculo dinâmico de TMB/GET**
   - Criar utilitário de cálculo conforme fórmulas do backend.
   - Atualizar resultados em tempo real no formulário.
3. **Adicionar edição/exclusão de planos**
   - Modal de edição pode reutilizar o mesmo formulário.
   - Confirmação para exclusão.
4. **Implementar modais de ajustes refinados**
   - MET, VENTA, gestação, etc.
5. **Melhorar feedback visual**
   - Toasts/snackbars para sucesso/erro.
6. **Documentar exemplos de payloads, respostas e fluxos**
   - Facilitar integração e debugging.
7. **Testes unitários e2e**
   - Cobrir fluxos principais do módulo.

---

## 9. Referências e Arquivos Relevantes

- `src/modules/energy-plan/pages/EnergyPlanPage.tsx`
- `src/modules/energy-plan/components/EnergyPlanFormModal.tsx`
- `src/modules/energy-plan/components/EnergyPlanForm.tsx`
- `src/modules/energy-plan/hooks/useEnergyPlans.ts`
- `src/modules/energy-plan/services/energyPlanService.ts`
- `src/modules/energy-plan/ENERGY_PLAN_MODULE_PLAN.md` (planejamento detalhado)

---

**Dica:** Sempre consulte o arquivo `ENERGY_PLAN_MODULE_PLAN.md` para detalhes de regras de negócio, fórmulas e integrações futuras.
