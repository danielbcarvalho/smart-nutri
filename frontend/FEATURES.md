# Features do SmartNutri

Este documento contém a documentação detalhada de todas as features do frontend do SmartNutri.

## 🔍 Índice

- [Autenticação](#autenticação)
- [Gestão de Pacientes](#gestão-de-pacientes)
- [Planos Alimentares](#planos-alimentares)
- [Avaliações](#avaliações)
- [Pesquisa Global](#pesquisa-global)

## 📋 Features

### Autenticação

**Status**: 🚧 Em desenvolvimento

**Localização**: `src/pages/Auth/*`

**Descrição**: Sistema de autenticação e autorização de usuários.

**Funcionalidades**:

- Login com email e senha
- Recuperação de senha
- Gerenciamento de sessão

### Gestão de Pacientes

**Status**: ✅ Implementado

**Localização**:

- Lista: `src/pages/Patients/index.tsx`
- Formulário: `src/pages/PatientForm/index.tsx`
- Detalhes: `src/pages/PatientInfo/index.tsx`

**Descrição**: CRUD completo de pacientes.

**Funcionalidades**:

- Listagem com paginação e filtros
- Cadastro de novos pacientes
- Edição de dados
- Visualização detalhada
- Histórico de atendimentos

**Endpoints**:

- GET `/patients` - Lista de pacientes
- GET `/patients/:id` - Detalhes do paciente
- POST `/patients` - Criar paciente
- PUT `/patients/:id` - Atualizar paciente
- DELETE `/patients/:id` - Remover paciente

### Planos Alimentares

**Status**: ✅ Implementado

**Localização**:

- Lista: `src/pages/MealPlan/index.tsx`
- Detalhes: `src/pages/MealPlanDetails/index.tsx`
- Novo: `src/pages/NewMealPlan/index.tsx`

**Descrição**: Gerenciamento de planos alimentares dos pacientes.

**Funcionalidades**:

- Criação de planos
- Edição de refeições
- Cópia de planos existentes
- Histórico de modificações

**Endpoints**:

- GET `/meal-plans` - Lista de planos
- GET `/meal-plans/:id` - Detalhes do plano
- POST `/meal-plans` - Criar plano
- PUT `/meal-plans/:id` - Atualizar plano
- DELETE `/meal-plans/:id` - Remover plano

### Avaliações

**Status**: 🚧 Em desenvolvimento

**Localização**: `src/pages/NewAssessment/index.tsx`

**Descrição**: Registro e acompanhamento de avaliações nutricionais.

**Funcionalidades**:

- Nova avaliação
- Histórico de medidas
- Gráficos de evolução

### Pesquisa Global

**Status**: ✅ Implementado

**Localização**: `src/components/Layout/Header.tsx`

**Descrição**: Busca unificada em todo o sistema.

**Funcionalidades**:

- Pesquisa por pacientes
- Busca em planos alimentares
- Resultados agrupados por tipo
- Navegação direta para resultados

**Implementação**:

```typescript
// Estrutura do resultado de pesquisa
interface SearchResult {
  id: string;
  title: string;
  description: string;
  link: string;
  type: "patient" | "mealPlan";
}
```

## 📝 Convenções

### Nomenclatura de Rotas

- `/patients` - Lista de pacientes
- `/patients/new` - Novo paciente
- `/patient/:id` - Detalhes do paciente
- `/patient/:id/edit` - Edição de paciente
- `/patient/:id/meal-plans` - Planos do paciente
- `/patient/:id/assessments` - Avaliações do paciente

### Estrutura de Componentes

```typescript
// Template para novos componentes
import React from "react";
import { Box, Typography } from "@mui/material";

interface ComponentProps {
  // Props interface
}

export function Component({ prop }: ComponentProps) {
  return <Box>{/* Component content */}</Box>;
}
```

## 🔄 Processo de Atualização

1. **Nova Feature**

   - Adicione a documentação aqui antes de implementar
   - Inclua endpoints, interfaces e exemplos
   - Atualize o status conforme o progresso

2. **Modificação de Feature**
   - Atualize a documentação primeiro
   - Marque breaking changes
   - Mantenha exemplos atualizados

## 📊 Status das Features

- ✅ Implementado
- 🚧 Em desenvolvimento
- 📝 Planejado
- ❌ Descontinuado
