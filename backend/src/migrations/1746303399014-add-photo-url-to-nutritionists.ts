import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPhotoUrlToNutritionists1746303399014 implements MigrationInterface {
    name = 'AddPhotoUrlToNutritionists1746303399014'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nutritionists" ADD "photo_url" character varying`);
        await queryRunner.query(`ALTER TABLE "patients" DROP CONSTRAINT "UQ_64e2031265399f5690b0beba6a5"`);
        await queryRunner.query(`ALTER TABLE "photos" ADD CONSTRAINT "FK_610a20684a69cf71474640bd8a4" FOREIGN KEY ("assessmentId") REFERENCES "measurements"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "photos" DROP CONSTRAINT "FK_610a20684a69cf71474640bd8a4"`);
        await queryRunner.query(`ALTER TABLE "patients" ADD CONSTRAINT "UQ_64e2031265399f5690b0beba6a5" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "nutritionists" DROP COLUMN "photo_url"`);
    }

}
