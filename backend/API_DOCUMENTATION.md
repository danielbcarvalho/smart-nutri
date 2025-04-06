# SmartNutri API Documentation

## Visão Geral

API para gestão completa de nutrição, incluindo:

- Gestão de pacientes
- Avaliações nutricionais
- Planos alimentares
- Base de dados de alimentos

## Endpoints

### Pacientes (`/patients`)

#### Criar Paciente

- **POST** `/patients`
- **Descrição**: Cria um novo paciente com todas as informações necessárias
- **Corpo da Requisição**:
  ```json
  {
    "name": "João Silva",
    "email": "joao@email.com",
    "cpf": "123.456.789-00",
    "birthDate": "1990-01-01",
    "gender": "M",
    "phone": "(11) 99999-9999",
    "address": {
      "street": "Rua Exemplo",
      "number": "123",
      "complement": "Apto 45",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01234-567"
    },
    "healthInsurance": {
      "name": "Plano Saúde",
      "number": "987654321",
      "expirationDate": "2025-12-31"
    },
    "occupation": "Engenheiro",
    "maritalStatus": "Solteiro",
    "education": "Superior Completo"
  }
  ```
- **Respostas**:
  - 201: Paciente criado com sucesso
  - 400: Dados inválidos
  - 409: Paciente já existe (CPF/email)

#### Listar Pacientes

- **GET** `/patients`
- **Descrição**: Retorna lista de todos os pacientes
- **Respostas**:
  - 200: Lista de pacientes

#### Buscar Paciente

- **GET** `/patients/:id`
- **Descrição**: Retorna detalhes de um paciente específico
- **Respostas**:
  - 200: Paciente encontrado
  - 404: Paciente não encontrado

#### Atualizar Paciente

- **PATCH** `/patients/:id`
- **Descrição**: Atualiza informações de um paciente
- **Respostas**:
  - 200: Paciente atualizado
  - 400: Dados inválidos
  - 404: Paciente não encontrado
  - 409: Conflito (CPF/email)

#### Remover Paciente

- **DELETE** `/patients/:id`
- **Descrição**: Remove um paciente
- **Respostas**:
  - 204: Paciente removido
  - 404: Paciente não encontrado

### Alimentos (`/foods`)

#### Criar Alimento

- **POST** `/foods`
- **Descrição**: Cria um novo alimento manualmente
- **Corpo da Requisição**:
  ```json
  {
    "name": "Maçã Fuji",
    "fatsecretId": "123456",
    "servingSize": 100,
    "servingUnit": "g",
    "calories": 52,
    "protein": 0.3,
    "carbohydrates": 13.8,
    "fat": 0.2,
    "fiber": 2.4,
    "sugar": 10.4,
    "sodium": 1,
    "additionalNutrients": {
      "Vitamina C": 4.6,
      "Potássio": 107
    },
    "categories": ["Frutas", "Frutas frescas"]
  }
  ```
- **Respostas**:
  - 201: Alimento criado
  - 400: Dados inválidos

#### Buscar Alimentos

- **GET** `/foods`
- **Descrição**: Lista todos os alimentos
- **Respostas**:
  - 200: Lista de alimentos

#### Pesquisar Alimentos

- **GET** `/foods/search?query=maçã`
- **Descrição**: Pesquisa alimentos por nome
- **Parâmetros**:
  - query: Termo de busca
  - page: Número da página (default: 0)
  - pageSize: Itens por página (default: 20, max: 50)
- **Respostas**:
  - 200: Resultados da pesquisa

#### Importar da API

- **POST** `/foods/save-from-api`
- **Descrição**: Importa alimento da API externa
- **Corpo da Requisição**:
  ```json
  {
    "externalId": "7898926645011"
  }
  ```
- **Respostas**:
  - 201: Alimento importado
  - 404: Alimento não encontrado na API

### Planos Alimentares (`/meal-plans`)

#### Criar Plano

- **POST** `/meal-plans`
- **Descrição**: Cria um novo plano alimentar
- **Corpo da Requisição**:
  ```json
  {
    "title": "Plano Alimentar Semanal",
    "description": "Plano para perda de peso",
    "startDate": "2024-03-20",
    "endDate": "2024-03-27",
    "patientId": "123e4567-e89b-12d3-a456-426614174000",
    "meals": [
      {
        "name": "Café da Manhã",
        "time": "08:00",
        "foods": [
          {
            "foodId": "123e4567-e89b-12d3-a456-426614174000",
            "quantity": 100,
            "unit": "g"
          }
        ]
      }
    ]
  }
  ```
