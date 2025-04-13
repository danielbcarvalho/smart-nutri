# Guia de Migrations

## Visão Geral

Este documento descreve o processo de criação e gerenciamento de migrations no projeto SmartNutri. As migrations são usadas para controlar as mudanças no esquema do banco de dados de forma versionada e segura.

## Fluxo de Desenvolvimento Recomendado

### 1. Desenvolvimento Local

1. **Sempre use migrations**, mesmo em desenvolvimento:

   ```typescript
   // app.module.ts
   synchronize: false;
   ```

2. **Processo para mudanças no banco**:
   - Faça as alterações nas entidades
   - Gere a migration:
     ```bash
     npm run migration:generate -- src/migrations/NomeDaMigration
     ```
   - Teste a migration localmente:
     ```bash
     npm run migration:run
     ```
   - Se necessário, reverta e ajuste:
     ```bash
     npm run migration:revert
     ```

### 2. Preparação para Deploy

1. **Banco de Dados de Teste**:

   - Mantenha um banco de dados de teste com o mesmo esquema da produção
   - Execute todas as migrations neste banco antes do deploy
   - Teste a aplicação com este banco

2. **Deploy**:
   - As migrations são executadas automaticamente durante o deploy
   - O processo de deploy deve incluir:
     ```bash
     npm run migration:run
     ```

## Por que não usar `synchronize: true`?

1. **Consistência**:

   - Garante que desenvolvimento e produção usem o mesmo processo
   - Evita problemas de "funciona na minha máquina"

2. **Segurança**:

   - Controle total sobre as mudanças no banco
   - Possibilidade de rollback
   - Histórico de mudanças

3. **Qualidade**:
   - Força a pensar nas mudanças antes de aplicá-las
   - Facilita a revisão de código
   - Melhor documentação das mudanças

## Processo Detalhado de Criação de Migrations

### 1. Criando uma Nova Migration

1. Faça as alterações necessárias nas entidades
2. Gere a migration:
   ```bash
   npm run migration:generate -- src/migrations/NomeDaMigration
   ```
3. Revise o arquivo gerado:
   - Verifique se o SQL gerado está correto
   - Adicione comentários explicativos
   - Teste o método `down`

### 2. Testando a Migration

1. Execute a migration localmente:
   ```bash
   npm run migration:run
   ```
2. Verifique se a aplicação funciona com as mudanças
3. Teste o rollback:
   ```bash
   npm run migration:revert
   ```
4. Execute novamente para confirmar:
   ```bash
   npm run migration:run
   ```

## Boas Práticas

1. **Nomes Descritivos**:

   - Use nomes que descrevam claramente a mudança
   - Exemplo: `AddInstagramToPatient`
   - Exemplo: `CreateConsultationsTable`

2. **Migrations Atômicas**:

   - Cada migration deve fazer uma única mudança lógica
   - Não misture várias mudanças não relacionadas
   - Facilita o rollback se necessário

3. **Teste de Rollback**:

   - Sempre teste se o `down` funciona corretamente
   - Garante que podemos reverter se necessário

4. **Documentação**:
   - Adicione comentários explicando mudanças complexas
   - Documente decisões importantes
   - Inclua exemplos se necessário

## Comandos Úteis

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

## Checklist para Novas Migrations

- [ ] Migration tem um nome descritivo
- [ ] Migration é atômica (faz uma única mudança lógica)
- [ ] Método `up` está correto e testado
- [ ] Método `down` está correto e testado
- [ ] Migration está documentada
- [ ] Migration foi testada localmente
- [ ] Migration foi revisada por outro desenvolvedor
- [ ] Migration foi testada no banco de teste

## Exemplos de Migrations

### Adicionar Nova Coluna

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

### Criar Nova Tabela

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

### Adicionar Índice

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
