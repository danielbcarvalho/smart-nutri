import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddExternalIdToFoods1747000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adiciona apenas external_id se não existir
    const table = await queryRunner.getTable('foods');
    if (!table!.findColumnByName('external_id')) {
      await queryRunner.addColumn(
        'foods',
        new TableColumn({
          name: 'external_id',
          type: 'varchar',
          isNullable: true,
        }),
      );
    }
    // Cria índice único se não existir
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_foods_source_external_id"
      ON "foods" ("source", "external_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_foods_source_external_id"`,
    );
    await queryRunner.dropColumn('foods', 'external_id');
  }
}
