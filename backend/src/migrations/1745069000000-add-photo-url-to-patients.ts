import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhotoUrlToPatients1745069000000 implements MigrationInterface {
  name = 'AddPhotoUrlToPatients1745069000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar se a coluna já existe
    const columnExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'patients' 
        AND column_name = 'photo_url'
      );
    `);

    // Só adiciona a coluna se ela não existir
    if (!columnExists[0].exists) {
      await queryRunner.query(`
        ALTER TABLE "patients" ADD "photo_url" character varying
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Verificar se a coluna existe antes de tentar removê-la
    const columnExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'patients' 
        AND column_name = 'photo_url'
      );
    `);

    if (columnExists[0].exists) {
      await queryRunner.query(`
        ALTER TABLE "patients" DROP COLUMN "photo_url"
      `);
    }
  }
}
