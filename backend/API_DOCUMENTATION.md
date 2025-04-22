# SmartNutri API Documentation

## Visão Geral

API para gestão completa de nutrição, incluindo:

- Gestão de pacientes
- Avaliações nutricionais
- Planos alimentares
- Base de dados de alimentos

---

## Endpoints

### Pacientes (`/patients`)

#### Criar Paciente

- **POST** `/patients`
- **Descrição**: Cria um novo paciente com todas as informações necessárias. Se o campo `instagram` for informado, o backend tentará buscar a foto de perfil do Instagram e salvar automaticamente em `photo_url`.
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
    "education": "Superior Completo",
    "photo_url": "https://storage.example.com/patients/123e4567/photo.jpg"
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
- **Descrição**: Atualiza informações de um paciente. Se o campo `instagram` for alterado, o backend tentará buscar a nova foto de perfil do Instagram e atualizar o campo `photo_url` automaticamente.
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

---

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

---

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

---

### Templates de Planos Alimentares (`/meal-plan-templates`)

#### Listar Templates

- **GET** `/meal-plan-templates`
- **Descrição**: Lista todos os templates de planos alimentares disponíveis.
- **Parâmetros**: Nenhum.
- **Exemplo de Requisição**:
  - Headers:
    - Authorization: Bearer {token}
- **Exemplo de Resposta**:
  ```json
  [
    {
      "id": "uuid",
      "name": "Template Básico",
      "description": "Plano alimentar básico",
      "isPublic": true,
      "meals": [
        {
          "id": "uuid",
          "name": "Café da Manhã",
          "description": "Refeição matinal",
          "time": "08:00",
          "foods": [
            {
              "id": "uuid",
              "name": "Pão Integral",
              "portion": "2 fatias",
              "calories": 140,
              "protein": 6,
              "carbs": 28,
              "fat": 2,
              "category": "Carboidratos",
              "tags": ["integral", "café da manhã"]
            }
          ]
        }
      ],
      "createdAt": "2024-03-20T10:00:00Z",
      "updatedAt": "2024-03-20T10:00:00Z"
    }
  ]
  ```
- **Códigos de Status**:
  - 200: Lista de templates retornada com sucesso
  - 401: Não autorizado

---

#### Criar Template

- **POST** `/meal-plan-templates`
- **Descrição**: Cria um novo template de plano alimentar.
- **Parâmetros**: Nenhum (body da requisição obrigatório).
- **Corpo da Requisição**:
  ```json
  {
    "name": "Template Básico",
    "description": "Plano alimentar básico",
    "isPublic": true,
    "meals": [
      {
        "name": "Café da Manhã",
        "description": "Refeição matinal",
        "time": "08:00",
        "foods": [
          {
            "name": "Pão Integral",
            "portion": "2 fatias",
            "category": "Carboidratos",
            "tags": ["integral", "café da manhã"]
          }
        ]
      }
    ]
  }
  ```
- **Exemplo de Requisição**:
  - Headers:
    - Authorization: Bearer {token}
    - Content-Type: application/json
- **Exemplo de Resposta**:
  ```json
  {
    "id": "uuid",
    "name": "Template Básico",
    "description": "Plano alimentar básico",
    "isPublic": true,
    "meals": [ ... ],
    "createdAt": "2024-03-20T10:00:00Z",
    "updatedAt": "2024-03-20T10:00:00Z"
  }
  ```
- **Códigos de Status**:
  - 201: Template criado com sucesso
  - 400: Dados inválidos
  - 401: Não autorizado

---

#### Buscar Template

- **GET** `/meal-plan-templates/{id}`
- **Descrição**: Retorna os detalhes de um template específico.
- **Parâmetros**:
  - id (string, path): ID do template
- **Exemplo de Requisição**:
  - Headers:
    - Authorization: Bearer {token}
- **Exemplo de Resposta**:
  ```json
  {
    "id": "uuid",
    "name": "Template Básico",
    "description": "Plano alimentar básico",
    "isPublic": true,
    "meals": [ ... ],
    "createdAt": "2024-03-20T10:00:00Z",
    "updatedAt": "2024-03-20T10:00:00Z"
  }
  ```
- **Códigos de Status**:
  - 200: Template encontrado
  - 404: Template não encontrado
  - 401: Não autorizado

---

#### Atualizar Template

- **PATCH** `/meal-plan-templates/{id}`
- **Descrição**: Atualiza um template de plano alimentar existente.
- **Parâmetros**:
  - id (string, path): ID do template
- **Corpo da Requisição**:
  ```json
  {
    "name": "Template Básico Atualizado",
    "description": "Plano alimentar básico atualizado",
    "isPublic": false
  }
  ```
