# Módulo de Planejamento Energético

## Visão Geral

O módulo de Planejamento Energético é responsável por gerenciar os planos de energia (calorias) para pacientes. Ele permite criar, atualizar e gerenciar planos energéticos personalizados baseados em diversos fatores como peso, altura, idade, gênero, nível de atividade física, objetivos de peso e condições específicas (como gestação). O frontend é responsável por realizar os cálculos de TMB (Taxa Metabólica Basal) e GET (Gasto Energético Total), enquanto o backend armazena os dados e resultados.

## Estrutura do Diretório

```
backend/src/modules/energy-plan/
├── dto/                    # Data Transfer Objects
│   ├── create-energy-plan.dto.ts
│   ├── update-energy-plan.dto.ts
│   ├── energy-plan-response.dto.ts
│   ├── query-energy-plan.dto.ts
│   ├── met-detail.dto.ts
│   ├── weight-goal-detail.dto.ts
│   └── pregnancy-specific-inputs.dto.ts
├── entities/              # Entidades TypeORM
│   └── energy-plan.entity.ts
├── enums/                 # Enumerações
│   ├── energy-formulas.enum.ts
│   ├── activity-factors.enum.ts
│   ├── injury-factors.enum.ts
│   └── gender.enum.ts
├── energy-plan.controller.ts
├── energy-plan.service.ts
├── energy-plan.module.ts
└── ENERGY_PLAN_MODULE_DOCUMENTATION.md
```

## Entidades

### EnergyPlan

Representa um plano energético no banco de dados. Inclui:

- **Identificação**:

  - `id`: UUID (chave primária)
  - `name`: Nome do plano
  - `calculationDate`: Data do cálculo

- **Relacionamentos**:

  - `patient`: Relacionamento com o paciente (Many-to-One)
  - `nutritionist`: Relacionamento com o nutricionista (Many-to-One)
  - `consultation`: Relacionamento com a consulta (Many-to-One, opcional)
  - `mealPlans`: Relacionamento com planos alimentares (One-to-Many)

- **Dados Antropométricos**:

  - `weightAtCalculationKg`: Peso no momento do cálculo
  - `heightAtCalculationCm`: Altura no momento do cálculo
  - `fatFreeMassAtCalculationKg`: Massa magra (opcional)
  - `ageAtCalculationYears`: Idade no momento do cálculo
  - `genderAtCalculation`: Gênero no momento do cálculo

- **Fórmulas e Fatores**:

  - `formulaKey`: Fórmula utilizada para cálculo
  - `activityFactorKey`: Fator de atividade física (opcional)
  - `injuryFactorKey`: Fator de lesão (opcional)

- **Ajustes**:

  - `additionalMetDetails`: Detalhes adicionais de MET (opcional)
  - `additionalMetTotalKcal`: Total de kcal de MET adicionais (opcional)
  - `weightGoalDetails`: Detalhes do objetivo de peso (opcional)
  - `additionalPregnancyKcal`: Calorias adicionais para gestação (opcional)
  - `pregnancySpecificInputs`: Inputs específicos para gestação (opcional)
  - `customTmbKcalInput`: Input personalizado de TMB (opcional)
  - `customGetKcalInput`: Input personalizado de GET (opcional)

- **Resultados**:
  - `calculatedTmbKcal`: TMB calculado pelo frontend (opcional)
  - `calculatedGetKcal`: GET calculado pelo frontend

## API Endpoints

Todos os endpoints são protegidos por autenticação JWT e controle de acesso baseado em roles.

### POST /energy-plans

Cria um novo plano energético.

**Permissões**: Apenas nutricionistas
**Request Body**: `CreateEnergyPlanDto`

### GET /energy-plans

Retorna todos os planos energéticos.

**Permissões**: Nutricionistas e pacientes
**Query Parameters**: `QueryEnergyPlanDto`

### GET /energy-plans/:id

Retorna um plano energético específico.

**Permissões**: Nutricionistas e pacientes

