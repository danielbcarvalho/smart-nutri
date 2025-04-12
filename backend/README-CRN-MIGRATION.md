# CRN Field Migration

This document provides information about the migration that moves the CRN (Nutritionist Registration Number) field from the `patients` table to the `nutritionists` table where it conceptually belongs.

## Background

In the initial database design, the CRN field was incorrectly placed in the `patients` table. This migration corrects this design issue by:

1. Moving existing CRN values from patients to their associated nutritionists
2. Adding a unique constraint to the CRN field in the nutritionists table
3. Removing the CRN field from the patients table

## Migration Details

The migration is implemented in the file:
`src/migrations/1712500000000-MoveCrnFromPatientsToNutritionists.ts`

It performs the following steps:

1. Updates the nutritionists table with CRN values from their patients
2. Adds a unique constraint to the nutritionist CRN field
3. Removes the CRN constraint and column from the patients table

## Running the Migration

You can run the migration using the provided script:

```bash
node scripts/run-crn-migration.js
```

Or manually with the TypeORM CLI:

```bash
npm run typeorm migration:run -- -d src/config/typeorm.migrations.config.ts
```

## Rollback

If you need to rollback this migration, you can use:

```bash
npm run typeorm migration:revert -- -d src/config/typeorm.migrations.config.ts
```

The rollback will:

1. Add the CRN column back to the patients table
2. Copy CRN values from nutritionists back to their associated patients
3. Keep the unique constraint on the nutritionist CRN field (as it's conceptually correct)

## Entity Changes

The `Nutritionist` entity has been updated to reflect the unique constraint on the CRN field:

```typescript
@Column({ nullable: true, unique: true })
crn: string;
```

## Important Notes

1. This migration assumes that patients with CRN values are associated with a nutritionist. Any CRN values for patients without an associated nutritionist will not be preserved.

2. After this migration, the CRN field should only be used in the `Nutritionist` entity and related services/controllers.

3. Any code that previously accessed the CRN field from the Patient entity will need to be updated to access it from the associated Nutritionist entity instead.
