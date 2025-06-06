# Planejamento: "Criar Plano com Smart Nutri AI"

## Contexto

Implementar uma nova funcionalidade no sistema Smart Nutri que permita aos nutricionistas criar planos alimentares automatizados usando inteligência artificial, integrando dados do paciente com um formulário de configuração personalizado.

## Objetivos do Sistema

- Automatizar a criação inicial de planos nutricionais
- Reduzir o tempo de desenvolvimento de planos para nutricionistas
- Manter a personalização e controle profissional sobre as recomendações
- Integrar dados existentes do paciente com preferências específicas do plano

## Especificações Funcionais

### 1. Gatilho de Ativação

- Adicionar novo botão "Criar Plano com Smart Nutri AI" na interface de criação de planos
- Posicionar ao lado das opções existentes ("Criar do Zero" e "Usar Template")
- Ícone sugerido: 🤖 ou ⚡ (indicando automação/AI)

### 2. Coleta Automática de Dados do Paciente

O sistema deve carregar e processar automaticamente:

#### Dados Antropométricos:

- Peso, altura, IMC
- Percentual de gordura (se disponível)
- Circunferências corporais
- Idade e gênero

#### Dados Clínicos:

- Condições de saúde existentes (diabetes, hipertensão, etc.)
- Medicamentos atuais
- Alergias e intolerâncias alimentares
- Exames laboratoriais recentes

#### Dados Nutricionais:

- Gasto energético total (GET) calculado
- Necessidades calóricas diárias
- Distribuição recomendada de macronutrientes
- Histórico de planos anteriores (para referência)

#### Objetivos do Paciente:

- Objetivo principal (perda de peso, ganho muscular, manutenção)
- Prazo estabelecido
- Preferências alimentares registradas

### 3. Formulário de Configuração AI

Criar formulário intuitivo com as seguintes seções:

#### Objetivo Específico do Plano:

- Dropdown: Perda de Peso / Ganho Muscular / Manutenção / Performance Esportiva / Saúde Geral
- Campo de texto: Detalhes adicionais do objetivo

#### Restrições e Preferências Alimentares:

- Checkboxes: Vegetariano, Vegano, Low carb, Cetogênico, Sem glúten, Sem lactose
- Campo de texto livre: Outras restrições específicas
- Alimentos a evitar (campo multi-seleção)
- Alimentos a priorizar

#### Parâmetros do Plano:

- Número de refeições por dia (slider: 3-6)
- Orçamento médio para alimentação (campo numérico + moeda)
- Nível de complexidade das receitas (Simples/Moderado/Elaborado)
- Tempo disponível para preparo das refeições

#### Considerações Especiais:

- Rotina de exercícios (tipo, frequência, intensidade)
- Horários preferidos de refeições
- Disponibilidade de utensílios/cozinha
- Contexto social (come fora frequentemente, família, etc.)

### 4. Processamento AI

A IA deve:

#### Análise de Dados:

- Consolidar informações do paciente com preferências do formulário
- Calcular requisitos nutricionais específicos
- Identificar potenciais conflitos ou restrições

#### Geração do Plano:

- Criar estrutura balanceada de refeições
- Definir porções e quantidades específicas
- Sugerir horários de consumo
- Incluir alternativas para refeições principais

#### Saída Estruturada:

```json
{
  "daily_plan": {
    "breakfast": {
      "foods": [
        {
          "name": "Aveia em flocos",
          "quantity": 30,
          "unit": "g"
        }
      ],
      "total_calories": 350,
      "macros": {"carb": 45, "prot": 15, "fat": 8}
    }
  },
  "notes": ["Beber 2L de água", "Consumir entre 8h-9h"],
  "alternatives": {...}
}
```

## Integração com o Sistema Existente

### 1. Frontend

- Integrar com o módulo existente de planos alimentares (`src/modules/meal-plan`)
- Utilizar os componentes existentes:
  - `MealPlanPage.tsx`
  - `MealPlanDetailsPage.tsx`
  - `AddFoodToMealModal.tsx`
  - `MealCard.tsx`

### 2. Backend

- Integrar com o serviço existente de planos alimentares (`MealPlansService`)
- Utilizar as entidades existentes:
  - `MealPlan`
  - `Meal`
  - `MealFood`

### 3. Fluxo de Dados

1. Coleta de dados do paciente via API existente
2. Processamento AI para geração do plano
3. Criação do plano usando `MealPlansService.create()`
4. Adição de refeições usando `MealPlansService.addMeal()`
5. Atualização dos totais nutricionais usando `updateMealPlanTotals()`

## Considerações Técnicas

### 1. Performance

- Utilizar React Query para cache e gerenciamento de estado
- Implementar lazy loading para componentes pesados
- Otimizar chamadas à API

### 2. Segurança

- Validar todos os inputs do usuário
- Implementar rate limiting para chamadas à API
- Garantir autenticação e autorização

### 3. UX/UI

- Manter consistência com o design system existente
- Fornecer feedback visual durante o processamento
- Implementar validações em tempo real

## Próximos Passos

1. Desenvolvimento do formulário de configuração AI
2. Implementação da integração com dados do paciente
3. Desenvolvimento do processamento AI
4. Integração com o sistema existente
5. Testes e validação
6. Documentação e treinamento

## Métricas de Sucesso

1. Redução do tempo médio de criação de planos
2. Aumento da satisfação dos nutricionistas
3. Melhoria na aderência dos pacientes aos planos
4. Redução de erros na criação de planos
