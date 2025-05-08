import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameMealNotesToDescription1747000002000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('meals', 'notes', 'description');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('meals', 'description', 'notes');
  }
}
