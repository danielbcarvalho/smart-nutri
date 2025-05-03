# SmartNutri Database Documentation

## 1. Database Schema

### 📊 ER Diagram

```mermaid
erDiagram
    Nutritionist ||--o{ Patient : manages
    Nutritionist ||--o{ MealPlan : creates
    Nutritionist ||--o{ Measurement : records
    Patient ||--o{ MealPlan : has
    Patient ||--o{ Measurement : has
    MealPlan ||--|{ Meal : contains
    Meal ||--|{ Food : contains

    Nutritionist {
        uuid id PK
        string name
        string email UK
        string password_hash
        string phone "nullable"
        string crn "nullable"
        jsonb specialties "nullable"
        string clinic_name "nullable"
        string photo_url "nullable"
        timestamp created_at
        timestamp updated_at
    }

    Patient {
        uuid id PK
        uuid nutritionistId FK "nullable"
        string name
        string email UK "nullable"
        string phone "nullable"
        date birthDate "nullable"
        enum gender "nullable"
        decimal height "nullable"
        decimal weight "nullable"
        string crn UK "nullable"
        timestamp last_consultation_at "nullable"
        timestamp next_consultation_at "nullable"
        enum monitoring_status "DEFAULT 'in_progress'"
        enum consultation_frequency "DEFAULT 'monthly'"
        int custom_consultation_days "nullable"
        jsonb goals "nullable"
        jsonb allergies "nullable"
        jsonb healthConditions "nullable"
        jsonb medications "nullable"
        string observations "nullable"
        string photo_url "nullable"
        timestamp created_at
        timestamp updated_at
    }

    Measurement {
        uuid id PK
        uuid patient_id FK
        uuid nutritionistId FK "nullable"
        decimal weight
        decimal height
        decimal bodyFat
        decimal muscleMass
        jsonb measurements
        date measureDate
        timestamp created_at
    }

    MealPlan {
        uuid id PK
        uuid patient_id FK
        uuid nutritionistId FK "nullable"
        string name
        string description
        enum status
        date startDate
        date endDate
        timestamp created_at
        timestamp updated_at
    }

    Meal {
        uuid id PK
        uuid plan_id FK
        string name
        string description
        time time
        int order
        timestamp created_at
        timestamp updated_at
    }

    Food {
        uuid id PK
        uuid meal_id FK
        string name
        string portion
        decimal calories
        decimal protein
        decimal carbs
        decimal fat
        timestamp created_at
        timestamp updated_at
    }
```

### 📝 Table Details

#### Nutritionists

- Stores nutritionist information.
- **Fields:** id (PK), name, email (unique), password_hash, phone, crn, specialties, clinic_name, photo_url, created_at, updated_at

#### Patients

- Stores patient information.
- **Fields:** id (PK), nutritionistId (FK), name, email (unique), phone, birthDate, gender, height, weight, crn (unique), last_consultation_at, next_consultation_at, monitoring_status, consultation_frequency, custom_consultation_days, goals, allergies, healthConditions, medications, observations, photo_url, created_at, updated_at

#### Measurements

- Records physical measurements and assessments.
- **Fields:**
  - id (PK): UUID
  - patient_id (FK): Referência ao paciente
  - nutritionistId (FK): Referência ao nutricionista
  - weight: Peso em kg
  - height: Altura em metros
  - bodyFat: Percentual de gordura corporal
  - muscleMass: Massa muscular em kg
  - measurements (JSONB): Medições detalhadas
    ```json
    {
      "skinfolds": {
        "triceps": 10.5,
        "subscapular": 12.3,
        "suprailiac": 8.7,
        "abdominal": 15.2
      },
      "circumferences": {
        "chest": 95.5,
        "waist": 80.2,
        "hip": 98.7,
        "thigh": 55.3
      }
    }
    ```
  - measureDate: Data da medição
  - created_at: Timestamp de criação

#### MealPlans

- Meal plans created for patients.
- **Fields:** id (PK), patient_id (FK), nutritionistId (FK), name, description, status, startDate, endDate, created_at, updated_at

#### Meals

- Meals that compose a meal plan.
- **Fields:** id (PK), plan_id (FK), name, description, time, order, created_at, updated_at