- **Respostas**:
  - 201: Plano criado
  - 400: Dados inválidos
  - 404: Paciente não encontrado

#### Listar Planos

- **GET** `/meal-plans`
- **Descrição**: Lista todos os planos
- **Respostas**:
  - 200: Lista de planos

#### Buscar Planos por Paciente

- **GET** `/meal-plans/patient/:patientId`
- **Descrição**: Lista planos de um paciente
- **Respostas**:
  - 200: Lista de planos
  - 404: Paciente não encontrado

#### Adicionar Refeição

- **POST** `/meal-plans/:id/meals`
- **Descrição**: Adiciona refeição a um plano
- **Corpo da Requisição**:
  ```json
  {
    "name": "Almoço",
    "time": "12:00",
    "foods": [
      {
        "foodId": "123e4567-e89b-12d3-a456-426614174000",
        "quantity": 150,
        "unit": "g"
      }
    ]
  }
  ```
- **Respostas**:
  - 201: Refeição adicionada
  - 400: Dados inválidos
  - 404: Plano não encontrado

## Modelos de Dados

### Patient

```typescript
{
  id: string;              // UUID
  name: string;           // Nome completo
  email: string;          // Email
  cpf: string;           // CPF
  birthDate: Date;       // Data de nascimento
  gender: string;        // Gênero (M/F)
  phone: string;         // Telefone
  address: {             // Endereço
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  healthInsurance?: {    // Plano de saúde
    name: string;
    number: string;
    expirationDate: Date;
  };
  occupation?: string;   // Profissão
  maritalStatus?: string; // Estado civil
  education?: string;    // Escolaridade
  createdAt: Date;      // Data de criação
  updatedAt: Date;      // Data de atualização
}
```

### Food

```typescript
{
  id: string;              // UUID
  name: string;           // Nome do alimento
  externalId?: string;    // ID na API externa
  servingSize: number;    // Tamanho da porção
  servingUnit: string;    // Unidade (g, ml, etc)
  calories: number;       // Calorias por porção
  protein: number;        // Proteínas (g)
  carbohydrates: number;  // Carboidratos (g)
  fat: number;           // Gorduras (g)
  fiber?: number;        // Fibras (g)
  sugar?: number;        // Açúcares (g)
  sodium?: number;       // Sódio (mg)
  additionalNutrients?: Record<string, number>; // Outros nutrientes
  categories: string[];  // Categorias
  isFavorite: boolean;   // Status de favorito
  usageCount: number;    // Número de usos
  createdAt: Date;      // Data de criação
  updatedAt: Date;      // Data de atualização
}
```

### MealPlan

```typescript
{
  id: string;              // UUID
  title: string;          // Título do plano
  description: string;    // Descrição
  startDate: Date;        // Data de início
  endDate: Date;         // Data de término
  patient: Patient;      // Paciente
  patientId: string;     // ID do paciente
  meals: Meal[];         // Refeições
  createdAt: Date;      // Data de criação
  updatedAt: Date;      // Data de atualização
}
```

### Meal

```typescript
{
  id: string;              // UUID
  name: string;           // Nome da refeição
  time: string;           // Horário
  foods: MealFood[];     // Alimentos
  mealPlan: MealPlan;    // Plano alimentar
  mealPlanId: string;    // ID do plano
  createdAt: Date;      // Data de criação
  updatedAt: Date;      // Data de atualização
}
```

### MealFood

```typescript
{
  id: string; // UUID
  food: Food; // Alimento
  foodId: string; // ID do alimento
  meal: Meal; // Refeição
  mealId: string; // ID da refeição
  quantity: number; // Quantidade
  unit: string; // Unidade
  createdAt: Date; // Data de criação
  updatedAt: Date; // Data de atualização
}
```

## Códigos de Erro

- **400**: Dados inválidos fornecidos
- **401**: Não autorizado
- **403**: Acesso proibido
- **404**: Recurso não encontrado
- **409**: Conflito (ex: CPF/email já existe)
- **500**: Erro interno do servidor

## Autenticação

A API utiliza autenticação JWT (Bearer Token). Para acessar endpoints protegidos, inclua o token no header:

```
Authorization: Bearer <seu_token_jwt>
```

## Rate Limiting

- 100 requisições por minuto por IP
- 1000 requisições por hora por IP

## Versionamento

A API atual está na versão 1.0. O versionamento é feito através do header:

```
Accept: application/vnd.smartnutri.v1+json
```
