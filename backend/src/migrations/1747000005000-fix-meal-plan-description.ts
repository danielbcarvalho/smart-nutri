import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixMealPlanDescription1747000005000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verifica se a coluna description existe
    const columnExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'meal_plans' 
        AND column_name = 'description'
      );
    `);

    if (!columnExists[0].exists) {
      // Se não existir, cria a coluna
      await queryRunner.query(`
        ALTER TABLE "meal_plans" 
        ADD COLUMN "description" text;
      `);
    }

    // Verifica se a coluna notes existe
    const notesColumnExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'meal_plans' 
        AND column_name = 'notes'
      );
    `);

    if (notesColumnExists[0].exists) {
      // Se notes existir, copia os dados para description e remove notes
      await queryRunner.query(`
        UPDATE "meal_plans" 
        SET "description" = "notes" 
        WHERE "description" IS NULL;
      `);

      await queryRunner.query(`
        ALTER TABLE "meal_plans" 
        DROP COLUMN "notes";
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Não fazemos nada no down pois não queremos perder os dados
  }
}
