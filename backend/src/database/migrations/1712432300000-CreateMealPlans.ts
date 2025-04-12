import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMealPlans1712432300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create meal plans table
    await queryRunner.query(`
      CREATE TABLE meal_plans (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
        nutritionist_id UUID REFERENCES nutritionists(id),
        name VARCHAR NOT NULL,
        description TEXT,
        start_date DATE,
        end_date DATE,
        status VARCHAR DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );
    `);

    // Create meals table
    await queryRunner.query(`
      CREATE TABLE meals (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
        name VARCHAR NOT NULL,
        description TEXT,
        time TIME,
        order_index INTEGER,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );
    `);

    // Create foods table
    await queryRunner.query(`
      CREATE TABLE foods (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        meal_id UUID REFERENCES meals(id) ON DELETE CASCADE,
        name VARCHAR NOT NULL,
        portion VARCHAR NOT NULL,
        calories DECIMAL(10,2),
        protein DECIMAL(10,2),
        carbs DECIMAL(10,2),
        fat DECIMAL(10,2),
        category VARCHAR,
        tags JSONB,
        search_vector TSVECTOR,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX idx_meal_plans_patient ON meal_plans(patient_id);
      CREATE INDEX idx_meal_plans_nutritionist ON meal_plans(nutritionist_id);
      CREATE INDEX idx_meal_plans_status ON meal_plans(status);
      CREATE INDEX idx_meals_plan ON meals(plan_id);
      CREATE INDEX idx_foods_meal ON foods(meal_id);
      CREATE INDEX idx_foods_category ON foods(category);
      CREATE INDEX idx_foods_search ON foods USING gin(search_vector);
      CREATE INDEX idx_foods_name_trgm ON foods USING gin(name gin_trgm_ops);
    `);

    // Create trigger function to update search vector
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION foods_update_trigger() RETURNS trigger AS $$
      BEGIN
        NEW.search_vector :=
          setweight(to_tsvector('portuguese', COALESCE(NEW.name, '')), 'A') ||
          setweight(to_tsvector('portuguese', COALESCE(NEW.category, '')), 'B') ||
          setweight(to_tsvector('portuguese', COALESCE(
            (SELECT string_agg(value::text, ' ')
             FROM jsonb_array_elements_text(NEW.tags)), '')), 'C');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create trigger
    await queryRunner.query(`
      CREATE TRIGGER foods_search_update
        BEFORE INSERT OR UPDATE ON foods
        FOR EACH ROW
        EXECUTE FUNCTION foods_update_trigger();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop trigger
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS foods_search_update ON foods;`,
    );

    // Drop trigger function
    await queryRunner.query(`DROP FUNCTION IF EXISTS foods_update_trigger;`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS idx_foods_name_trgm;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_foods_search;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_foods_category;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_foods_meal;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_meals_plan;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_meal_plans_status;`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_meal_plans_nutritionist;`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS idx_meal_plans_patient;`);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS foods;`);
    await queryRunner.query(`DROP TABLE IF EXISTS meals;`);
    await queryRunner.query(`DROP TABLE IF EXISTS meal_plans;`);
  }
}
