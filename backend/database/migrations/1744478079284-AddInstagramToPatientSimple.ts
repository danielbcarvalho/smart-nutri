import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInstagramToPatientSimple1744478079284
  implements MigrationInterface
{
  name = 'AddInstagramToPatientSimple1744478079284';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "meal_plans" DROP CONSTRAINT "FK_35128838fc51bbb14f26e10fda7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "food_templates" DROP CONSTRAINT "food_templates_meal_template_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_templates" DROP CONSTRAINT "meal_templates_meal_plan_template_id_fkey"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_foods_categories"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_foods_category_hierarchy"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_foods_is_verified"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_foods_source"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_foods_source_id"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_foods_usage_count_meal_plans"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_foods_usage_count_favorites"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_foods_usage_count_searches"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_foods_name_trgm"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_foods_search_vector"`);
    await queryRunner.query(`ALTER TABLE "foods" DROP COLUMN "usageCount"`);
    await queryRunner.query(`ALTER TABLE "foods" DROP COLUMN "search_vector"`);
    await queryRunner.query(`ALTER TABLE "meals" DROP COLUMN "total_calories"`);
    await queryRunner.query(`ALTER TABLE "meals" DROP COLUMN "total_protein"`);
    await queryRunner.query(`ALTER TABLE "meals" DROP COLUMN "total_carbs"`);
    await queryRunner.query(`ALTER TABLE "meals" DROP COLUMN "total_fat"`);
    await queryRunner.query(
      `ALTER TABLE "meal_plans" DROP COLUMN "daily_calories"`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_plans" DROP COLUMN "daily_protein"`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_plans" DROP COLUMN "daily_carbs"`,
    );
    await queryRunner.query(`ALTER TABLE "meal_plans" DROP COLUMN "daily_fat"`);
    await queryRunner.query(
      `ALTER TABLE "meal_templates" DROP COLUMN "meal_plan_template_id"`,
    );
    await queryRunner.query(`ALTER TABLE "meal_templates" DROP COLUMN "order"`);
    await queryRunner.query(
      `ALTER TABLE "meal_plans" ADD "dailyCalories" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_plans" ADD "dailyProtein" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_plans" ADD "dailyCarbs" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_plans" ADD "dailyFat" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "food_templates" ADD "category" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "food_templates" ADD "tags" jsonb`);
    await queryRunner.query(
      `ALTER TABLE "food_templates" ADD "searchVector" tsvector NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "food_templates" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_templates" ADD "plan_template_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_templates" ADD "description" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_templates" ADD "order_index" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_templates" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_plan_templates" ADD "is_public" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_plan_templates" ADD "tags" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_plan_templates" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "patients" ADD "instagram" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "foods" DROP COLUMN "source"`);
    await queryRunner.query(
      `ALTER TABLE "foods" ADD "source" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "foods" DROP COLUMN "source_id"`);
    await queryRunner.query(
      `ALTER TABLE "foods" ADD "source_id" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "foods" ALTER COLUMN "category_hierarchy" DROP DEFAULT`,
    );
    await queryRunner.query(`ALTER TABLE "meal_plans" DROP COLUMN "startDate"`);
    await queryRunner.query(
      `ALTER TABLE "meal_plans" ADD "startDate" TIMESTAMP NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "meal_plans" DROP COLUMN "endDate"`);
    await queryRunner.query(
      `ALTER TABLE "meal_plans" ADD "endDate" TIMESTAMP NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "food_templates" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "food_templates" ADD "name" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "food_templates" DROP COLUMN "portion"`,
    );
    await queryRunner.query(
      `ALTER TABLE "food_templates" ADD "portion" character varying NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "meal_templates" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "meal_templates" ADD "name" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_plan_templates" DROP COLUMN "name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_plan_templates" ADD "name" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_plan_templates" ALTER COLUMN "nutritionist_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "measurements" ALTER COLUMN "skinfolds" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "measurements" ALTER COLUMN "boneDiameters" DROP DEFAULT`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a830cfbd285ac64c3aea9825b6" ON "foods" ("is_verified") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b50bca6326c4148141eb4cc03a" ON "foods" ("source") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b5cdb554611a705420766d51e8" ON "foods" ("source_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4853291383d57f378179516f9a" ON "foods" ("usage_count_meal_plans") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_64b47a0a00291ec5d77973d202" ON "foods" ("usage_count_favorites") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ec0acd01135a20b35218953b44" ON "foods" ("usage_count_searches") `,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_plans" ADD CONSTRAINT "FK_35128838fc51bbb14f26e10fda7" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "food_templates" ADD CONSTRAINT "FK_6e18aebcd126fd8371d37e2fc55" FOREIGN KEY ("meal_template_id") REFERENCES "meal_templates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_templates" ADD CONSTRAINT "FK_8a8f9b97d034d0e0586afeb8984" FOREIGN KEY ("plan_template_id") REFERENCES "meal_plan_templates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_plan_templates" ADD CONSTRAINT "FK_44e70e079086b6dc06967e89036" FOREIGN KEY ("nutritionist_id") REFERENCES "nutritionists"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "meal_plan_templates" DROP CONSTRAINT "FK_44e70e079086b6dc06967e89036"`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_templates" DROP CONSTRAINT "FK_8a8f9b97d034d0e0586afeb8984"`,
    );
    await queryRunner.query(
      `ALTER TABLE "food_templates" DROP CONSTRAINT "FK_6e18aebcd126fd8371d37e2fc55"`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_plans" DROP CONSTRAINT "FK_35128838fc51bbb14f26e10fda7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ec0acd01135a20b35218953b44"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_64b47a0a00291ec5d77973d202"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4853291383d57f378179516f9a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b5cdb554611a705420766d51e8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b50bca6326c4148141eb4cc03a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a830cfbd285ac64c3aea9825b6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "measurements" ALTER COLUMN "boneDiameters" SET DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "measurements" ALTER COLUMN "skinfolds" SET DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_plan_templates" ALTER COLUMN "nutritionist_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_plan_templates" DROP COLUMN "name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_plan_templates" ADD "name" character varying(255) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "meal_templates" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "meal_templates" ADD "name" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "food_templates" DROP COLUMN "portion"`,
    );
    await queryRunner.query(
      `ALTER TABLE "food_templates" ADD "portion" character varying(100)`,
    );
    await queryRunner.query(`ALTER TABLE "food_templates" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "food_templates" ADD "name" character varying(255) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "meal_plans" DROP COLUMN "endDate"`);
    await queryRunner.query(
      `ALTER TABLE "meal_plans" ADD "endDate" date NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "meal_plans" DROP COLUMN "startDate"`);
    await queryRunner.query(
      `ALTER TABLE "meal_plans" ADD "startDate" date NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "foods" ALTER COLUMN "category_hierarchy" SET DEFAULT '[]'`,
    );
    await queryRunner.query(`ALTER TABLE "foods" DROP COLUMN "source_id"`);
    await queryRunner.query(
      `ALTER TABLE "foods" ADD "source_id" character varying(100)`,
    );
    await queryRunner.query(`ALTER TABLE "foods" DROP COLUMN "source"`);
    await queryRunner.query(
      `ALTER TABLE "foods" ADD "source" character varying(100)`,
    );
    await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "instagram"`);
    await queryRunner.query(
      `ALTER TABLE "meal_plan_templates" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_plan_templates" DROP COLUMN "tags"`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_plan_templates" DROP COLUMN "is_public"`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_templates" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_templates" DROP COLUMN "order_index"`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_templates" DROP COLUMN "description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_templates" DROP COLUMN "plan_template_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "food_templates" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "food_templates" DROP COLUMN "searchVector"`,
    );
    await queryRunner.query(`ALTER TABLE "food_templates" DROP COLUMN "tags"`);
    await queryRunner.query(
      `ALTER TABLE "food_templates" DROP COLUMN "category"`,
    );
    await queryRunner.query(`ALTER TABLE "meal_plans" DROP COLUMN "dailyFat"`);
    await queryRunner.query(
      `ALTER TABLE "meal_plans" DROP COLUMN "dailyCarbs"`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_plans" DROP COLUMN "dailyProtein"`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_plans" DROP COLUMN "dailyCalories"`,
    );
    await queryRunner.query(`ALTER TABLE "meal_templates" ADD "order" integer`);
    await queryRunner.query(
      `ALTER TABLE "meal_templates" ADD "meal_plan_template_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_plans" ADD "daily_fat" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_plans" ADD "daily_carbs" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_plans" ADD "daily_protein" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_plans" ADD "daily_calories" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "meals" ADD "total_fat" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "meals" ADD "total_carbs" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "meals" ADD "total_protein" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "meals" ADD "total_calories" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(`ALTER TABLE "foods" ADD "search_vector" tsvector`);
    await queryRunner.query(
      `ALTER TABLE "foods" ADD "usageCount" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_foods_search_vector" ON "foods" ("search_vector") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_foods_name_trgm" ON "foods" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_foods_usage_count_searches" ON "foods" ("usage_count_searches") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_foods_usage_count_favorites" ON "foods" ("usage_count_favorites") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_foods_usage_count_meal_plans" ON "foods" ("usage_count_meal_plans") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_foods_source_id" ON "foods" ("source_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_foods_source" ON "foods" ("source") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_foods_is_verified" ON "foods" ("is_verified") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_foods_category_hierarchy" ON "foods" ("category_hierarchy") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_foods_categories" ON "foods" ("categories") `,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_templates" ADD CONSTRAINT "meal_templates_meal_plan_template_id_fkey" FOREIGN KEY ("meal_plan_template_id") REFERENCES "meal_plan_templates"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "food_templates" ADD CONSTRAINT "food_templates_meal_template_id_fkey" FOREIGN KEY ("meal_template_id") REFERENCES "meal_templates"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_plans" ADD CONSTRAINT "FK_35128838fc51bbb14f26e10fda7" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
