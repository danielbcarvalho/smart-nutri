import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNutritionistRelationships1712432300000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adiciona coluna nutritionistId em patients
    await queryRunner.query(`
      ALTER TABLE "patients" 
      ADD COLUMN "nutritionistId" uuid,
      ADD CONSTRAINT "FK_patients_nutritionist" 
      FOREIGN KEY ("nutritionistId") 
      REFERENCES "nutritionists"("id") 
      ON DELETE NO ACTION 
      ON UPDATE NO ACTION
    `);

    // Adiciona coluna nutritionistId em meal_plans
    await queryRunner.query(`
      ALTER TABLE "meal_plans" 
      ADD COLUMN "nutritionistId" uuid,
      ADD CONSTRAINT "FK_meal_plans_nutritionist" 
      FOREIGN KEY ("nutritionistId") 
      REFERENCES "nutritionists"("id") 
      ON DELETE NO ACTION 
      ON UPDATE NO ACTION
    `);

    // Adiciona coluna nutritionistId em measurements
    await queryRunner.query(`
      ALTER TABLE "measurements" 
      ADD COLUMN "nutritionistId" uuid,
      ADD CONSTRAINT "FK_measurements_nutritionist" 
      FOREIGN KEY ("nutritionistId") 
      REFERENCES "nutritionists"("id") 
      ON DELETE NO ACTION 
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove relacionamentos em measurements
    await queryRunner.query(`
      ALTER TABLE "measurements" 
      DROP CONSTRAINT "FK_measurements_nutritionist",
      DROP COLUMN "nutritionistId"
    `);

    // Remove relacionamentos em meal_plans
    await queryRunner.query(`
      ALTER TABLE "meal_plans" 
      DROP CONSTRAINT "FK_meal_plans_nutritionist",
      DROP COLUMN "nutritionistId"
    `);

    // Remove relacionamentos em patients
    await queryRunner.query(`
      ALTER TABLE "patients" 
      DROP CONSTRAINT "FK_patients_nutritionist",
      DROP COLUMN "nutritionistId"
    `);
  }
}
