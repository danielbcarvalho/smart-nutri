import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddTemplateFieldsToMealPlans1747500000000
  implements MigrationInterface
{
  name = 'AddTemplateFieldsToMealPlans1747500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, make patient_id nullable for templates
    await queryRunner.query(`
      ALTER TABLE "meal_plans" ALTER COLUMN "patient_id" DROP NOT NULL
    `);

    // Make start and end dates nullable for templates  
    await queryRunner.query(`
      ALTER TABLE "meal_plans" ALTER COLUMN "startDate" DROP NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "meal_plans" ALTER COLUMN "endDate" DROP NOT NULL
    `);

    // Add template-specific columns
    const columnsToAdd = [
      {
        name: 'is_template',
        type: 'boolean',
        default: false,
      },
      {
        name: 'template_name',
        type: 'varchar',
        isNullable: true,
      },
      {
        name: 'template_description',
        type: 'text',
        isNullable: true,
      },
      {
        name: 'is_public',
        type: 'boolean',
        default: false,
      },
      {
        name: 'tags',
        type: 'jsonb',
        isNullable: true,
      },
      {
        name: 'template_category',
        type: 'varchar',
        isNullable: true,
      },
      {
        name: 'usage_count',
        type: 'integer',
        default: 0,
      },
      {
        name: 'target_calories',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: true,
      },
    ];

    // Add each column, checking if it exists first
    for (const columnDef of columnsToAdd) {
      const columnExists = await queryRunner.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'meal_plans' 
          AND column_name = '${columnDef.name}'
        );
      `);

      if (!columnExists[0].exists) {
        await queryRunner.addColumn(
          'meal_plans',
          new TableColumn(columnDef)
        );
      }
    }

    // Create index for efficient template queries
    const indexExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM pg_indexes
        WHERE tablename = 'meal_plans'
        AND indexname = 'IDX_meal_plans_templates'
      );
    `);

    if (!indexExists[0].exists) {
      await queryRunner.createIndex(
        'meal_plans',
        new TableIndex({
          name: 'IDX_meal_plans_templates',
          columnNames: ['is_template', 'nutritionist_id', 'is_public'],
        })
      );
    }

    // Create index for template search
    const searchIndexExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM pg_indexes
        WHERE tablename = 'meal_plans'
        AND indexname = 'IDX_meal_plans_template_search'
      );
    `);

    if (!searchIndexExists[0].exists) {
      await queryRunner.createIndex(
        'meal_plans',
        new TableIndex({
          name: 'IDX_meal_plans_template_search',
          columnNames: ['is_template', 'template_category'],
        })
      );
    }

    console.log('✅ Template fields added to meal_plans table');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove indexes
    const indexExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM pg_indexes
        WHERE tablename = 'meal_plans'
        AND indexname = 'IDX_meal_plans_templates'
      );
    `);

    if (indexExists[0].exists) {
      await queryRunner.dropIndex('meal_plans', 'IDX_meal_plans_templates');
    }

    const searchIndexExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM pg_indexes
        WHERE tablename = 'meal_plans'
        AND indexname = 'IDX_meal_plans_template_search'
      );
    `);

    if (searchIndexExists[0].exists) {
      await queryRunner.dropIndex('meal_plans', 'IDX_meal_plans_template_search');
    }

    // Remove template columns
    const columnsToRemove = [
      'target_calories',
      'usage_count',
      'template_category',
      'tags',
      'is_public',
      'template_description',
      'template_name',
      'is_template',
    ];

    for (const columnName of columnsToRemove) {
      const columnExists = await queryRunner.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'meal_plans' 
          AND column_name = '${columnName}'
        );
      `);

      if (columnExists[0].exists) {
        await queryRunner.dropColumn('meal_plans', columnName);
      }
    }

    // Restore NOT NULL constraints for patient_id, startDate, endDate
    await queryRunner.query(`
      ALTER TABLE "meal_plans" ALTER COLUMN "patient_id" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "meal_plans" ALTER COLUMN "startDate" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "meal_plans" ALTER COLUMN "endDate" SET NOT NULL
    `);

    console.log('⚠️ Template fields removed from meal_plans table');
  }
}