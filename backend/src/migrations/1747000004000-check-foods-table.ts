import { MigrationInterface, QueryRunner } from 'typeorm';

export class CheckFoodsTable1747000004000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verifica se a tabela foods já existe
    const tableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'foods'
      );
    `);

    // Se a tabela não existir, cria ela
    if (!tableExists[0].exists) {
      await queryRunner.query(`
        CREATE TABLE "foods" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "name" character varying NOT NULL,
          "externalId" character varying,
          "servingSize" numeric(10,2) NOT NULL,
          "servingUnit" character varying NOT NULL,
          "calories" numeric(10,2) NOT NULL,
          "protein" numeric(10,2) NOT NULL,
          "carbohydrates" numeric(10,2) NOT NULL,
          "fat" numeric(10,2) NOT NULL,
          "fiber" numeric(10,2),
          "sugar" numeric(10,2),
          "sodium" numeric(10,2),
          "additionalNutrients" jsonb,
          "categories" text array NOT NULL DEFAULT '{}',
          "isFavorite" boolean NOT NULL DEFAULT false,
          "version" integer NOT NULL DEFAULT '1',
          "is_verified" boolean NOT NULL DEFAULT false,
          "source" character varying,
          "source_id" character varying,
          "usage_count_meal_plans" integer NOT NULL DEFAULT '0',
          "usage_count_favorites" integer NOT NULL DEFAULT '0',
          "usage_count_searches" integer NOT NULL DEFAULT '0',
          "category_hierarchy" jsonb,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_0cc83421325632f61fa27a52b59" PRIMARY KEY ("id")
        )
      `);

      // Cria os índices necessários
      await queryRunner.query(`
        CREATE INDEX "IDX_a830cfbd285ac64c3aea9825b6" ON "foods" ("is_verified")
      `);
      await queryRunner.query(`
        CREATE INDEX "IDX_b50bca6326c4148141eb4cc03a" ON "foods" ("source")
      `);
      await queryRunner.query(`
        CREATE INDEX "IDX_b5cdb554611a705420766d51e8" ON "foods" ("source_id")
      `);
      await queryRunner.query(`
        CREATE INDEX "IDX_4853291383d57f378179516f9a" ON "foods" ("usage_count_meal_plans")
      `);
      await queryRunner.query(`
        CREATE INDEX "IDX_64b47a0a00291ec5d77973d202" ON "foods" ("usage_count_favorites")
      `);
      await queryRunner.query(`
        CREATE INDEX "IDX_ec0acd01135a20b35218953b44" ON "foods" ("usage_count_searches")
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Não fazemos nada no down pois não queremos remover a tabela
    // caso ela já exista
  }
}
