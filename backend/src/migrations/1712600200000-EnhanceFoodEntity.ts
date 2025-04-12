import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnhanceFoodEntity1712600200000 implements MigrationInterface {
  name = 'EnhanceFoodEntity1712600200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns to foods table
    await queryRunner.query(`
      ALTER TABLE "foods"
      ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1,
      ADD COLUMN "is_verified" BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN "source" VARCHAR(100),
      ADD COLUMN "source_id" VARCHAR(100),
      ADD COLUMN "usage_count_meal_plans" INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN "usage_count_favorites" INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN "usage_count_searches" INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN "category_hierarchy" JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN "search_vector" tsvector
    `);

    // Create GIN index for categories array
    await queryRunner.query(`
      CREATE INDEX "IDX_foods_categories" ON "foods" USING GIN ("categories")
    `);

    // Create GIN index for category_hierarchy JSONB
    await queryRunner.query(`
      CREATE INDEX "IDX_foods_category_hierarchy" ON "foods" USING GIN ("category_hierarchy")
    `);

    // Create index for is_verified
    await queryRunner.query(`
      CREATE INDEX "IDX_foods_is_verified" ON "foods" ("is_verified")
    `);

    // Create index for source
    await queryRunner.query(`
      CREATE INDEX "IDX_foods_source" ON "foods" ("source")
    `);

    // Create index for source_id
    await queryRunner.query(`
      CREATE INDEX "IDX_foods_source_id" ON "foods" ("source_id")
    `);

    // Create index for usage_count_meal_plans
    await queryRunner.query(`
      CREATE INDEX "IDX_foods_usage_count_meal_plans" ON "foods" ("usage_count_meal_plans" DESC)
    `);

    // Create index for usage_count_favorites
    await queryRunner.query(`
      CREATE INDEX "IDX_foods_usage_count_favorites" ON "foods" ("usage_count_favorites" DESC)
    `);

    // Create index for usage_count_searches
    await queryRunner.query(`
      CREATE INDEX "IDX_foods_usage_count_searches" ON "foods" ("usage_count_searches" DESC)
    `);

    // Enable pg_trgm extension for text search if not already enabled
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS pg_trgm
    `);

    // Create GIN index for name using pg_trgm for fuzzy search
    await queryRunner.query(`
      CREATE INDEX "IDX_foods_name_trgm" ON "foods" USING GIN (name gin_trgm_ops)
    `);

    // Create function to update search_vector
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION foods_search_vector_update() RETURNS TRIGGER AS $$
      BEGIN
        NEW.search_vector = 
          setweight(to_tsvector('portuguese', COALESCE(NEW.name, '')), 'A') ||
          setweight(to_tsvector('portuguese', array_to_string(COALESCE(NEW.categories, '{}'::text[]), ' ')), 'B');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create trigger to automatically update search_vector
    await queryRunner.query(`
      CREATE TRIGGER foods_search_vector_update_trigger
      BEFORE INSERT OR UPDATE ON foods
      FOR EACH ROW
      EXECUTE FUNCTION foods_search_vector_update();
    `);

    // Create GIN index for search_vector
    await queryRunner.query(`
      CREATE INDEX "IDX_foods_search_vector" ON "foods" USING GIN (search_vector)
    `);

    // Update existing records to populate search_vector
    await queryRunner.query(`
      UPDATE foods
      SET search_vector = 
        setweight(to_tsvector('portuguese', COALESCE(name, '')), 'A') ||
        setweight(to_tsvector('portuguese', array_to_string(COALESCE(categories, '{}'::text[]), ' ')), 'B')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop trigger
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS foods_search_vector_update_trigger ON foods
    `);

    // Drop function
    await queryRunner.query(`
      DROP FUNCTION IF EXISTS foods_search_vector_update()
    `);

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_foods_search_vector"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_foods_name_trgm"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_foods_usage_count_searches"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_foods_usage_count_favorites"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_foods_usage_count_meal_plans"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_foods_source_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_foods_source"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_foods_is_verified"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_foods_category_hierarchy"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_foods_categories"`);

    // Drop columns
    await queryRunner.query(`
      ALTER TABLE "foods"
      DROP COLUMN "search_vector",
      DROP COLUMN "category_hierarchy",
      DROP COLUMN "usage_count_searches",
      DROP COLUMN "usage_count_favorites",
      DROP COLUMN "usage_count_meal_plans",
      DROP COLUMN "source_id",
      DROP COLUMN "source",
      DROP COLUMN "is_verified",
      DROP COLUMN "version"
    `);
  }
}
