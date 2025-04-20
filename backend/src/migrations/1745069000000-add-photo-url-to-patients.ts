import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhotoUrlToPatients1745069000000 implements MigrationInterface {
  name = 'AddPhotoUrlToPatients1745069000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "patients" ADD "photo_url" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "photo_url"`);
  }
}
