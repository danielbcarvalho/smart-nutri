import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInstagramToNutritionists1745067810415
  implements MigrationInterface
{
  name = 'AddInstagramToNutritionists1745067810415';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar se a coluna já existe
    const columnExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'nutritionists' 
        AND column_name = 'instagram'
      );
    `);

    // Só adiciona a coluna se ela não existir
    if (!columnExists[0].exists) {
      await queryRunner.query(
        `ALTER TABLE "nutritionists" ADD "instagram" character varying`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Verificar se a coluna existe antes de tentar removê-la
    const columnExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'nutritionists' 
        AND column_name = 'instagram'
      );
    `);

    if (columnExists[0].exists) {
      await queryRunner.query(
        `ALTER TABLE "nutritionists" DROP COLUMN "instagram"`,
      );
    }
  }
}
