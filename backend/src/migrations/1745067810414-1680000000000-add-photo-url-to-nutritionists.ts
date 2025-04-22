import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhotoUrlToNutritionists1680000000000
  implements MigrationInterface
{
  name = 'AddPhotoUrlToNutritionists1680000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    //await queryRunner.query(
    //`ALTER TABLE "nutritionists" ADD "photo_url" character varying`
    //);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "nutritionists" DROP COLUMN "photo_url"`,
    );
  }
}
