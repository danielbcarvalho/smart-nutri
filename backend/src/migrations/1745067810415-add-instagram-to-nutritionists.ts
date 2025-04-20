import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInstagramToNutritionists1745067810415
  implements MigrationInterface
{
  name = 'AddInstagramToNutritionists1745067810415';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "nutritionists" ADD "instagram" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "nutritionists" DROP COLUMN "instagram"`,
    );
  }
}