#### Foods

- Foods that compose a meal.
- **Fields:** id (PK), meal_id (FK), name, portion, calories, protein, carbs, fat, created_at, updated_at

### 🔄 Relationships

- Nutritionist manages Patients, creates MealPlans, records Measurements
- Patient has MealPlans and Measurements
- MealPlan contains Meals
- Meal contains Foods

### 📌 Important Notes

- **JSONB fields** for flexible data (goals, allergies, specialties, etc.)
- **Soft Delete:** Not implemented initially, consider for future
- **Timestamps:** All tables have created_at, main tables have updated_at
- **Enums:** gender, status, monitoring_status, consultation_frequency
- **CRN in Patients:** Currently in patients table, ideally belongs to nutritionists

### 🔒 Constraints & Validations

- Unique emails when present
- Positive values for measurements
- Date constraints (e.g., endDate >= startDate)
- Unique order for meals per plan
- Defaults: monitoring_status ('in_progress'), consultation_frequency ('monthly')

### Exemplos de Queries

#### Buscar Evolução de Medições

```sql
-- Buscar evolução de peso e composição corporal
SELECT
    m.measureDate,
    m.weight,
    m.bodyFat,
    m.muscleMass,
    m.measurements->>'skinfolds' as skinfolds,
    m.measurements->>'circumferences' as circumferences
FROM measurements m
WHERE m.patient_id = :patientId
ORDER BY m.measureDate DESC;
```

#### Calcular Variação Percentual

```sql
-- Calcular variação percentual entre medições
WITH measurements_ordered AS (
    SELECT
        m.measureDate,
        m.weight,
        m.bodyFat,
        m.muscleMass,
        LAG(m.weight) OVER (ORDER BY m.measureDate) as prev_weight,
        LAG(m.bodyFat) OVER (ORDER BY m.measureDate) as prev_bodyFat,
        LAG(m.muscleMass) OVER (ORDER BY m.measureDate) as prev_muscleMass
    FROM measurements m
    WHERE m.patient_id = :patientId
)
SELECT
    measureDate,
    weight,
    bodyFat,
    muscleMass,
    ROUND((weight - prev_weight) / prev_weight * 100, 2) as weight_change_percent,
    ROUND((bodyFat - prev_bodyFat) / prev_bodyFat * 100, 2) as bodyFat_change_percent,
    ROUND((muscleMass - prev_muscleMass) / prev_muscleMass * 100, 2) as muscleMass_change_percent
FROM measurements_ordered
ORDER BY measureDate DESC;
```

---

### Photos

- Armazena metadados das fotos de avaliações de pacientes.
- **Fields:**
  - id (PK, uuid)
  - patient_id (FK, uuid, obrigatório)
  - assessment_id (FK, uuid, opcional)
  - type (enum: 'front', 'back', 'left', 'right', obrigatório)
  - url (string, obrigatório)
  - thumbnail_url (string, obrigatório)
  - storage_path (string, obrigatório)
  - created_at (timestamp, default now)
  - updated_at (timestamp, default now)
  - deleted_at (timestamp, nullable, para soft delete)

**Constraints:**

- FK para patients e assessments
- Soft delete via deleted_at
- Index em patient_id, assessment_id, created_at

**Exemplo de Query: Buscar fotos de um paciente por período**

```sql
SELECT * FROM photos
WHERE patient_id = :patientId
  AND (deleted_at IS NULL)
  AND (created_at >= :from OR :from IS NULL)
  AND (created_at <= :to OR :to IS NULL)
ORDER BY created_at DESC;
```

**Exemplo de Query: Buscar fotos de um tipo específico**

```sql
SELECT * FROM photos
WHERE patient_id = :patientId
  AND type = 'front'
  AND (deleted_at IS NULL)
ORDER BY created_at DESC;
```

---

## 2. Migrations

### Visão Geral

As migrations controlam mudanças no esquema do banco de dados de forma versionada e segura.

### Fluxo de Desenvolvimento Recomendado

#### 1. Desenvolvimento Local

- Sempre use migrations, mesmo em desenvolvimento:
  ```typescript
  // app.module.ts
  synchronize: false;
  ```