### GET /energy-plans/patient/:patientId

Retorna todos os planos energéticos de um paciente específico, ordenados por data de cálculo (mais recente primeiro).

**Permissões**: Nutricionistas e pacientes

### GET /energy-plans/consultation/:consultationId

Retorna todos os planos energéticos associados a uma consulta específica.

**Permissões**: Nutricionistas e pacientes

### PATCH /energy-plans/:id

Atualiza um plano energético existente.

**Permissões**: Apenas nutricionistas
**Request Body**: `UpdateEnergyPlanDto`

### DELETE /energy-plans/:id

Remove um plano energético.

**Permissões**: Apenas nutricionistas

## Enums

### EnergyFormula

```typescript
export enum EnergyFormula {
  HARRIS_BENEDICT_1984 = 'harris_benedict_1984',
  FAO_WHO_2004 = 'fao_who_2004',
  IOM_EER_2005 = 'iom_eer_2005',
}
```

### ActivityFactor

```typescript
export enum ActivityFactor {
  SEDENTARY = '1.2',
  LIGHTLY_ACTIVE = '1.375',
  MODERATELY_ACTIVE = '1.55',
  VERY_ACTIVE = '1.725',
  EXTRA_ACTIVE = '1.9',
}
```

### InjuryFactor

```typescript
export enum InjuryFactor {
  MINOR_SURGERY = '1.1',
  MAJOR_SURGERY = '1.2',
  TRAUMA = '1.3',
  SEPSIS = '1.4',
  BURNS = '1.5',
}
```

### Gender

```typescript
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}
```

## Integração Frontend

### Exemplo de Criação de Plano Energético

```typescript
// Exemplo de integração com o frontend
const createEnergyPlan = async (data: CreateEnergyPlanDto) => {
  const response = await fetch('/api/energy-plans', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
};
```

### Exemplo de Busca de Planos por Paciente

```typescript
const getPatientEnergyPlans = async (patientId: string) => {
  const response = await fetch(`/api/energy-plans/patient/${patientId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};
```

## Considerações de Segurança

1. Todos os endpoints são protegidos por `JwtAuthGuard`
2. Controle de acesso baseado em roles usando `RolesGuard`
3. Validações são aplicadas via DTOs usando class-validator
4. Relacionamentos são configurados com regras de deleção apropriadas:
   - `CASCADE` para paciente e nutricionista
   - `SET NULL` para consulta e planos alimentares

## Fluxo de Dados

1. **Criação**:

   - Frontend coleta dados do plano (antropométricos, fórmulas, fatores)
   - Frontend realiza cálculos de TMB e GET
   - Frontend envia dados completos via POST
   - Backend valida dados via DTO
   - Backend armazena plano no banco
   - Resposta inclui plano completo com relacionamentos

2. **Atualização**:

   - Frontend envia dados atualizados via PATCH
   - Backend valida e atualiza registro
   - Resposta inclui plano atualizado

3. **Consulta**:
   - Frontend pode buscar planos por:
     - ID específico
     - Paciente
     - Consulta
     - Lista completa com filtros

## Boas Práticas

1. **Validação de Dados**:

   - Sempre use os DTOs fornecidos
   - Valide dados antes de enviar ao backend
   - Trate erros de validação adequadamente

2. **Gestão de Estado**:

   - Mantenha cache de planos por paciente
   - Atualize cache após modificações
   - Implemente invalidação de cache quando necessário

3. **Tratamento de Erros**:
   - Implemente tratamento de erros consistente
   - Exiba mensagens de erro amigáveis
   - Registre erros para debugging

## Testes

O módulo inclui testes unitários e de integração. Para executar:

```bash
# Testes unitários
npm run test energy-plan

# Testes e2e
npm run test:e2e energy-plan
```

## Contribuição

1. Siga o padrão de código existente
2. Adicione testes para novas funcionalidades
3. Atualize a documentação quando necessário
4. Use os enums e interfaces fornecidos
5. Mantenha a consistência com outros módulos
