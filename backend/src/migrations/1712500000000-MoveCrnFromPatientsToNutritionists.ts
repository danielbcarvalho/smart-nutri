import { MigrationInterface, QueryRunner } from 'typeorm';

export class MoveCrnFromPatientsToNutritionists1712500000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if crn column exists in patients table
    const checkColumnQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'patients' AND column_name = 'crn';
    `;

    const columnExists = await queryRunner.query(checkColumnQuery);
    console.log('CRN column check result:', columnExists);

    // If crn column doesn't exist in patients table, add it
    if (columnExists.length === 0) {
      console.log(
        'CRN column does not exist in patients table. Adding it now...',
      );
      await queryRunner.query(`
        ALTER TABLE "patients"
        ADD COLUMN "crn" character varying,
        ADD CONSTRAINT "UQ_patients_crn" UNIQUE ("crn")
      `);
      console.log('CRN column added to patients table.');
    }

    // Step 1: Update nutritionists table with CRN values from patients
    await queryRunner.query(`
      UPDATE nutritionists n
      SET crn = p.crn
      FROM patients p
      WHERE p.nutritionist_id = n.id AND p.crn IS NOT NULL AND n.crn IS NULL;
    `);

    // Step 2: Add unique constraint to nutritionist CRN if it doesn't exist
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'UQ_nutritionists_crn'
        ) THEN
          ALTER TABLE nutritionists
          ADD CONSTRAINT "UQ_nutritionists_crn" UNIQUE (crn);
        END IF;
      END $$;
    `);

    // Step 3: Remove CRN constraint and column from patients
    await queryRunner.query(`
      ALTER TABLE patients 
      DROP CONSTRAINT IF EXISTS "UQ_patients_crn",
      DROP COLUMN IF EXISTS crn;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Add CRN column back to patients
    await queryRunner.query(`
      ALTER TABLE patients 
      ADD COLUMN crn character varying,
      ADD CONSTRAINT "UQ_patients_crn" UNIQUE (crn);
    `);

    // Step 2: Copy CRN values from nutritionists back to patients
    await queryRunner.query(`
      UPDATE patients p
      SET crn = n.crn
      FROM nutritionists n
      WHERE p.nutritionist_id = n.id AND n.crn IS NOT NULL;
    `);

    // Step 3: Remove unique constraint from nutritionist CRN if needed
    // Note: We're not removing the constraint since it's conceptually correct
    // for nutritionists to have unique CRN values
  }
}
