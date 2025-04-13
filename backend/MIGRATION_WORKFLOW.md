# TypeORM Migration Workflow

Este documento descreve o fluxo de trabalho para gerenciar migrações de banco de dados no SmartNutri.

## Localização das Migrations

Todas as migrações devem ser criadas e mantidas em `backend/src/migrations/`. Esta é a única localização válida para migrações no projeto.

## Fluxo de Trabalho

### 1. Fazer Alterações nas Entidades

Primeiro, atualize seus arquivos de entidade com as mudanças desejadas:

```typescript
// Exemplo: Adicionando uma nova coluna
@Entity('users')
export class User {
  // Campos existentes...

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;
}
```

### 2. Gerar uma Migration

Após atualizar as entidades, gere uma migration que capture essas mudanças:

```bash
npm run migration:generate -- src/migrations/NomeDaMigration
```

Isso criará um novo arquivo de migration em `backend/src/migrations/`.

### 3. Revisar a Migration Gerada

Sempre revise a migration gerada para garantir que ela faz o que você espera. Em alguns casos, especialmente para mudanças complexas, você pode precisar modificar manualmente.

### 4. Executar a Migration

Aplique a migration para atualizar o schema do banco:

```bash
npm run migration:run
```

### 5. Commitar as Mudanças

Sempre commite tanto as mudanças nas entidades quanto os arquivos de migration correspondentes juntos.

## Boas Práticas

1. **Uma Mudança, Uma Migration**: Cada mudança lógica no schema deve ter sua própria migration.

2. **Verificar Existência de Colunas**: Para migrations críticas, considere adicionar verificações de existência:

   ```typescript
   public async up(queryRunner: QueryRunner): Promise<void> {
     const table = await queryRunner.getTable("measurements");
     const columnExists = table.findColumnByName("consultation_id");

     if (!columnExists) {
       // Adicionar coluna
     }
   }
   ```

3. **Testar Migrations**: Sempre teste as migrations em ambiente de desenvolvimento antes de aplicar em produção.

4. **Nunca Modificar Migrations Existentes**: Uma vez que uma migration foi aplicada e commitada, nunca a modifique. Crie uma nova migration se necessário.

5. **Backup Antes de Migrations em Produção**: Sempre faça backup do banco de produção antes de executar migrations.

## Tratamento de Falhas em Migrations

Se uma migration falhar:

1. Verifique a mensagem de erro para entender o problema
2. Se a coluna já existe (como no caso recente), você pode marcar a migration como concluída:

   ```sql
   INSERT INTO migrations (timestamp, name)
   VALUES (1712600100000, 'NomeDaSuaMigration');
   ```

3. Para outros erros, corrija o problema e tente novamente, ou crie uma nova migration que resolva o problema.

## Migration vs. Sincronização de Entidades

Lembre-se que com `synchronize: false`:

- O schema do banco só será atualizado através de migrations
- Mudanças nas entidades sozinhas não afetarão o banco
- Isso proporciona melhor controle e consistência entre ambientes

Seguindo este fluxo de trabalho, podemos evitar problemas como o que encontramos com a coluna "consultation_id" já existente no banco.
