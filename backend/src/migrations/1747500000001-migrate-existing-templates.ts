import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateExistingTemplates1747500000001
  implements MigrationInterface
{
  name = 'MigrateExistingTemplates1747500000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Starting migration of existing meal plan templates...');

    // Check if old template tables exist
    const templateTableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'meal_plan_templates'
      );
    `);

    if (!templateTableExists[0].exists) {
      console.log('ℹ️ No existing meal_plan_templates table found, skipping migration');
      return;
    }

    // Get all existing meal plan templates
    const existingTemplates = await queryRunner.query(`
      SELECT 
        mpt.id,
        mpt.name,
        mpt.description,
        mpt.nutritionist_id,
        mpt.is_public,
        mpt.tags,
        mpt.created_at,
        mpt.updated_at
      FROM meal_plan_templates mpt
    `);

    console.log(`📋 Found ${existingTemplates.length} existing templates to migrate`);

    for (const template of existingTemplates) {
      try {
        // Create new meal plan record as template
        const newMealPlanId = await queryRunner.query(`
          INSERT INTO meal_plans (
            name,
            description,
            nutritionist_id,
            is_template,
            template_name,
            template_description,
            is_public,
            tags,
            "dailyCalories",
            "dailyProtein",
            "dailyCarbs",
            "dailyFat",
            usage_count,
            created_at,
            updated_at
          ) VALUES (
            $1, $2, $3, true, $1, $2, $4, $5, 0, 0, 0, 0, 0, $6, $7
          ) RETURNING id
        `, [
          template.name,
          template.description,
          template.nutritionist_id,
          template.is_public,
          template.tags ? JSON.stringify(template.tags) : null,
          template.created_at,
          template.updated_at
        ]);

        const mealPlanId = newMealPlanId[0].id;

        // Get meals for this template
        const templateMeals = await queryRunner.query(`
          SELECT 
            mt.id,
            mt.name,
            mt.description,
            mt.time,
            mt.order_index
          FROM meal_templates mt
          WHERE mt.plan_template_id = $1
          ORDER BY mt.order_index ASC
        `, [template.id]);

        for (const templateMeal of templateMeals) {
          // Create new meal record
          const newMealId = await queryRunner.query(`
            INSERT INTO meals (
              name,
              time,
              description,
              meal_plan_id,
              is_active_for_calculation,
              total_calories,
              total_protein,
              total_carbs,
              total_fat,
              created_at,
              updated_at
            ) VALUES (
              $1, $2, $3, $4, true, 0, 0, 0, 0, NOW(), NOW()
            ) RETURNING id
          `, [
            templateMeal.name,
            templateMeal.time || '12:00',
            templateMeal.description,
            mealPlanId
          ]);

          const mealId = newMealId[0].id;

          // Get food templates for this meal
          const foodTemplates = await queryRunner.query(`
            SELECT 
              ft.name,
              ft.portion,
              ft.calories,
              ft.protein,
              ft.carbs,
              ft.fat,
              ft.category
            FROM food_templates ft
            WHERE ft.meal_template_id = $1
          `, [templateMeal.id]);

          for (const foodTemplate of foodTemplates) {
            // For migration, we'll create simplified meal_food entries
            // These will use 'template' as source and the food name as foodId
            await queryRunner.query(`
              INSERT INTO meal_foods (
                meal_id,
                food_id,
                source,
                amount,
                unit,
                created_at,
                updated_at
              ) VALUES (
                $1, $2, 'template', 1, $3, NOW(), NOW()
              )
            `, [
              mealId,
              `template_${foodTemplate.name.toLowerCase().replace(/\s+/g, '_')}`,
              foodTemplate.portion || 'porção'
            ]);
          }
        }

        console.log(`✅ Migrated template: ${template.name}`);
      } catch (error) {
        console.error(`❌ Error migrating template ${template.name}:`, error);
      }
    }

    console.log('✅ Template migration completed');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('⚠️ Reverting template migration...');

    // Remove all migrated templates (meal plans where is_template = true)
    await queryRunner.query(`
      DELETE FROM meal_plans WHERE is_template = true
    `);

    console.log('⚠️ Template migration reverted');
  }
}