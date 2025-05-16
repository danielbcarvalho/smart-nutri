# Documentação do Módulo Frontend: Planejamento Energético

---

## 1. Visão Geral

O módulo de Planejamento Energético permite ao nutricionista criar, visualizar, editar e gerenciar planos energéticos de pacientes. Ele contempla:

- Cálculo dinâmico de TMB/GET (Taxa Metabólica Basal e Gasto Energético Total)
- Seleção de fórmulas, fatores de atividade e ajustes clínicos
- Distribuição de macronutrientes
- Integração futura com o módulo de planos alimentares

---

## 2. Estrutura do Módulo

```
src/modules/energy-plan/
├── components/
│   ├── EnergyPlanMain.tsx                # Componente principal do formulário (criação/edição)
│   ├── EnergyPlanFormSection.tsx         # Seção: dados do plano e paciente
│   ├── EnergyPlanGoalSection.tsx         # Seção: metas do plano
│   ├── EnergyPlanResultsSection.tsx      # Seção: resultados (TMB/GET)
│   ├── MacronutrientDistributionSection.tsx # Seção: distribuição de macronutrientes
├── hooks/
│   └── useEnergyPlans.ts                 # Hooks React Query para fetch/mutate de planos
├── pages/
│   └── EnergyPlanFormPage.tsx            # Página principal do formulário
│   └── EnergyPlanPage.tsx                # Página de listagem dos planos do paciente
├── services/
│   └── energyPlanService.ts              # Serviço de API (axios)
├── ENERGY_PLAN_MODULE_PLAN.md            # Planejamento detalhado do módulo
```

---

## 3. Fluxos Principais

### 3.1. Listagem de Planos

- **Arquivo:** `pages/EnergyPlanPage.tsx`
- Busca todos os planos do paciente via hook `usePatientEnergyPlans`
- Exibe cards com nome, data, fórmula e GET calculado
- Botão para criar novo plano (abre formulário)

### 3.2. Criação/Edição de Plano

- **Arquivo:** `pages/EnergyPlanFormPage.tsx` → `components/EnergyPlanMain.tsx`
- O formulário é dividido em seções reutilizáveis:
  - Dados do plano e paciente (`EnergyPlanFormSection`)
  - Metas do plano (`EnergyPlanGoalSection`)
  - Resultados de cálculo (`EnergyPlanResultsSection`)
  - Distribuição de macronutrientes (`MacronutrientDistributionSection`)
- Validação dos campos obrigatórios via React Hook Form
- Cálculo dinâmico de TMB/GET conforme inputs do usuário
- Integração com backend via React Query (hooks de mutate/fetch)
- Feedback visual de sucesso/erro ao salvar plano

### 3.3. Exclusão de Plano

- **Planejado:** Ações de editar/excluir plano nos cards da listagem
- **Status:** Ainda não implementado

---

## 4. Integração com Backend

- **Serviço:** `services/energyPlanService.ts` (axios)
- **Hooks:** `hooks/useEnergyPlans.ts` (React Query)
- **Payloads:** Sempre utilize as funções utilitárias para converter/validar dados antes do envio
- **Exemplo de payload para criação:**
  ```ts
  {
    name: string,
    calculationDate: string, // formato ISO
    formulaKey: string,
    weightAtCalculationKg: number,
    heightAtCalculationCm: number,
    fatFreeMassAtCalculationKg?: number,
    activityFactorKey: string,
    injuryFactorKey: string,
    ageAtCalculationYears: number,
    genderAtCalculation: 'male' | 'female' | 'other',
    calculatedGetKcal: number,
    calculatedTmbKcal: number,
    nutritionistId: string,
    patientId: string
  }
  ```
- **Exemplo de uso do hook para criar plano:**
  ```ts
  const createPlan = useCreateEnergyPlan();
  createPlan.mutate({ patientId, data: payload }, { onSuccess, onError });
  ```
- **Regras de negócio:** Consulte sempre o arquivo `ENERGY_PLAN_MODULE_PLAN.md` para detalhes de fórmulas e validações.

---

## 5. Padrões e Decisões Arquiteturais

- **React Query:** Para cache, fetch e mutate de dados
- **Material-UI:** UI, responsividade e acessibilidade
- **React Hook Form:** Controle e validação dos formulários
- **TypeScript:** Tipagem forte em todos os arquivos
- **Modularização:** Cada domínio tem seu próprio diretório, componentes e serviços
- **Estilo:** Inputs e botões compactos, agrupamento visual por seções, uso de Cards para clareza
- **Grid:** Use preferencialmente CSS Grid via Box do MUI para layout, evitando o componente Grid do MUI por questões de tipagem/performance

---

## 6. Pontos de Extensão e Integração

- **MealPlan:** O EnergyPlan será referência para metas calóricas/macronutrientes no módulo de planos alimentares
- **Ajustes refinados:** Modais para MET, VENTA, gestação, etc (planejado)
- **Cálculo dinâmico:** O frontend calcula TMB/GET em tempo real conforme inputs

---

## 7. O que já está pronto

- Estrutura modularizada e componentes reutilizáveis
- Página de listagem de planos energéticos
- Formulário validado e layout compacto
- Serviço de API e hooks para fetch/listagem/criação
- Integração visual com o restante do sistema

---

## 8. O que falta implementar (Gap Analysis)

- [ ] Edição/exclusão de planos
- [ ] Modais de ajustes refinados (MET, VENTA, gestação, etc)
- [ ] Atualização automática da listagem após criar/editar/excluir
- [ ] Integração com MealPlan (dropdown para selecionar EnergyPlan ao criar plano alimentar)
- [ ] Testes unitários e2e para os fluxos principais
- [ ] Documentação de exemplos de payloads e respostas

---

## 9. Dicas para Novos Devs

- Sempre consulte o arquivo `ENERGY_PLAN_MODULE_PLAN.md` para regras de negócio e fórmulas
- Use os hooks e serviços já existentes para integração com backend
- Siga o padrão de componentes funcionais, tipagem forte e modularização
- Prefira CSS Grid via Box do MUI para layouts
- Teste sempre os fluxos principais após alterações

---

## 10. Referências e Arquivos Relevantes

- `src/modules/energy-plan/pages/EnergyPlanPage.tsx`
- `src/modules/energy-plan/pages/EnergyPlanFormPage.tsx`
- `src/modules/energy-plan/components/EnergyPlanMain.tsx`
- `src/modules/energy-plan/components/EnergyPlanFormSection.tsx`
- `src/modules/energy-plan/components/EnergyPlanGoalSection.tsx`
- `src/modules/energy-plan/components/EnergyPlanResultsSection.tsx`
- `src/modules/energy-plan/components/MacronutrientDistributionSection.tsx`
- `src/modules/energy-plan/hooks/useEnergyPlans.ts`
- `src/modules/energy-plan/services/energyPlanService.ts`
- `src/modules/energy-plan/ENERGY_PLAN_MODULE_PLAN.md`

---

**Dica:** Consulte sempre o arquivo de planejamento detalhado para regras de negócio, payloads e integrações futuras.
