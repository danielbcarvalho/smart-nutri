# SmartNutri API Documentation

## Templates de Planos Alimentares

### Listar Templates

```http
GET /meal-plan-templates
```

**Headers:**

```
Authorization: Bearer {token}
```

**Response:**

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

### Criar Template

```http
POST /meal-plan-templates
```

**Headers:**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

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

### Buscar Template

```http
GET /meal-plan-templates/{id}
```

**Headers:**

```
Authorization: Bearer {token}
```

### Atualizar Template

```http
PATCH /meal-plan-templates/{id}
```

**Headers:**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Template Básico Atualizado",
  "description": "Plano alimentar básico atualizado",
  "isPublic": false
}
```

### Remover Template

```http
DELETE /meal-plan-templates/{id}
```

**Headers:**

```
Authorization: Bearer {token}
```

### Buscar Alimentos

```http
GET /meal-plan-templates/search/foods?query={termo}
```

**Headers:**

```
Authorization: Bearer {token}
```

**Response:**

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

### Criar Plano a partir de Template

```http
POST /meal-plan-templates/{id}/create-plan/{patientId}
```

**Headers:**

```
Authorization: Bearer {token}
```

**Response:**

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
