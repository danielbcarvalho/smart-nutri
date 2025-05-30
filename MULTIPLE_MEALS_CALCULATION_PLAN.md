# Plano de Implementação: Múltiplas Refeições do Mesmo Tipo

## 📋 Visão Geral

Este documento descreve o plano de implementação para permitir o cadastro de múltiplas refeições do mesmo tipo (ex: múltiplos cafés da manhã) e a seleção de quais refeições devem ser contabilizadas nos cálculos finais do plano alimentar.

## 🎯 Objetivos

- Permitir cadastro de múltiplas refeições do mesmo tipo
- Implementar mecanismo de seleção para cálculo nutricional
- Manter a consistência dos cálculos totais do plano
- Melhorar a experiência do usuário na gestão de refeições

## 💾 1. Alterações no Banco de Dados

### 1.1 Nova Migration

```sql
ALTER TABLE meals
ADD COLUMN meal_type VARCHAR(50) NOT NULL DEFAULT 'other',
ADD COLUMN is_active_for_calculation BOOLEAN NOT NULL DEFAULT true;
```

### 1.2 Descrição dos Campos

- `meal_type`: Identifica o tipo da refeição

  - Valores possíveis: "breakfast", "lunch", "dinner", "snack", "other"
  - Default: "other"
  - NOT NULL

- `is_active_for_calculation`: Controla se a refeição deve ser contabilizada
  - Tipo: boolean
  - Default: true
  - NOT NULL

## 🔧 2. Alterações no Backend

### 2.1 DTOs

```typescript
// create-meal.dto.ts
export class CreateMealDto {
  // ... campos existentes ...
  mealType: string;
  isActiveForCalculation?: boolean;
}

// update-meal.dto.ts
export class UpdateMealDto {
  // ... campos existentes ...
  mealType?: string;
  isActiveForCalculation?: boolean;
}
```

### 2.2 Entidade

```typescript
// meal.entity.ts
@Entity("meals")
export class Meal {
  // ... campos existentes ...
  @Column({ type: "varchar", length: 50, default: "other" })
  mealType: string;

  @Column({ type: "boolean", default: true })
  isActiveForCalculation: boolean;
}
```

### 2.3 Serviço

```typescript
// meal-plans.service.ts
@Injectable()
export class MealPlansService {
  async updateMealNutritionTotals(mealId: string) {
    const meal = await this.mealRepository.findOne({
      where: { id: mealId },
      relations: ["mealFoods"],
    });

    if (!meal.isActiveForCalculation) {
      // Zera os totais se a refeição não estiver ativa para cálculo
      meal.totalCalories = 0;
      meal.totalProtein = 0;
      meal.totalCarbs = 0;
      meal.totalFat = 0;
    } else {
      // Cálculo normal dos totais
      // ... lógica existente ...
    }

    await this.mealRepository.save(meal);
  }
}
```

## 🎨 3. Alterações no Frontend

### 3.1 Componente MealList

```typescript
// components/MealList.tsx
interface MealListProps {
  meals: Meal[];
  onToggleCalculation: (mealId: string, isActive: boolean) => void;
}

const MealList: React.FC<MealListProps> = ({ meals, onToggleCalculation }) => {
  // Agrupar refeições por tipo
  const mealsByType = meals.reduce((acc, meal) => {
    if (!acc[meal.mealType]) {
      acc[meal.mealType] = [];
    }
    acc[meal.mealType].push(meal);
    return acc;
  }, {});

  return (
    <Box>
      {Object.entries(mealsByType).map(([type, typeMeals]) => (
        <Box key={type}>
          <Typography variant="h6">{type}</Typography>
          {typeMeals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onToggleCalculation={onToggleCalculation}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
};
```

### 3.2 Componente MealCard

```typescript
// components/MealCard.tsx
interface MealCardProps {
  meal: Meal;
  onToggleCalculation: (mealId: string, isActive: boolean) => void;
}

const MealCard: React.FC<MealCardProps> = ({ meal, onToggleCalculation }) => {
  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography>{meal.name}</Typography>
          <FormControlLabel
            control={
              <Switch
                checked={meal.isActiveForCalculation}
                onChange={(e) => onToggleCalculation(meal.id, e.target.checked)}
              />
            }
            label="Incluir no cálculo"
          />
        </Box>
        {/* ... resto do conteúdo ... */}
      </CardContent>
    </Card>
  );
};
```

### 3.3 Atualização do MealPlanDetailsPage

```typescript
// MealPlanDetailsPage.tsx
const handleToggleCalculation = async (mealId: string, isActive: boolean) => {
  try {
    await updateMealMutation.mutateAsync({
      planId: planId as string,
      mealId,
      updatedMeal: {
        isActiveForCalculation: isActive,
      },
    });

    // Recalcular totais do plano
    await queryClient.invalidateQueries({ queryKey: ["mealPlan", planId] });
  } catch (error) {
    setSnackbar({
      open: true,
      message: "Erro ao atualizar refeição",
      severity: "error",
    });
  }
};
```

## 📅 4. Plano de Implementação

### Fase 1 - Banco de Dados (1 dia)

- [ ] Criar migration para novos campos
- [ ] Atualizar entidades
- [ ] Testar migration em ambiente de desenvolvimento

### Fase 2 - Backend (2 dias)

- [ ] Implementar alterações nos serviços
- [ ] Atualizar lógica de cálculo
- [ ] Adicionar endpoints
- [ ] Testes unitários

### Fase 3 - Frontend (2 dias)

- [ ] Atualizar componentes
- [ ] Implementar UI
- [ ] Atualizar lógica de totais
- [ ] Testes de UI

### Fase 4 - Testes e Ajustes (1 dia)

- [ ] Testes de integração
- [ ] Ajustes de performance
- [ ] Documentação final

## ⚠️ Considerações Importantes

### Performance

- Agrupamento de refeições feito no frontend
- Cálculos atualizados sob demanda
- Cache de queries otimizado

### UX/UI

- Interface clara para identificação de tipos
- Feedback visual imediato
- Tooltips explicativos
- Agrupamento visual por tipo de refeição

### Migração

- Plano para dados existentes
- Valores default para novos campos
- Backup antes da migração

## 🔍 Monitoramento

- Monitorar performance dos cálculos
- Acompanhar uso da feature
- Coletar feedback dos usuários

## 📝 Notas Adicionais

- Manter compatibilidade com planos existentes
- Documentar mudanças para equipe
- Atualizar documentação do módulo
- Considerar impactos em relatórios e PDFs

## 🔄 Revisão

Este plano deve ser revisado e atualizado conforme necessário durante a implementação.