- Processo para mudanças no banco:
  1. Altere as entidades
  2. Gere a migration:
     ```bash
     npm run migration:generate -- src/migrations/NomeDaMigration
     ```
  3. Teste a migration localmente:
     ```bash
     npm run migration:run
     ```
  4. Se necessário, reverta e ajuste:
     ```bash
     npm run migration:revert
     ```

#### 2. Preparação para Deploy

- Mantenha um banco de teste igual ao de produção
- Execute todas as migrations neste banco antes do deploy
- Teste a aplicação com este banco
- Durante o deploy, execute:
  ```bash
  npm run migration:run
  ```

### Por que não usar `synchronize: true`?

- Garante consistência entre ambientes
- Controle total sobre mudanças
- Possibilidade de rollback e histórico
- Força a pensar e documentar mudanças

### Processo Detalhado de Criação de Migrations

1. Altere as entidades
2. Gere a migration:
   ```bash
   npm run migration:generate -- src/migrations/NomeDaMigration
   ```
3. Revise o arquivo gerado (SQL, comentários, método `down`)
4. Teste localmente:
   ```bash
   npm run migration:run
   npm run migration:revert
   npm run migration:run
   ```

### Boas Práticas

- Use nomes descritivos (ex: `AddInstagramToPatient`)
- Migrations atômicas (uma mudança lógica por migration)
- Sempre teste o rollback (`down`)
- Documente mudanças complexas

### Comandos Úteis

```bash
# Gerar uma nova migration
npm run migration:generate -- src/migrations/NomeDaMigration

# Executar migrations pendentes
npm run migration:run

# Reverter a última migration
npm run migration:revert

# Verificar status das migrations
npm run migration:show
```

### Checklist para Novas Migrations

- [ ] Nome descritivo
- [ ] Atômica
- [ ] Métodos `up` e `down` corretos e testados
- [ ] Documentada
- [ ] Testada localmente e no banco de teste
- [ ] Revisada por outro desenvolvedor

### Exemplos

#### Adicionar Nova Coluna

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "patients"
        ADD COLUMN "instagram" character varying
    `);
}

public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "patients"
        DROP COLUMN "instagram"
    `);
}
```

#### Criar Nova Tabela

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "consultations" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "date" TIMESTAMP NOT NULL,
            "notes" text,
            "patient_id" uuid NOT NULL,
            CONSTRAINT "PK_consultations" PRIMARY KEY ("id"),
            CONSTRAINT "FK_consultations_patient" FOREIGN KEY ("patient_id")
            REFERENCES "patients"("id") ON DELETE CASCADE
        )
    `);
}

public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "consultations"`);
}
```

