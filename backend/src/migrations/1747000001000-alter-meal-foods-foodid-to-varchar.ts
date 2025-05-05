import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterMealFoodsFoodIdToVarchar1747000001000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove todas as FKs conhecidas de foodId
    await queryRunner.query(
      `ALTER TABLE meal_foods DROP CONSTRAINT IF EXISTS "FK_1ceb026c299d411e943718fa487";`,
    );
    await queryRunner.query(
      `ALTER TABLE meal_foods DROP CONSTRAINT IF EXISTS "FK_meal_foods_foodId_food_id";`,
    );
    // Altera foodId para varchar
    await queryRunner.query(
      `ALTER TABLE meal_foods ALTER COLUMN "foodId" TYPE varchar(100);`,
    );
    // Adiciona coluna source
    await queryRunner.query(
      `ALTER TABLE meal_foods ADD COLUMN IF NOT EXISTS "source" varchar(50);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Não reverte FK automaticamente
    await queryRunner.query(
      `ALTER TABLE meal_foods DROP COLUMN IF EXISTS "source";`,
    );
    await queryRunner.query(
      `ALTER TABLE meal_foods ALTER COLUMN "foodId" TYPE uuid USING "foodId"::uuid;`,
    );
  }
}
