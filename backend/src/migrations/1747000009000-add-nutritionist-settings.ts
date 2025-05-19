import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNutritionistSettings1747000009000
  implements MigrationInterface
{
  name = 'AddNutritionistSettings1747000009000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adiciona os novos campos na tabela nutritionists
    await queryRunner.query(`
            ALTER TABLE "nutritionists"
            ADD COLUMN IF NOT EXISTS "custom_colors" jsonb,
            ADD COLUMN IF NOT EXISTS "custom_fonts" jsonb,
            ADD COLUMN IF NOT EXISTS "logo_url" character varying;
        `);

    // Adiciona comentários nas colunas para documentação
    await queryRunner.query(`
            COMMENT ON COLUMN "nutritionists"."custom_colors" IS 'Armazena as cores personalizadas do nutricionista (primary, secondary, accent)';
            COMMENT ON COLUMN "nutritionists"."custom_fonts" IS 'Armazena as fontes personalizadas do nutricionista (primary, secondary)';
            COMMENT ON COLUMN "nutritionists"."logo_url" IS 'URL do logo personalizado do nutricionista';
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove os campos adicionados
    await queryRunner.query(`
            ALTER TABLE "nutritionists"
            DROP COLUMN IF EXISTS "custom_colors",
            DROP COLUMN IF EXISTS "custom_fonts",
            DROP COLUMN IF EXISTS "logo_url";
        `);
  }
}
