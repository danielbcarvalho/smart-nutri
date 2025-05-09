import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1744584228668 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar se os tipos enum já existem
    const statusEnumExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type 
        WHERE typname = 'consultations_status_enum'
      );
    `);

    const typeEnumExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type 
        WHERE typname = 'consultations_type_enum'
      );
    `);

    // Criar tipos enum apenas se não existirem
    if (!statusEnumExists[0].exists) {
      await queryRunner.query(`
        CREATE TYPE "public"."consultations_status_enum" AS ENUM('scheduled', 'completed', 'cancelled', 'no_show');
      `);
    }

    if (!typeEnumExists[0].exists) {
      await queryRunner.query(`
        CREATE TYPE "public"."consultations_type_enum" AS ENUM('initial', 'follow_up', 'emergency');
      `);
    }

    // Função auxiliar para verificar se uma tabela existe
    const tableExists = async (tableName: string) => {
      const result = await queryRunner.query(
        `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `,
        [tableName],
      );
      return result[0].exists;
    };

    // Função auxiliar para verificar se uma coluna existe
    const columnExists = async (tableName: string, columnName: string) => {
      const result = await queryRunner.query(
        `
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = $1 
          AND column_name = $2
        );
      `,
        [tableName, columnName],
      );
      return result[0].exists;
    };

    // Criar tabelas apenas se não existirem
    if (!(await tableExists('meal_foods'))) {
      await queryRunner.query(`
        CREATE TABLE "meal_foods" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "amount" numeric(10,2) NOT NULL,
          "unit" character varying NOT NULL,
          "foodId" uuid NOT NULL,
          "source" character varying,
          "mealId" uuid NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_meal_foods" PRIMARY KEY ("id")
        );
      `);
    }

    if (!(await tableExists('meals'))) {
      await queryRunner.query(`
        CREATE TABLE "meals" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "name" character varying NOT NULL,
          "time" character varying NOT NULL,
          "description" text,
          "totalCalories" numeric(10,2) NOT NULL DEFAULT '0',
          "totalProtein" numeric(10,2) NOT NULL DEFAULT '0',
          "totalCarbs" numeric(10,2) NOT NULL DEFAULT '0',
          "totalFat" numeric(10,2) NOT NULL DEFAULT '0',
          "mealPlanId" uuid NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_meals" PRIMARY KEY ("id")
        );
      `);
    }

    if (!(await tableExists('meal_plans'))) {
      await queryRunner.query(`
        CREATE TABLE "meal_plans" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "name" character varying NOT NULL,
          "description" text,
          "patient_id" uuid NOT NULL,
          "nutritionist_id" uuid NOT NULL,
          "startDate" TIMESTAMP NOT NULL,
          "endDate" TIMESTAMP NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          "dailyCalories" numeric(10,2) NOT NULL DEFAULT '0',
          "dailyProtein" numeric(10,2) NOT NULL DEFAULT '0',
          "dailyCarbs" numeric(10,2) NOT NULL DEFAULT '0',
          "dailyFat" numeric(10,2) NOT NULL DEFAULT '0',
          CONSTRAINT "PK_6270d3206d074e2a2520f8d0a0b" PRIMARY KEY ("id")
        );
      `);
    }

    if (!(await tableExists('meal_plan_templates'))) {
      await queryRunner.query(`
        CREATE TABLE "meal_plan_templates" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "name" character varying NOT NULL,
          "description" text,
          "nutritionist_id" uuid NOT NULL,
          "is_public" boolean NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_meal_plan_templates" PRIMARY KEY ("id")
        );
      `);
    }

    if (!(await tableExists('meal_templates'))) {
      await queryRunner.query(`
        CREATE TABLE "meal_templates" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "name" character varying NOT NULL,
          "time" character varying NOT NULL,
          "description" text,
          "meal_plan_template_id" uuid NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_meal_templates" PRIMARY KEY ("id")
        );
      `);
    }

    if (!(await tableExists('food_templates'))) {
      await queryRunner.query(`
        CREATE TABLE "food_templates" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "name" character varying NOT NULL,
          "calories" numeric(10,2) NOT NULL,
          "protein" numeric(10,2) NOT NULL,
          "carbs" numeric(10,2) NOT NULL,
          "fat" numeric(10,2) NOT NULL,
          "category" character varying,
          "meal_template_id" uuid NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_food_templates" PRIMARY KEY ("id")
        );
      `);
    }

    if (!(await tableExists('nutritionists'))) {
      await queryRunner.query(`
        CREATE TABLE "nutritionists" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "name" character varying NOT NULL,
          "email" character varying NOT NULL,
          "password" character varying NOT NULL,
          "crn" character varying NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "UQ_nutritionists_email" UNIQUE ("email"),
          CONSTRAINT "UQ_nutritionists_crn" UNIQUE ("crn"),
          CONSTRAINT "PK_nutritionists" PRIMARY KEY ("id")
        );
      `);
    }

    if (!(await tableExists('patients'))) {
      await queryRunner.query(`
        CREATE TABLE "patients" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "name" character varying NOT NULL,
          "email" character varying NOT NULL,
          "password" character varying NOT NULL,
          "birthDate" TIMESTAMP NOT NULL,
          "gender" character varying NOT NULL,
          "height" numeric(10,2) NOT NULL,
          "nutritionist_id" uuid NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "UQ_patients_email" UNIQUE ("email"),
          CONSTRAINT "PK_patients" PRIMARY KEY ("id")
        );
      `);
    }

    if (!(await tableExists('consultations'))) {
      await queryRunner.query(`
        CREATE TABLE "consultations" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "patient_id" uuid NOT NULL,
          "nutritionist_id" uuid NOT NULL,
          "date" TIMESTAMP NOT NULL,
          "status" "public"."consultations_status_enum" NOT NULL DEFAULT 'scheduled',
          "type" "public"."consultations_type_enum" NOT NULL,
          "notes" text,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_consultations" PRIMARY KEY ("id")
        );
      `);
    }

    // Função auxiliar para verificar se uma constraint existe
    const constraintExists = async (
      tableName: string,
      constraintName: string,
    ) => {
      const result = await queryRunner.query(
        `
        SELECT EXISTS (
          SELECT FROM information_schema.table_constraints 
          WHERE table_schema = 'public' 
          AND table_name = $1 
          AND constraint_name = $2
        );
      `,
        [tableName, constraintName],
      );
      return result[0].exists;
    };

    // Adicionar chaves estrangeiras apenas se não existirem e se as colunas existirem
    if (
      !(await constraintExists('meal_foods', 'FK_meal_foods_meal')) &&
      (await columnExists('meal_foods', 'mealId'))
    ) {
      await queryRunner.query(`
        ALTER TABLE "meal_foods" ADD CONSTRAINT "FK_meal_foods_meal" FOREIGN KEY ("mealId") REFERENCES "meals"("id") ON DELETE CASCADE;
      `);
    }

    if (
      !(await constraintExists('meals', 'FK_meals_meal_plan')) &&
      (await columnExists('meals', 'mealPlanId'))
    ) {
      await queryRunner.query(`
        ALTER TABLE "meals" ADD CONSTRAINT "FK_meals_meal_plan" FOREIGN KEY ("mealPlanId") REFERENCES "meal_plans"("id") ON DELETE CASCADE;
      `);
    }

    if (
      !(await constraintExists('meal_plans', 'FK_meal_plans_patient')) &&
      (await columnExists('meal_plans', 'patient_id'))
    ) {
      await queryRunner.query(`
        ALTER TABLE "meal_plans" ADD CONSTRAINT "FK_meal_plans_patient" FOREIGN KEY ("patient_id") REFERENCES "patients"("id");
      `);
    }

    if (
      !(await constraintExists('meal_plans', 'FK_meal_plans_nutritionist')) &&
      (await columnExists('meal_plans', 'nutritionist_id'))
    ) {
      await queryRunner.query(`
        ALTER TABLE "meal_plans" ADD CONSTRAINT "FK_meal_plans_nutritionist" FOREIGN KEY ("nutritionist_id") REFERENCES "nutritionists"("id");
      `);
    }

    if (
      !(await constraintExists(
        'meal_templates',
        'FK_meal_templates_meal_plan_template',
      )) &&
      (await columnExists('meal_templates', 'meal_plan_template_id'))
    ) {
      await queryRunner.query(`
        ALTER TABLE "meal_templates" ADD CONSTRAINT "FK_meal_templates_meal_plan_template" FOREIGN KEY ("meal_plan_template_id") REFERENCES "meal_plan_templates"("id") ON DELETE CASCADE;
      `);
    }

    if (
      !(await constraintExists(
        'food_templates',
        'FK_food_templates_meal_template',
      )) &&
      (await columnExists('food_templates', 'meal_template_id'))
    ) {
      await queryRunner.query(`
        ALTER TABLE "food_templates" ADD CONSTRAINT "FK_food_templates_meal_template" FOREIGN KEY ("meal_template_id") REFERENCES "meal_templates"("id") ON DELETE CASCADE;
      `);
    }

    if (
      !(await constraintExists('patients', 'FK_patients_nutritionist')) &&
      (await columnExists('patients', 'nutritionist_id'))
    ) {
      await queryRunner.query(`
        ALTER TABLE "patients" ADD CONSTRAINT "FK_patients_nutritionist" FOREIGN KEY ("nutritionist_id") REFERENCES "nutritionists"("id");
      `);
    }

    if (
      !(await constraintExists('consultations', 'FK_consultations_patient')) &&
      (await columnExists('consultations', 'patient_id'))
    ) {
      await queryRunner.query(`
        ALTER TABLE "consultations" ADD CONSTRAINT "FK_consultations_patient" FOREIGN KEY ("patient_id") REFERENCES "patients"("id");
      `);
    }

    if (
      !(await constraintExists(
        'consultations',
        'FK_consultations_nutritionist',
      )) &&
      (await columnExists('consultations', 'nutritionist_id'))
    ) {
      await queryRunner.query(`
        ALTER TABLE "consultations" ADD CONSTRAINT "FK_consultations_nutritionist" FOREIGN KEY ("nutritionist_id") REFERENCES "nutritionists"("id");
      `);
    }

    // Função auxiliar para verificar se um índice existe
    const indexExists = async (indexName: string) => {
      const result = await queryRunner.query(
        `
        SELECT EXISTS (
          SELECT FROM pg_indexes 
          WHERE schemaname = 'public' 
          AND indexname = $1
        );
      `,
        [indexName],
      );
      return result[0].exists;
    };

    // Criar índices apenas se não existirem e se as colunas existirem
    if (
      !(await indexExists('IDX_meal_foods_meal')) &&
      (await columnExists('meal_foods', 'mealId'))
    ) {
      await queryRunner.query(`
        CREATE INDEX "IDX_meal_foods_meal" ON "meal_foods"("mealId");
      `);
    }

    if (
      !(await indexExists('IDX_meals_meal_plan')) &&
      (await columnExists('meals', 'mealPlanId'))
    ) {
      await queryRunner.query(`
        CREATE INDEX "IDX_meals_meal_plan" ON "meals"("mealPlanId");
      `);
    }

    if (
      !(await indexExists('IDX_meal_plans_patient')) &&
      (await columnExists('meal_plans', 'patient_id'))
    ) {
      await queryRunner.query(`
        CREATE INDEX "IDX_meal_plans_patient" ON "meal_plans"("patient_id");
      `);
    }

    if (
      !(await indexExists('IDX_meal_plans_nutritionist')) &&
      (await columnExists('meal_plans', 'nutritionist_id'))
    ) {
      await queryRunner.query(`
        CREATE INDEX "IDX_meal_plans_nutritionist" ON "meal_plans"("nutritionist_id");
      `);
    }

    if (
      !(await indexExists('IDX_meal_templates_meal_plan_template')) &&
      (await columnExists('meal_templates', 'meal_plan_template_id'))
    ) {
      await queryRunner.query(`
        CREATE INDEX "IDX_meal_templates_meal_plan_template" ON "meal_templates"("meal_plan_template_id");
      `);
    }

    if (
      !(await indexExists('IDX_food_templates_meal_template')) &&
      (await columnExists('food_templates', 'meal_template_id'))
    ) {
      await queryRunner.query(`
        CREATE INDEX "IDX_food_templates_meal_template" ON "food_templates"("meal_template_id");
      `);
    }

    if (
      !(await indexExists('IDX_patients_nutritionist')) &&
      (await columnExists('patients', 'nutritionist_id'))
    ) {
      await queryRunner.query(`
        CREATE INDEX "IDX_patients_nutritionist" ON "patients"("nutritionist_id");
      `);
    }

    if (
      !(await indexExists('IDX_consultations_patient')) &&
      (await columnExists('consultations', 'patient_id'))
    ) {
      await queryRunner.query(`
        CREATE INDEX "IDX_consultations_patient" ON "consultations"("patient_id");
      `);
    }

    if (
      !(await indexExists('IDX_consultations_nutritionist')) &&
      (await columnExists('consultations', 'nutritionist_id'))
    ) {
      await queryRunner.query(`
        CREATE INDEX "IDX_consultations_nutritionist" ON "consultations"("nutritionist_id");
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover índices
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_consultations_nutritionist";
      DROP INDEX IF EXISTS "IDX_consultations_patient";
      DROP INDEX IF EXISTS "IDX_patients_nutritionist";
      DROP INDEX IF EXISTS "IDX_food_templates_meal_template";
      DROP INDEX IF EXISTS "IDX_meal_templates_meal_plan_template";
      DROP INDEX IF EXISTS "IDX_meal_plans_nutritionist";
      DROP INDEX IF EXISTS "IDX_meal_plans_patient";
      DROP INDEX IF EXISTS "IDX_meals_meal_plan";
      DROP INDEX IF EXISTS "IDX_meal_foods_meal";
    `);

    // Remover chaves estrangeiras
    await queryRunner.query(`
      ALTER TABLE IF EXISTS "consultations" DROP CONSTRAINT IF EXISTS "FK_consultations_nutritionist";
      ALTER TABLE IF EXISTS "consultations" DROP CONSTRAINT IF EXISTS "FK_consultations_patient";
      ALTER TABLE IF EXISTS "patients" DROP CONSTRAINT IF EXISTS "FK_patients_nutritionist";
      ALTER TABLE IF EXISTS "food_templates" DROP CONSTRAINT IF EXISTS "FK_food_templates_meal_template";
      ALTER TABLE IF EXISTS "meal_templates" DROP CONSTRAINT IF EXISTS "FK_meal_templates_meal_plan_template";
      ALTER TABLE IF EXISTS "meal_plans" DROP CONSTRAINT IF EXISTS "FK_meal_plans_nutritionist";
      ALTER TABLE IF EXISTS "meal_plans" DROP CONSTRAINT IF EXISTS "FK_meal_plans_patient";
      ALTER TABLE IF EXISTS "meals" DROP CONSTRAINT IF EXISTS "FK_meals_meal_plan";
      ALTER TABLE IF EXISTS "meal_foods" DROP CONSTRAINT IF EXISTS "FK_meal_foods_meal";
    `);

    // Remover tabelas
    await queryRunner.query(`
      DROP TABLE IF EXISTS "consultations";
      DROP TABLE IF EXISTS "patients";
      DROP TABLE IF EXISTS "nutritionists";
      DROP TABLE IF EXISTS "food_templates";
      DROP TABLE IF EXISTS "meal_templates";
      DROP TABLE IF EXISTS "meal_plan_templates";
      DROP TABLE IF EXISTS "meal_plans";
      DROP TABLE IF EXISTS "meals";
      DROP TABLE IF EXISTS "meal_foods";
    `);

    // Remover tipos enum
    await queryRunner.query(`
      DROP TYPE IF EXISTS "public"."consultations_status_enum";
      DROP TYPE IF EXISTS "public"."consultations_type_enum";
    `);
  }
}
