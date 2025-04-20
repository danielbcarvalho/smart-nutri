import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveCrnUniqueFromNutritionists1745069000000
  implements MigrationInterface
{
  name = 'RemoveCrnUniqueFromNutritionists1745069000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "nutritionists" DROP CONSTRAINT IF EXISTS "UQ_8d12e65e7360877dfee291122c3";`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "nutritionists" ADD CONSTRAINT "UQ_8d12e65e7360877dfee291122c3" UNIQUE ("crn");`,
    );
  }
}
