import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEnergyPlans1747000008000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create energy_plans table
    await queryRunner.query(`
            CREATE TABLE "energy_plans" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "patient_id" uuid NOT NULL,
                "nutritionist_id" uuid NOT NULL,
                "consultation_id" uuid,
                "name" character varying(255) NOT NULL,
                "calculation_date" date NOT NULL DEFAULT CURRENT_DATE,
                
                -- Anthropometrics
                "weight_at_calculation_kg" numeric(6,2) NOT NULL,
                "height_at_calculation_cm" numeric(5,1) NOT NULL,
                "fat_free_mass_at_calculation_kg" numeric(6,2),
                "age_at_calculation_years" integer NOT NULL,
                "gender_at_calculation" character varying(10) NOT NULL,
                
                -- Formula & Factors
                "formula_key" character varying(100) NOT NULL,
                "activity_factor_key" character varying(50),
                "injury_factor_key" character varying(50),
                
                -- Adjustments
                "additional_met_details" jsonb,
                "additional_met_total_kcal" numeric(7,2),
                "weight_goal_details" jsonb,
                "additional_pregnancy_kcal" numeric(7,2),
                "pregnancy_specific_inputs" jsonb,
                "custom_tmb_kcal_input" numeric(7,2),
                "custom_get_kcal_input" numeric(7,2),
                
                -- Results
                "calculated_tmb_kcal" numeric(7,2),
                "calculated_get_kcal" numeric(7,2) NOT NULL,
                
                -- Timestamps
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                
                CONSTRAINT "PK_energy_plans" PRIMARY KEY ("id"),
                CONSTRAINT "FK_energy_plans_patient" FOREIGN KEY ("patient_id")
                    REFERENCES "patients"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_energy_plans_nutritionist" FOREIGN KEY ("nutritionist_id")
                    REFERENCES "nutritionists"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_energy_plans_consultation" FOREIGN KEY ("consultation_id")
                    REFERENCES "consultations"("id") ON DELETE SET NULL
            )
        `);

    // Create indexes for energy_plans
    await queryRunner.query(`
            CREATE INDEX "IDX_energy_plans_patient_id" ON "energy_plans" ("patient_id");
            CREATE INDEX "IDX_energy_plans_nutritionist_id" ON "energy_plans" ("nutritionist_id");
            CREATE INDEX "IDX_energy_plans_consultation_id" ON "energy_plans" ("consultation_id");
            CREATE INDEX "IDX_energy_plans_patient_date" ON "energy_plans" ("patient_id", "calculation_date" DESC);
        `);

    // Add energy_plan_id to meal_plans table
    await queryRunner.query(`
            ALTER TABLE "meal_plans"
            ADD COLUMN "energy_plan_id" uuid,
            ADD CONSTRAINT "FK_meal_plans_energy_plan" FOREIGN KEY ("energy_plan_id")
                REFERENCES "energy_plans"("id") ON DELETE SET NULL
        `);

    // Create index for the new foreign key
    await queryRunner.query(`
            CREATE INDEX "IDX_meal_plans_energy_plan" ON "meal_plans" ("energy_plan_id");
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove energy_plan_id from meal_plans
    await queryRunner.query(`
            DROP INDEX "IDX_meal_plans_energy_plan";
            ALTER TABLE "meal_plans" DROP CONSTRAINT "FK_meal_plans_energy_plan";
            ALTER TABLE "meal_plans" DROP COLUMN "energy_plan_id";
        `);

    // Drop energy_plans table and its indexes
    await queryRunner.query(`
            DROP INDEX "IDX_energy_plans_patient_date";
            DROP INDEX "IDX_energy_plans_consultation_id";
            DROP INDEX "IDX_energy_plans_nutritionist_id";
            DROP INDEX "IDX_energy_plans_patient_id";
            DROP TABLE "energy_plans";
        `);
  }
}
