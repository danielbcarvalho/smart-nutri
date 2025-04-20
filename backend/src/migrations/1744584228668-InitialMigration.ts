import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1744584228668 implements MigrationInterface {
  name = 'InitialMigration1744584228668';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "foods" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "externalId" character varying, "servingSize" numeric(10,2) NOT NULL, "servingUnit" character varying NOT NULL, "calories" numeric(10,2) NOT NULL, "protein" numeric(10,2) NOT NULL, "carbohydrates" numeric(10,2) NOT NULL, "fat" numeric(10,2) NOT NULL, "fiber" numeric(10,2), "sugar" numeric(10,2), "sodium" numeric(10,2), "additionalNutrients" jsonb, "categories" text array NOT NULL DEFAULT '{}', "isFavorite" boolean NOT NULL DEFAULT false, "version" integer NOT NULL DEFAULT '1', "is_verified" boolean NOT NULL DEFAULT false, "source" character varying, "source_id" character varying, "usage_count_meal_plans" integer NOT NULL DEFAULT '0', "usage_count_favorites" integer NOT NULL DEFAULT '0', "usage_count_searches" integer NOT NULL DEFAULT '0', "category_hierarchy" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0cc83421325632f61fa27a52b59" PRIMARY KEY ("id"))`,
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
      `CREATE TABLE "meal_foods" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "amount" numeric(10,2) NOT NULL, "unit" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "mealId" uuid, "foodId" uuid, CONSTRAINT "PK_ecfb33c2d4496ad3300728443de" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "meals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "time" TIME NOT NULL, "notes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "totalCalories" numeric(10,2) NOT NULL DEFAULT '0', "totalProtein" numeric(10,2) NOT NULL DEFAULT '0', "totalCarbs" numeric(10,2) NOT NULL DEFAULT '0', "totalFat" numeric(10,2) NOT NULL DEFAULT '0', "mealPlanId" uuid, CONSTRAINT "PK_e6f830ac9b463433b58ad6f1a59" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "meal_plans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "notes" text, "patient_id" uuid NOT NULL, "nutritionist_id" uuid NOT NULL, "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "dailyCalories" numeric(10,2) NOT NULL DEFAULT '0', "dailyProtein" numeric(10,2) NOT NULL DEFAULT '0', "dailyCarbs" numeric(10,2) NOT NULL DEFAULT '0', "dailyFat" numeric(10,2) NOT NULL DEFAULT '0', CONSTRAINT "PK_6270d3206d074e2a2520f8d0a0b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."consultations_status_enum" AS ENUM('scheduled', 'completed', 'cancelled', 'rescheduled')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."consultations_type_enum" AS ENUM('initial', 'follow_up', 'assessment', 'meal_plan_review', 'other')`,
    );
    await queryRunner.query(
      `CREATE TABLE "consultations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" TIMESTAMP NOT NULL, "patient_id" uuid NOT NULL, "nutritionist_id" uuid NOT NULL, "notes" text, "status" "public"."consultations_status_enum" NOT NULL DEFAULT 'scheduled', "type" "public"."consultations_type_enum" NOT NULL DEFAULT 'follow_up', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c5b78e9424d9bc68464f6a12103" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "food_templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "meal_template_id" uuid NOT NULL, "name" character varying NOT NULL, "portion" character varying NOT NULL, "calories" numeric(10,2), "protein" numeric(10,2), "carbs" numeric(10,2), "fat" numeric(10,2), "category" character varying, "tags" jsonb, "searchVector" tsvector NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f3eb572b2890ee4ae3d611afa89" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "meal_templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "plan_template_id" uuid NOT NULL, "name" character varying NOT NULL, "description" text, "time" TIME, "order_index" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4f3c3fc6939a77ae2c550a53a9e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "meal_plan_templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "nutritionist_id" uuid, "is_public" boolean NOT NULL DEFAULT false, "tags" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8d6be9961e7ab6c491887e68fa8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "nutritionists" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "phone" character varying, "crn" character varying, "specialties" jsonb, "clinicName" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_64f4b43fddabdfc2392b5ea6207" UNIQUE ("email"), CONSTRAINT "UQ_8d12e65e7360877dfee291122c3" UNIQUE ("crn"), CONSTRAINT "PK_c8166e82215bfbd26bd5ef1d0dc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "measurements" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "weight" numeric(5,2) NOT NULL, "height" numeric(5,2), "sittingHeight" numeric(5,2), "kneeHeight" numeric(5,2), "bodyFat" numeric(5,2), "fatMass" numeric(5,2), "muscleMassPercentage" numeric(5,2), "muscleMass" numeric(5,2), "fatFreeMass" numeric(5,2), "boneMass" numeric(5,2), "visceralFat" numeric(5,2), "bodyWater" numeric(5,2), "metabolicAge" integer, "measurements" jsonb NOT NULL, "skinfolds" jsonb, "boneDiameters" jsonb, "skinfoldFormula" character varying(50), "patient_id" uuid NOT NULL, "nutritionist_id" uuid NOT NULL, "consultation_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3c0e7812563f27fd68e8271661b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."patient_photos_phototype_enum" AS ENUM('front', 'back', 'left_side', 'right_side', 'other')`,
    );
    await queryRunner.query(
      `CREATE TABLE "patient_photos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "patient_id" uuid NOT NULL, "nutritionist_id" uuid NOT NULL, "photoUrl" character varying NOT NULL, "photoType" "public"."patient_photos_phototype_enum" NOT NULL DEFAULT 'other', "photoDate" date NOT NULL, "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bcca3961caf1520c0fcbf29f41d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."patients_gender_enum" AS ENUM('M', 'F', 'OTHER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."patients_status_enum" AS ENUM('active', 'inactive')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."patients_monitoringstatus_enum" AS ENUM('in_progress', 'paused', 'completed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."patients_consultationfrequency_enum" AS ENUM('weekly', 'biweekly', 'monthly', 'custom')`,
    );
    await queryRunner.query(
      `CREATE TABLE "patients" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying, "cpf" character varying, "phone" character varying, "address" character varying, "birthDate" date, "gender" "public"."patients_gender_enum", "instagram" character varying, "status" "public"."patients_status_enum" NOT NULL DEFAULT 'active', "height" numeric(5,2), "weight" numeric(5,2), "goals" jsonb, "allergies" jsonb, "healthConditions" jsonb, "medications" jsonb, "observations" character varying, "nutritionist_id" uuid, "lastConsultationAt" TIMESTAMP, "nextConsultationAt" TIMESTAMP, "monitoringStatus" "public"."patients_monitoringstatus_enum" NOT NULL DEFAULT 'in_progress', "consultationFrequency" "public"."patients_consultationfrequency_enum" NOT NULL DEFAULT 'monthly', "customConsultationDays" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_64e2031265399f5690b0beba6a5" UNIQUE ("email"), CONSTRAINT "UQ_5947301223f5a908fd5e372b0fb" UNIQUE ("cpf"), CONSTRAINT "PK_a7f0b9fcbb3469d5ec0b0aceaa7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_64e2031265399f5690b0beba6a" ON "patients" ("email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5947301223f5a908fd5e372b0f" ON "patients" ("cpf") `,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_foods" ADD CONSTRAINT "FK_26a89559f823da620e91b051fb3" FOREIGN KEY ("mealId") REFERENCES "meals"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_foods" ADD CONSTRAINT "FK_1ceb026c299d411e943718fa487" FOREIGN KEY ("foodId") REFERENCES "foods"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "meals" ADD CONSTRAINT "FK_4a0b86d259b3a2448e741bbebde" FOREIGN KEY ("mealPlanId") REFERENCES "meal_plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_plans" ADD CONSTRAINT "FK_35128838fc51bbb14f26e10fda7" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_plans" ADD CONSTRAINT "FK_627e1a7afc14bcf0c6f86a7ecf6" FOREIGN KEY ("nutritionist_id") REFERENCES "nutritionists"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "consultations" ADD CONSTRAINT "FK_ee6c335246d3b937f11c329c837" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "consultations" ADD CONSTRAINT "FK_d66d82dc11b2533c3c8fa38ab77" FOREIGN KEY ("nutritionist_id") REFERENCES "nutritionists"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
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
    await queryRunner.query(
      `ALTER TABLE "measurements" ADD CONSTRAINT "FK_5fd71102c67489944bc488712b6" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "measurements" ADD CONSTRAINT "FK_f5586f3c076e6cf2a4e5b3d8fbe" FOREIGN KEY ("nutritionist_id") REFERENCES "nutritionists"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "measurements" ADD CONSTRAINT "FK_05333f4c31bae98589fae402144" FOREIGN KEY ("consultation_id") REFERENCES "consultations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "patient_photos" ADD CONSTRAINT "FK_028145146851107fd7a6c7709c7" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "patient_photos" ADD CONSTRAINT "FK_f7ad35dab83f04b20ccafdf6f5d" FOREIGN KEY ("nutritionist_id") REFERENCES "nutritionists"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "patients" ADD CONSTRAINT "FK_b26500f025f5e02c2a0e698bfc9" FOREIGN KEY ("nutritionist_id") REFERENCES "nutritionists"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "patients" DROP CONSTRAINT "FK_b26500f025f5e02c2a0e698bfc9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "patient_photos" DROP CONSTRAINT "FK_f7ad35dab83f04b20ccafdf6f5d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "patient_photos" DROP CONSTRAINT "FK_028145146851107fd7a6c7709c7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "measurements" DROP CONSTRAINT "FK_05333f4c31bae98589fae402144"`,
    );
    await queryRunner.query(
      `ALTER TABLE "measurements" DROP CONSTRAINT "FK_f5586f3c076e6cf2a4e5b3d8fbe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "measurements" DROP CONSTRAINT "FK_5fd71102c67489944bc488712b6"`,
    );
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
      `ALTER TABLE "consultations" DROP CONSTRAINT "FK_d66d82dc11b2533c3c8fa38ab77"`,
    );
    await queryRunner.query(
      `ALTER TABLE "consultations" DROP CONSTRAINT "FK_ee6c335246d3b937f11c329c837"`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_plans" DROP CONSTRAINT "FK_627e1a7afc14bcf0c6f86a7ecf6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_plans" DROP CONSTRAINT "FK_35128838fc51bbb14f26e10fda7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "meals" DROP CONSTRAINT "FK_4a0b86d259b3a2448e741bbebde"`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_foods" DROP CONSTRAINT "FK_1ceb026c299d411e943718fa487"`,
    );
    await queryRunner.query(
      `ALTER TABLE "meal_foods" DROP CONSTRAINT "FK_26a89559f823da620e91b051fb3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5947301223f5a908fd5e372b0f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_64e2031265399f5690b0beba6a"`,
    );
    await queryRunner.query(`DROP TABLE "patients"`);
    await queryRunner.query(
      `DROP TYPE "public"."patients_consultationfrequency_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."patients_monitoringstatus_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."patients_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."patients_gender_enum"`);
    await queryRunner.query(`DROP TABLE "patient_photos"`);
    await queryRunner.query(
      `DROP TYPE "public"."patient_photos_phototype_enum"`,
    );
    await queryRunner.query(`DROP TABLE "measurements"`);
    await queryRunner.query(`DROP TABLE "nutritionists"`);
    await queryRunner.query(`DROP TABLE "meal_plan_templates"`);
    await queryRunner.query(`DROP TABLE "meal_templates"`);
    await queryRunner.query(`DROP TABLE "food_templates"`);
    await queryRunner.query(`DROP TABLE "consultations"`);
    await queryRunner.query(`DROP TYPE "public"."consultations_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."consultations_status_enum"`);
    await queryRunner.query(`DROP TABLE "meal_plans"`);
    await queryRunner.query(`DROP TABLE "meals"`);
    await queryRunner.query(`DROP TABLE "meal_foods"`);
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
    await queryRunner.query(`DROP TABLE "foods"`);
  }
}
