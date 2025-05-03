# Módulo Foods (backend/src/modules/meal-plan/foods)

Este módulo gerencia o cadastro, busca, atualização e remoção de alimentos internos da aplicação, utilizando apenas o banco de dados relacional (PostgreSQL).

## Principais Funcionalidades

- Cadastro manual de alimentos
- Busca e listagem de alimentos
- Atualização e remoção de alimentos
- Marcação de alimentos como favoritos
- Contadores de uso (favoritos, buscas, planos alimentares)

## Modelo de Dados (Entidade Food)

- `id`: UUID
- `name`: Nome do alimento
- `servingSize`: Tamanho da porção
- `servingUnit`: Unidade da porção (g, ml, etc)
- `calories`, `protein`, `carbohydrates`, `fat`, `fiber`, `sugar`, `sodium`: Macronutrientes
- `categories`: Categorias do alimento
- `isFavorite`: Booleano de favorito
- `usageCountMealPlans`, `usageCountFavorites`, `usageCountSearches`: Contadores de uso
- `additionalNutrients`, `categoryHierarchy`, `source`, `sourceId`, `isVerified`, `version`, `createdAt`, `updatedAt`

## Rotas Disponíveis

### Criar alimento manualmente

- `POST /foods`
- Body: `{ name, servingSize, ... }`

### Listar todos os alimentos

- `GET /foods`

### Buscar alimento por ID

- `GET /foods/:id`

### Atualizar alimento

- `PATCH /foods/:id`
- Body: `{ ...campos editáveis }`

### Remover alimento

- `DELETE /foods/:id`

### Alternar favorito

- `POST /foods/:id/favorite`

### Listar favoritos

- `GET /foods/favorites`

## Observações

- Não há mais integração com TBCA, FatSecret ou qualquer fonte externa.
- Todos os alimentos são cadastrados e gerenciados internamente.
- O módulo é totalmente desacoplado de serviços externos e schemas de MongoDB.

## Exemplo de uso

```http
POST /foods
{
  "name": "Maçã Fuji",
  "servingSize": 100,
  "servingUnit": "g",
  "calories": 52,
  "protein": 0.3,
  "carbohydrates": 13.8,
  "fat": 0.2,
  "categories": ["Frutas"]
}
```

## Possíveis Erros e Dicas

- **404 Not Found**: Alimento não encontrado para o ID informado.
- **400 Bad Request**: Dados inválidos ao criar ou atualizar alimento.

---

> Última atualização: maio/2024
