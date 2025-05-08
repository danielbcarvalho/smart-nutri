import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameMealPlanNotesToDescription1747000003000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('meal_plans', 'notes', 'description');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('meal_plans', 'description', 'notes');
  }
}