#### Adicionar Índice

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE INDEX "IDX_foods_name"
        ON "foods" ("name")
    `);
}

public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP INDEX "IDX_foods_name"
    `);
}
```

## 🧹 Limpeza e Reset do Banco de Dados

Para situações em que é necessário limpar todos os dados do banco de dados e começar do zero, o projeto disponibiliza scripts específicos:

### Scripts Disponíveis

- `scripts/clean-dev-db.js`: Limpa todos os dados do banco de desenvolvimento (mantendo a estrutura)
- `scripts/clean-prod-db.js`: Limpa todos os dados do banco de produção (com confirmações de segurança)
- `scripts/clean-supabase-storage.js`: Limpa os arquivos armazenados no Supabase Storage
- `scripts/reset-all.js`: Script completo que limpa os dados do banco de dados, o armazenamento Supabase e executa as migrations para garantir que a estrutura esteja atualizada

### Fluxo Recomendado para Reset Completo

1. Faça backup dos dados importantes se necessário
2. Execute o script de reset completo:

   ```bash
   # Para desenvolvimento
   node backend/scripts/reset-all.js

   # Para produção (com confirmações adicionais de segurança)
   NODE_ENV=production node backend/scripts/reset-all.js
   ```

3. O script irá:
   - Limpar todos os dados das tabelas do banco de dados (preservando a estrutura)
   - Limpar todos os arquivos do Supabase Storage
   - Executar as migrations para garantir que a estrutura do banco esteja atualizada

> ⚠️ **ATENÇÃO**: Estes scripts são destrutivos e eliminam permanentemente todos os dados. Eles usam `TRUNCATE TABLE CASCADE` para limpar as tabelas, o que contorna as restrições de chave estrangeira de forma segura. Use com extrema cautela, especialmente em ambiente de produção.

## 2. MongoDB Integration

### Visão Geral

Além do PostgreSQL utilizado como banco principal, o sistema agora utiliza exclusivamente o MongoDB para armazenar e consultar dados de alimentos. O serviço OpenFoodFacts anteriormente utilizado foi substituído por uma base de dados local no MongoDB, oferecendo informações mais precisas e completas sobre alimentos brasileiros.

### Configuração do MongoDB

A conexão com o MongoDB era configurada através do MongooseModule no NestJS, definida no arquivo `app.module.ts`:

```typescript
// MongooseModule.forRootAsync({
//   imports: [ConfigModule],
//   useFactory: (configService: ConfigService) => ({
//     uri:
//       configService.get('MONGODB_URI') ||
//       'mongodb://localhost:27017/tbca_database',
//   }),
//   inject: [ConfigService],
// });
```

### Bancos e Coleções

#### 1. tbca_database

Base de dados que armazena informações sobre alimentos da TBCA (Tabela Brasileira de Composição de Alimentos).

##### Coleção: alimentos

Armazena informações detalhadas sobre os alimentos brasileiros e suas composições nutricionais.

**Schema:**

```typescript
@Schema({ timestamps: true })
export class Alimento {
  @Prop({ required: true, unique: true })
  codigo: string;

  @Prop({ required: true })
  classe: string;

  @Prop({ required: true })
  descricao: string;

  @Prop()
  descricao_simplificada: string;

  @Prop([String])
  tags: string[];

  @Prop({ type: Object })
  nutrientes: Record<string, Nutriente>;

  @Prop([Object])
  nutrientes_array: Array<{
    componente: string;
    unidade: string;
    valor_por_100g: number | string;
  }>;

  @Prop({ type: Object })
  metadados: {
    ultima_atualizacao: Date;
    fonte: string;
    versao_scraper: string;
  };
}
```

**Índices:**

- `codigo`: Índice único para o código do alimento
- Índice de texto composto em `descricao`, `descricao_simplificada` e `tags`
- Índices em nutrientes comuns: proteina, energia_kcal, carboidrato_total, lipidios

**Uso na Aplicação:**
Esta base de dados é a fonte primária de informações nutricionais no sistema, substituindo completamente a dependência externa do OpenFoodFacts. As principais funcionalidades incluem:

1. **Busca textual**: Pesquisa de alimentos por texto em descrições e tags
2. **Filtragem por classe**: Busca de alimentos por categoria/classe
3. **Filtragem por nutrientes**: Busca de alimentos por faixa de valores nutricionais
4. **Cache local**: Alimentos encontrados são salvos no PostgreSQL para rápido acesso futuro

**Endpoints disponíveis:**

- `POST /foods/save-from-tbca`: Salva um alimento da TBCA no banco local
- `GET /foods/tbca/:codigo`: Busca um alimento específico por código TBCA
- `GET /foods/tbca/class/:classe`: Lista alimentos de uma classe específica
- `GET /foods/tbca/nutrient/:nutrient`: Filtra alimentos por valores de nutriente

**Adaptador:**
O sistema utiliza o `AlimentoToFoodAdapter` para converter documentos do MongoDB para entidades Food utilizadas no sistema PostgreSQL, garantindo uma integração perfeita entre as bases de dados.

## Ambiente de Desenvolvimento Local

### Passo a passo para rodar o banco local e iniciar o backend

1. **(Opcional) Suba o PostgreSQL localmente com Docker:**

   - Se preferir usar Docker, crie o arquivo `docker-compose.yml` conforme exemplo abaixo e rode:
     ```bash
     docker compose up -d
     ```
   - Se já tem PostgreSQL instalado localmente, pode pular este passo.

2. **Configure o arquivo `.env.development` (ou `.env` local):**

   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=smartnutri
   DB_DATABASE=smartnutri_db
   ```

