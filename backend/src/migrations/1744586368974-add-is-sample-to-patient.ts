import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsSampleToPatient1744586368974 implements MigrationInterface {
  name = 'AddIsSampleToPatient1744586368974';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar se a coluna já existe
    const columnExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'patients' 
        AND column_name = 'isSample'
      );
    `);

    // Só adiciona a coluna se ela não existir
    if (!columnExists[0].exists) {
      await queryRunner.query(`
        ALTER TABLE "patients" ADD "isSample" boolean NOT NULL DEFAULT false
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
        AND column_name = 'isSample'
      );
    `);

    if (columnExists[0].exists) {
      await queryRunner.query(`
        ALTER TABLE "patients" DROP COLUMN "isSample"
      `);
    }
  }
}
