# Módulo Foods (backend/src/foods)

Este módulo gerencia o cadastro, busca, atualização e remoção de alimentos na aplicação, além de integrar com a Tabela Brasileira de Composição de Alimentos (TBCA).

## Principais Funcionalidades

- Cadastro manual de alimentos
- Busca de alimentos por nome, categoria ou classe
- Busca por faixa de nutrientes
- Listagem de todos os alimentos cadastrados
- Marcação de alimentos como favoritos
- Integração com TBCA para importação de dados nutricionais
- Atualização e remoção de alimentos

## Modelo de Dados (Entidade Food)

- `id`: UUID
- `name`: Nome do alimento
- `externalId`: ID na fonte externa (ex: código TBCA)
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

### Importar alimento da TBCA

- `POST /foods/save-from-tbca`
- Body: `{ codigo }`
- Também suporta o endpoint legado:
  - `POST /foods/save-from-api`
  - Body: `{ codigo }`

### Listar todos os alimentos

- `GET /foods`

### Buscar alimentos (local + TBCA)

- `GET /foods/search?query=maçã&page=0&pageSize=20`
- Parâmetros:
  - `query` (string, obrigatório): termo de busca (mín. 2 caracteres)
  - `page` (opcional, default 0): página dos resultados
  - `pageSize` (opcional, default 20, máx. 50): itens por página
- Retorna: lista de alimentos do banco local e, se necessário, complementa com resultados da TBCA

### Buscar alimento da TBCA por código

- `GET /foods/tbca/:codigo`
- Retorna: informações detalhadas do alimento correspondente ao código na TBCA

### Buscar alimentos da TBCA por classe

- `GET /foods/tbca/class/:classe`
- Parâmetros:
  - `classe` (string, obrigatório): classe de alimentos (ex: "Cereais e derivados")
  - `limit` (opcional, default 20): quantidade máxima de resultados
  - `offset` (opcional, default 0): offset para paginação
- Retorna: lista de alimentos da classe especificada

### Buscar alimentos da TBCA por faixa de nutriente

- `GET /foods/tbca/nutrient/:nutrient`
- Parâmetros:
  - `nutrient` (string, obrigatório): nome do nutriente (ex: "proteina")
  - `min` (opcional): valor mínimo para o nutriente
  - `max` (opcional): valor máximo para o nutriente
  - `limit` (opcional, default 20): quantidade máxima de resultados
  - `offset` (opcional, default 0): offset para paginação
- Retorna: lista de alimentos com valores do nutriente dentro da faixa especificada

### Listar favoritos

- `GET /foods/favorites`

### Buscar alimento por ID

- `GET /foods/:id`

### Atualizar alimento

- `PATCH /foods/:id`
- Body: `{ ...campos editáveis }`

### Remover alimento

- `DELETE /foods/:id`

### Alternar favorito

- `POST /foods/:id/favorite`

## Integração com TBCA

O módulo integra com o banco de dados MongoDB que contém os dados da Tabela Brasileira de Composição de Alimentos (TBCA). Os dados são consultados através do serviço `TbcaDatabaseService`.

Os alimentos da TBCA possuem:

- Dados de macronutrientes (energia, proteínas, carboidratos, gorduras)
- Classificação em categorias (ex: Cereais e derivados, Frutas, etc.)
- Informações detalhadas sobre micronutrientes

## Conversão de dados

Os dados da TBCA (modelo `Alimento`) são convertidos para o formato interno da aplicação (modelo `Food`) através do adaptador `AlimentoToFoodAdapter`.

## Exemplo de Busca

```http
GET /foods/search?query=banana&page=0&pageSize=10
```

## Possíveis Erros e Dicas

- **404 Not Found em /foods/search**:

  - Verifique se está usando o método GET (não POST)
  - Certifique-se de que o backend está rodando e a rota está exposta
  - O parâmetro `query` é obrigatório e deve ter pelo menos 2 caracteres
  - Se estiver usando proxy/reverse proxy, confira o mapeamento de rotas

- **Erro ao buscar dados da TBCA**:
  - Verifique se a conexão com o MongoDB está correta
  - Confirme que o banco de dados `tbca_database` está acessível
  - Verifique se a coleção `alimentos` contém dados

## Dependências

- TypeORM (entidade Food)
- Mongoose (schema Alimento)
- NestJS HttpModule (para integrações futuras)
- TbcaDatabaseService (serviço de acesso à TBCA)

## Observações

- O módulo prioriza o uso de dados locais e complementa com dados da TBCA quando necessário
- Os alimentos importados da TBCA são salvos localmente para acesso mais rápido
- O campo `sourceId` armazena o código original do alimento na TBCA
- O uso de favoritos e contadores auxilia na personalização e ranking dos alimentos
