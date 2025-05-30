import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsActiveForCalculationToMeals1710000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE meals
            ADD COLUMN is_active_for_calculation BOOLEAN NOT NULL DEFAULT true;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE meals
            DROP COLUMN is_active_for_calculation;
        `);
  }
}
