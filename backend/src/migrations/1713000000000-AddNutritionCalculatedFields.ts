import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNutritionCalculatedFields1713000000000
  implements MigrationInterface
{
  name = 'AddNutritionCalculatedFields1713000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('Starting migration: AddNutritionCalculatedFields');

    // Skip adding columns as they already exist
    console.log('Columns already exist, creating trigger...');

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_meal_nutrition_totals()
      RETURNS TRIGGER AS $$
      BEGIN
        UPDATE meals
        SET
          totalCalories = (
            SELECT COALESCE(SUM(f.calories * mf.amount), 0)
            FROM meal_foods mf
            JOIN food f ON mf.food_id = f.id
            WHERE mf.meal_id = NEW.meal_id
          ),
          totalProtein = (
            SELECT COALESCE(SUM(f.protein * mf.amount), 0)
            FROM meal_foods mf
            JOIN food f ON mf.food_id = f.id
            WHERE mf.meal_id = NEW.meal_id
          ),
          totalCarbs = (
            SELECT COALESCE(SUM(f.carbohydrates * mf.amount), 0)
            FROM meal_foods mf
            JOIN food f ON mf.food_id = f.id
            WHERE mf.meal_id = NEW.meal_id
          ),
          totalFat = (
            SELECT COALESCE(SUM(f.fat * mf.amount), 0)
            FROM meal_foods mf
            JOIN food f ON mf.food_id = f.id
            WHERE mf.meal_id = NEW.meal_id
          )
        WHERE id = NEW.meal_id;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER trg_meal_food_changes
      AFTER INSERT OR UPDATE OR DELETE ON meal_foods
      FOR EACH ROW
      EXECUTE FUNCTION update_meal_nutrition_totals();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS trg_meal_food_changes ON meal_foods;
      DROP FUNCTION IF EXISTS update_meal_nutrition_totals;
      
      ALTER TABLE "meals"
      DROP COLUMN "totalFat",
      DROP COLUMN "totalCarbs",
      DROP COLUMN "totalProtein",
      DROP COLUMN "totalCalories"
    `);
  }
}