3. **Crie o banco de dados (se ainda não existir):**

   ```bash
   psql -U postgres -c "CREATE DATABASE smartnutri_db;"
   ```

   (ou use uma ferramenta gráfica como DBeaver, TablePlus, etc)

4. **Rode as migrations para criar as tabelas e estrutura:**

   ```bash
   npm run migration:run
   ```

5. **Inicie o backend em modo desenvolvimento:**
   ```bash
   npm run start:dev
   ```

> Em produção/cloud, utilize a variável `DATABASE_URL` conforme documentado no README.

## ⚠️ Backup obrigatório antes de alterações em produção

> **Sempre gere um backup do banco de produção antes de rodar migrations ou realizar qualquer alteração estrutural.**
>
> Isso garante que você pode restaurar o banco em caso de erro, perda de dados ou rollback necessário.
>
> Utilize o script `backup-prod-db.sh` conforme instruído na seção de scripts.

## Deploy Seguro de Migrations em Produção (Railway)

Siga este passo a passo sempre que for subir alterações no banco de dados para produção usando Railway:

1. **Gere e revise as migrations localmente**

   - Crie migrations atômicas e bem descritas para cada alteração de schema.
   - Teste as migrations localmente e, se possível, em um ambiente de staging/homologação.

2. **Garanta que o código e as migrations estejam versionados**

   - Faça commit das migrations junto com o código relacionado.
   - Nunca edite migrations já aplicadas em produção.

3. **Backup do banco de produção (Railway) — obrigatório!**

   - Gere o backup manualmente usando o script:
     ```bash
     export DATABASE_URL="postgresql://..." # Copie do Railway
     ./backup-prod-db.sh
     ```
   - Guarde o arquivo `.backup` em local seguro.

4. **Deploy do código para produção**

   - Faça o deploy do backend para o Railway (merge/push para branch de produção ou deploy manual).
   - Certifique-se de que o código novo está disponível antes de rodar as migrations.

5. **Acesse o terminal do Railway para rodar as migrations**

   - No painel do Railway, acesse o projeto do backend.
   - Clique em **"Shell"** ou **"Launch Console"** para abrir um terminal no container do backend.

6. **Rode as migrations no ambiente de produção**

   - No terminal do Railway, execute:
     ```bash
     npm run migration:run
     ```
   - Aguarde a execução e monitore o log para garantir que todas as migrations foram aplicadas sem erro.

7. **Reinicie o serviço do backend (se necessário)**

   - O Railway normalmente reinicia automaticamente após deploy, mas reinicie manualmente se necessário.

8. **Valide a aplicação**

   - Teste endpoints críticos e funcionalidades principais.
   - Monitore os logs do Railway para identificar possíveis problemas rapidamente.

9. **Documente a alteração**
   - Atualize a documentação do banco e do deploy, se necessário.
   - Anote o número/nome das migrations aplicadas.

> **Dicas:**
>
> - Nunca edite migrations já aplicadas em produção. Sempre crie uma nova migration para corrigir ou evoluir o schema.
> - Evite migrations destrutivas (DROP COLUMN, DROP TABLE) sem backup e validação.
> - Sempre teste as migrations em um banco de staging idêntico ao de produção antes do deploy real.

## Scripts de Backup e Restauração

Para padronizar e facilitar o processo de backup e restauração do banco de produção Railway, utilize os scripts abaixo:

### Backup do banco de produção Railway

```bash
cd backend/scripts
export DATABASE_URL="postgresql://postgres:UXXzlYuDhPjRdXhFoppnNxmmvQSWLCKH@gondola.proxy.rlwy.net:23089/railway" # Copie do Railway
./backup-prod-db.sh
```

O backup será salvo no formato `.backup` com data/hora no nome do arquivo.

### Restauração do backup em banco local

```bash
cd backend/scripts
./restore-backup-local.sh backup_producao_railway_YYYY-MM-DD_HH-MM-SS.backup
```

O script irá dropar e recriar o banco local `smartnutri_db` e restaurar o backup nele.

> **Atenção:** É necessário ter o PostgreSQL instalado localmente e os comandos `pg_dump`, `pg_restore`, `dropdb` e `createdb` disponíveis no PATH.
