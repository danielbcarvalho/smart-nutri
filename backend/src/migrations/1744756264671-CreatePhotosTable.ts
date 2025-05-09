import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePhotosTable1744756264671 implements MigrationInterface {
  name = 'CreatePhotosTable1744756264671';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar se o tipo enum já existe
    const enumExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM pg_type 
                WHERE typname = 'photos_type_enum'
            );
        `);

    // Criar o tipo enum apenas se não existir
    if (!enumExists[0].exists) {
      await queryRunner.query(
        `CREATE TYPE "public"."photos_type_enum" AS ENUM('front', 'back', 'left', 'right')`,
      );
    }

    // Verificar se a tabela já existe
    const tableExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'photos'
            );
        `);

    // Criar a tabela apenas se não existir
    if (!tableExists[0].exists) {
      await queryRunner.query(
        `CREATE TABLE "photos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "patientId" uuid NOT NULL, "assessmentId" uuid, "type" "public"."photos_type_enum" NOT NULL, "url" character varying NOT NULL, "thumbnail_url" character varying NOT NULL, "storage_path" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_photos" PRIMARY KEY ("id"))`,
      );

      // Adicionar as foreign keys
      await queryRunner.query(
        `ALTER TABLE "photos" ADD CONSTRAINT "FK_photos_patient" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE`,
      );

      // Criar índices
      await queryRunner.query(
        `CREATE INDEX "IDX_photos_patient" ON "photos"("patientId")`,
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_photos_assessment" ON "photos"("assessmentId")`,
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_photos_created_at" ON "photos"("created_at")`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Verificar se a tabela existe antes de tentar removê-la
    const tableExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'photos'
            );
        `);

    if (tableExists[0].exists) {
      // Remover índices
      await queryRunner.query(`DROP INDEX IF EXISTS "IDX_photos_patient"`);
      await queryRunner.query(`DROP INDEX IF EXISTS "IDX_photos_assessment"`);
      await queryRunner.query(`DROP INDEX IF EXISTS "IDX_photos_created_at"`);

      // Remover foreign keys
      await queryRunner.query(
        `ALTER TABLE "photos" DROP CONSTRAINT IF EXISTS "FK_photos_patient"`,
      );

      // Remover a tabela
      await queryRunner.query(`DROP TABLE "photos"`);
    }

    // Verificar se o tipo enum existe antes de tentar removê-lo
    const enumExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM pg_type 
                WHERE typname = 'photos_type_enum'
            );
        `);

    if (enumExists[0].exists) {
      await queryRunner.query(
        `DROP TYPE IF EXISTS "public"."photos_type_enum"`,
      );
    }
  }
}