- **Exemplo de Requisição**:
  - Headers:
    - Authorization: Bearer {token}
    - Content-Type: application/json
- **Exemplo de Resposta**:
  ```json
  {
    "id": "uuid",
    "name": "Template Básico Atualizado",
    "description": "Plano alimentar básico atualizado",
    "isPublic": false,
    "meals": [ ... ],
    "createdAt": "2024-03-20T10:00:00Z",
    "updatedAt": "2024-03-20T10:00:00Z"
  }
  ```
- **Códigos de Status**:
  - 200: Template atualizado com sucesso
  - 400: Dados inválidos
  - 404: Template não encontrado
  - 401: Não autorizado

---

#### Remover Template

- **DELETE** `/meal-plan-templates/{id}`
- **Descrição**: Remove um template de plano alimentar.
- **Parâmetros**:
  - id (string, path): ID do template
- **Exemplo de Requisição**:
  - Headers:
    - Authorization: Bearer {token}
- **Códigos de Status**:
  - 204: Template removido com sucesso
  - 404: Template não encontrado
  - 401: Não autorizado

---

#### Buscar Alimentos

- **GET** `/meal-plan-templates/search/foods?query={termo}`
- **Descrição**: Busca alimentos disponíveis para templates de planos alimentares pelo termo informado.
- **Parâmetros**:
  - query (string, query): Termo de busca
- **Exemplo de Requisição**:
  - Headers:
    - Authorization: Bearer {token}
- **Exemplo de Resposta**:
  ```json
  [
    {
      "id": "uuid",
      "name": "Pão Integral",
      "portion": "2 fatias",
      "calories": 140,
      "protein": 6,
      "carbs": 28,
      "fat": 2,
      "category": "Carboidratos",
      "tags": ["integral", "café da manhã"]
    }
  ]
  ```
- **Códigos de Status**:
  - 200: Lista de alimentos retornada com sucesso
  - 401: Não autorizado

---

#### Criar Plano a partir de Template

- **POST** `/meal-plan-templates/{id}/create-plan/{patientId}`
- **Descrição**: Cria um novo plano alimentar para um paciente a partir de um template.
- **Parâmetros**:
  - id (string, path): ID do template
  - patientId (string, path): ID do paciente
- **Exemplo de Requisição**:
  - Headers:
    - Authorization: Bearer {token}
- **Exemplo de Resposta**:
  ```json
  {
    "id": "uuid",
    "name": "Plano Alimentar - João",
    "description": "Plano alimentar baseado no Template Básico",
    "startDate": "2024-03-20T00:00:00Z",
    "endDate": "2024-03-27T00:00:00Z",
    "patient": {
      "id": "uuid",
      "name": "João Silva"
    },
    "meals": [
      {
        "id": "uuid",
        "name": "Café da Manhã",
        "description": "Refeição matinal",
        "time": "08:00",
        "foods": [
          {
            "id": "uuid",
            "name": "Pão Integral",
            "portion": "2 fatias",
            "calories": 140,
            "protein": 6,
            "carbs": 28,
            "fat": 2,
            "category": "Carboidratos",
            "consumed": false
          }
        ]
      }
    ],
    "createdAt": "2024-03-20T10:00:00Z",
    "updatedAt": "2024-03-20T10:00:00Z"
  }
  ```
- **Códigos de Status**:
  - 201: Plano criado com sucesso
  - 404: Template ou paciente não encontrado
  - 401: Não autorizado

---

### Medições e Composição Corporal (`/measurements`)

#### Listar Medições de um Paciente

- **GET** `/measurements/patient/:patientId`
- **Descrição**: Retorna todas as medições de um paciente, ordenadas por data
- **Parâmetros**:
  - patientId (string, path): ID do paciente
- **Exemplo de Resposta**:
  ```json
  [
    {
      "id": "uuid",
      "patientId": "uuid",
      "weight": 70.5,
      "height": 1.75,
      "bodyFat": 15.2,
      "muscleMass": 35.8,
      "measurements": {
        "chest": 95.5,
        "waist": 80.2,
        "hip": 98.7,
        "relaxedArmLeft": 31.2,
        "relaxedArmRight": 32.1,
        "contractedArmLeft": 33.5,
        "contractedArmRight": 34.0,
        "forearmLeft": 27.0,
        "forearmRight": 27.5,
        "proximalThighLeft": 58.0,
        "proximalThighRight": 58.5,
        "medialThighLeft": 50.0,
        "medialThighRight": 50.5,
        "distalThigh": 40.0,
        "calfLeft": 38.0,
        "calfRight": 38.5
      },
      "measureDate": "2024-03-20",
      "createdAt": "2024-03-20T10:00:00Z"
    }
  ]
  ```
