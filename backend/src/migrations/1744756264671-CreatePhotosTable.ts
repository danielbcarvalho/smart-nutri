import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePhotosTable1744756264671 implements MigrationInterface {
    name = 'CreatePhotosTable1744756264671'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."photos_type_enum" AS ENUM('front', 'back', 'left', 'right')`);
        await queryRunner.query(`CREATE TABLE "photos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "patientId" uuid NOT NULL, "assessmentId" uuid, "type" "public"."photos_type_enum" NOT NULL, "url" character varying NOT NULL, "thumbnail_url" character varying NOT NULL, "storage_path" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_5220c45b8e32d49d767b9b3d725" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_919a8689521d43420d399f3f69" ON "photos" ("patientId") `);
        await queryRunner.query(`CREATE INDEX "IDX_610a20684a69cf71474640bd8a" ON "photos" ("assessmentId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_610a20684a69cf71474640bd8a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_919a8689521d43420d399f3f69"`);
        await queryRunner.query(`DROP TABLE "photos"`);
        await queryRunner.query(`DROP TYPE "public"."photos_type_enum"`);
    }

}
