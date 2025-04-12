# TypeORM Migration Workflow

This document outlines the proper workflow for managing database schema changes in the SmartNutri application.

## Important Change: Synchronize Disabled

We've disabled TypeORM's automatic schema synchronization (`synchronize: false`) in all environments to prevent conflicts between entity definitions and migrations. This means all database schema changes must be done through migrations.

## Migration Workflow

### 1. Make Entity Changes

First, update your entity files with the new schema changes:

```typescript
// Example: Adding a new column to an entity
@Entity('users')
export class User {
  // Existing fields...

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;
}
```

### 2. Generate a Migration

After updating your entities, generate a migration that captures these changes:

```bash
npm run migration:generate -- src/migrations/AddIsVerifiedToUsers
```

This will create a new migration file in the `src/migrations` directory.

### 3. Review the Generated Migration

Always review the generated migration to ensure it does what you expect. You may need to modify it manually in some cases, especially for complex changes.

### 4. Run the Migration

Apply the migration to update the database schema:

```bash
npm run migration:run
```

### 5. Commit Both Entity and Migration Files

Always commit both your entity changes and the corresponding migration files together.

## Best Practices

1. **One Change, One Migration**: Each logical schema change should have its own migration.

2. **Check for Column Existence**: For critical migrations, consider adding checks to see if columns/tables already exist:

   ```typescript
   public async up(queryRunner: QueryRunner): Promise<void> {
     const table = await queryRunner.getTable("measurements");
     const columnExists = table.findColumnByName("consultation_id");

     if (!columnExists) {
       // Add column
     }
   }
   ```

3. **Test Migrations**: Always test migrations in a development environment before applying them to production.

4. **Never Modify Existing Migrations**: Once a migration has been applied and committed, never modify it. Create a new migration instead.

5. **Backup Before Production Migrations**: Always backup your production database before running migrations.

## Handling Migration Failures

If a migration fails:

1. Check the error message to understand what went wrong.
2. If the column already exists (like in our recent case), you can mark the migration as completed:

   ```sql
   INSERT INTO migrations (timestamp, name)
   VALUES (1712600100000, 'YourMigrationName');
   ```

3. For other errors, fix the issue and try again, or create a new migration that addresses the problem.

## Migration vs. Entity Synchronization

Remember that with `synchronize: false`:

- The database schema will **only** be updated through migrations
- Entity changes alone will not affect the database
- This provides better control and consistency across environments

By following this workflow, we can avoid the issues we encountered with the "consultation_id" column already existing in the database.
