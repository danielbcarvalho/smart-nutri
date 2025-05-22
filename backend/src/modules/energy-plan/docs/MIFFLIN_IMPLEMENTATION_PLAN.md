# Plano de Implementação: Fórmulas de Mifflin

## 1. Visão Geral

Este documento descreve o plano de implementação para adicionar as fórmulas de Mifflin ao sistema de cálculo energético:

- Mifflin-St Jeor (1990) - Fórmula padrão
- Mifflin-St Jeor Modificada (1980) - Versão para sobrepeso/obesidade

## 2. Arquivos a Serem Modificados

### 2.1 Backend

1. `backend/src/modules/energy-plan/enums/energy-formulas.enum.ts`

   - Adicionar novos valores ao enum `EnergyFormula`
   - Adicionar novos tipos ao enum `EnergyFormulaType` se necessário

2. `backend/src/modules/energy-plan/energy-plan.service.ts`
   - Implementar novos métodos de cálculo
   - Atualizar o switch case no método `calculateTMB`

### 2.2 Frontend

1. `frontend/src/modules/energy-plan/constants/energyPlanConstants.ts`

   - Adicionar descrições e fórmulas matemáticas
   - Atualizar constantes de validação

2. `frontend/src/modules/energy-plan/utils/energyCalculations.ts`

   - Implementar lógica de cálculo
   - Atualizar validações

3. `frontend/src/modules/energy-plan/components/EnergyPlanMethodSection.tsx`
   - Adicionar novas opções ao select de fórmulas

## 3. Detalhes de Implementação

### 3.1 Fórmulas a Serem Implementadas

#### Mifflin-St Jeor (1990)

```
Homens: TMB = (10 × peso) + (6.25 × altura) - (5 × idade) + 5
Mulheres: TMB = (10 × peso) + (6.25 × altura) - (5 × idade) - 161
```

#### Mifflin-St Jeor Modificada (1980) - Sobrepeso/Obesidade

```
Homens: TMB = (10 × peso) + (6.25 × altura) - (5 × idade) + 5 - (0.5 × peso)
Mulheres: TMB = (10 × peso) + (6.25 × altura) - (5 × idade) - 161 - (0.5 × peso)
```

### 3.2 Validações Necessárias

- Idade mínima: 18 anos
- Peso e altura devem ser positivos
- Para a versão modificada, considerar IMC > 25 kg/m²

### 3.3 Constantes e Descrições

```typescript
// Exemplo de descrições a serem adicionadas
mifflin_st_jeor_1990: {
  name: "Mifflin-St Jeor (1990)",
  description: "Fórmula moderna e precisa para cálculo de TMB em adultos.",
  formula: {
    male: "TMB = (10 × peso) + (6.25 × altura) - (5 × idade) + 5",
    female: "TMB = (10 × peso) + (6.25 × altura) - (5 × idade) - 161"
  }
},
mifflin_st_jeor_modified_1980: {
  name: "Mifflin-St Jeor Modificada (1980)",
  description: "Versão adaptada para indivíduos com sobrepeso ou obesidade.",
  formula: {
    male: "TMB = (10 × peso) + (6.25 × altura) - (5 × idade) + 5 - (0.5 × peso)",
    female: "TMB = (10 × peso) + (6.25 × altura) - (5 × idade) - 161 - (0.5 × peso)"
  }
}
```

## 4. Ordem de Implementação

1. Backend:

   - Atualizar enums
   - Implementar cálculos
   - Adicionar testes unitários

2. Frontend:

   - Atualizar constantes
   - Implementar cálculos
   - Atualizar interface
   - Adicionar validações

3. Testes:
   - Testes unitários
   - Testes de integração
   - Validação de casos de borda

## 5. Considerações Importantes

1. **Compatibilidade**:

   - Manter compatibilidade com cálculos existentes
   - Garantir que novos campos não quebrem funcionalidades existentes

2. **Validações**:

   - Implementar validações específicas para cada fórmula
   - Considerar limites de idade, peso e altura

3. **Documentação**:

   - Atualizar documentação técnica
   - Adicionar comentários explicativos no código

4. **UI/UX**:
   - Garantir clareza na seleção das fórmulas
   - Adicionar tooltips explicativos
   - Incluir validações visuais

## 6. Referências

1. Mifflin MD, et al. (1990). A new predictive equation for resting energy expenditure in healthy individuals.
2. Mifflin MD, et al. (1980). A new predictive equation for resting energy expenditure in healthy individuals with obesity.

## 7. Checklist de Implementação

- [ ] Atualizar enums no backend
- [ ] Implementar cálculos no backend
- [ ] Adicionar testes unitários no backend
- [ ] Atualizar constantes no frontend
- [ ] Implementar cálculos no frontend
- [ ] Atualizar interface do usuário
- [ ] Adicionar validações
- [ ] Atualizar documentação
- [ ] Realizar testes de integração
- [ ] Validar casos de borda
