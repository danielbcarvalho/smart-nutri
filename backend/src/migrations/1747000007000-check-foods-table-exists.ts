import { MigrationInterface, QueryRunner } from 'typeorm';

export class CheckFoodsTableExists1747000007000 implements MigrationInterface {
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
        );
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Não fazemos nada no down pois não queremos dropar a tabela
  }
}