- **Códigos de Status**:
  - 200: Lista de medições retornada com sucesso
  - 404: Paciente não encontrado
  - 401: Não autorizado

#### Criar Nova Medição

- **POST** `/measurements`
- **Descrição**: Registra uma nova medição para um paciente
- **Corpo da Requisição**:
  ```json
  {
    "patientId": "uuid",
    "weight": 70.5,
    "height": 1.75,
    "bodyFat": 15.2,
    "muscleMass": 35.8,
    "measurements": {
      "chest": 95.5,
      "waist": 80.2,
      "hip": 98.7,
      "relaxedArmLeft": 31.2,
      "relaxedArmRight": 32.1,
      "contractedArmLeft": 33.5,
      "contractedArmRight": 34.0,
      "forearmLeft": 27.0,
      "forearmRight": 27.5,
      "proximalThighLeft": 58.0,
      "proximalThighRight": 58.5,
      "medialThighLeft": 50.0,
      "medialThighRight": 50.5,
      "distalThigh": 40.0,
      "calfLeft": 38.0,
      "calfRight": 38.5
    },
    "measureDate": "2024-03-20"
  }
  ```
- **Respostas**:
  - 201: Medição criada com sucesso
  - 400: Dados inválidos
  - 404: Paciente não encontrado
  - 401: Não autorizado

---

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

---

## Códigos de Erro

- **400**: Dados inválidos fornecidos
- **401**: Não autorizado
- **403**: Acesso proibido
- **404**: Recurso não encontrado
- **409**: Conflito (ex: CPF/email já existe)
- **500**: Erro interno do servidor

---

## Autenticação

A API utiliza autenticação JWT (Bearer Token). Para acessar endpoints protegidos, inclua o token no header:

```
Authorization: Bearer <seu_token_jwt>
```

---

## Rate Limiting

- 100 requisições por minuto por IP
- 1000 requisições por hora por IP

---

## Versionamento

A API atual está na versão 1.0. O versionamento é feito através do header:

```
Accept: application/vnd.smartnutri.v1+json
```

---

### Fotos de Pacientes (`/photos`)

#### Upload de Foto

- **POST** `/photos`
- **Descrição**: Faz upload de uma foto de avaliação de paciente.
- **Headers**: `Content-Type: multipart/form-data`
- **Body** (form-data):
  - `file`: Arquivo de imagem (obrigatório)
  - `patientId`: string (obrigatório)
  - `assessmentId`: string (opcional)
  - `type`: "front" | "back" | "left" | "right" (obrigatório)
- **Resposta**:
  - 201: Metadados da foto criada
  - 400: Dados inválidos
  - 401: Não autorizado

#### Listar Fotos

- **GET** `/photos`
- **Descrição**: Lista fotos de pacientes, com filtros flexíveis.
- **Query Params**:
  - `patientId`: string (obrigatório)
  - `assessmentId`: string (opcional)
  - `type`: string (opcional)
  - `from`: string (data inicial, opcional)
  - `to`: string (data final, opcional)
  - `page`: number (opcional, default: 1)
  - `limit`: number (opcional, default: 20)
  - `order`: "asc" | "desc" (opcional, default: desc)
- **Resposta**:
  - 200: Lista paginada de fotos
  - 400: Dados inválidos
  - 401: Não autorizado

**Exemplo de requisição:**

```http
GET /photos?patientId=123&type=front&from=2024-01-01&to=2024-06-01&page=1&limit=10
```

**Exemplo de resposta:**

```json
{
  "data": [
    {
      "id": "uuid",
      "patientId": "uuid",
      "assessmentId": "uuid",
      "type": "front",
      "url": "https://...",
      "thumbnailUrl": "https://...",
      "storagePath": "...",
      "createdAt": "2024-05-01T10:00:00Z",
      "updatedAt": "2024-05-01T10:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

#### Remover Foto

- **DELETE** `/photos/:id`
- **Descrição**: Remove (soft delete) uma foto de paciente.
- **Resposta**:
  - 204: Foto removida
  - 404: Foto não encontrada
  - 401: Não autorizado

---

### Nutricionistas (`/nutritionists`)

#### Upload de Foto de Perfil

- **POST** `/nutritionists/:id/photo`
- **Descrição**: Faz upload da foto de perfil do nutricionista e armazena a URL no banco de dados.
- **Request**: multipart/form-data, campo `file` (imagem)
- **Respostas**:
  - 200: Nutricionista atualizado com a URL da foto
  - 404: Nutricionista não encontrado

---
