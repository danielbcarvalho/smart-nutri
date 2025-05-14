import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCascadeDeleteToMealPlans1745070000001
  implements MigrationInterface
{
  name = 'AddCascadeDeleteToMealPlans1745070000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, drop the existing foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "meal_plans" 
      DROP CONSTRAINT IF EXISTS "FK_35128838fc51bbb14f26e10fda7"
    `);

    // Then add the new constraint with CASCADE delete
    await queryRunner.query(`
      ALTER TABLE "meal_plans" 
      ADD CONSTRAINT "FK_35128838fc51bbb14f26e10fda7" 
      FOREIGN KEY ("patient_id") 
      REFERENCES "patients"("id") 
      ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the CASCADE constraint
    await queryRunner.query(`
      ALTER TABLE "meal_plans" 
      DROP CONSTRAINT IF EXISTS "FK_35128838fc51bbb14f26e10fda7"
    `);

    // Add back the original constraint without CASCADE
    await queryRunner.query(`
      ALTER TABLE "meal_plans" 
      ADD CONSTRAINT "FK_35128838fc51bbb14f26e10fda7" 
      FOREIGN KEY ("patient_id") 
      REFERENCES "patients"("id")
    `);
  }
}
