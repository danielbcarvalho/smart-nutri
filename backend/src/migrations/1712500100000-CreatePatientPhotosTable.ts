import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreatePatientPhotosTable1712500100000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for photo_type
    await queryRunner.query(`
      CREATE TYPE "photo_type_enum" AS ENUM (
        'front',
        'back',
        'left_side',
        'right_side',
        'other'
      )
    `);

    // Create patient_photos table
    await queryRunner.createTable(
      new Table({
        name: 'patient_photos',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'patient_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'nutritionist_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'photo_url',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'photo_type',
            type: 'photo_type_enum',
            default: "'other'",
            isNullable: false,
          },
          {
            name: 'photo_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Add foreign key constraints
    await queryRunner.createForeignKey(
      'patient_photos',
      new TableForeignKey({
        columnNames: ['patient_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'patients',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'patient_photos',
      new TableForeignKey({
        columnNames: ['nutritionist_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'nutritionists',
        onDelete: 'NO ACTION',
      }),
    );

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "idx_patient_photos_patient_id" ON "patient_photos" ("patient_id");
      CREATE INDEX "idx_patient_photos_nutritionist_id" ON "patient_photos" ("nutritionist_id");
      CREATE INDEX "idx_patient_photos_photo_date" ON "patient_photos" ("photo_date");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    const table = await queryRunner.getTable('patient_photos');
    if (table) {
      const foreignKeys = table.foreignKeys;

      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('patient_photos', foreignKey);
      }
    }

    // Drop indexes
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_patient_photos_patient_id";
      DROP INDEX IF EXISTS "idx_patient_photos_nutritionist_id";
      DROP INDEX IF EXISTS "idx_patient_photos_photo_date";
    `);

    // Drop table
    await queryRunner.dropTable('patient_photos');

    // Drop enum type
    await queryRunner.query(`DROP TYPE IF EXISTS "photo_type_enum"`);
  }
}
