import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAnthropometricFieldsToMeasurements1744333980918
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Coluna para altura
    await queryRunner.query(`
            ALTER TABLE measurements
            ADD COLUMN IF NOT EXISTS height DECIMAL(5,2)
        `);

    // Colunas para medidas básicas
    await queryRunner.query(`
            ALTER TABLE measurements
            ADD COLUMN IF NOT EXISTS "sittingHeight" DECIMAL(5,2)
        `);

    await queryRunner.query(`
            ALTER TABLE measurements
            ADD COLUMN IF NOT EXISTS "kneeHeight" DECIMAL(5,2)
        `);

    // Colunas para bioimpedância
    await queryRunner.query(`
            ALTER TABLE measurements
            ADD COLUMN IF NOT EXISTS "fatMass" DECIMAL(5,2)
        `);

    await queryRunner.query(`
            ALTER TABLE measurements
            ADD COLUMN IF NOT EXISTS "muscleMassPercentage" DECIMAL(5,2)
        `);

    await queryRunner.query(`
            ALTER TABLE measurements
            ADD COLUMN IF NOT EXISTS "fatFreeMass" DECIMAL(5,2)
        `);

    await queryRunner.query(`
            ALTER TABLE measurements
            ADD COLUMN IF NOT EXISTS "boneMass" DECIMAL(5,2)
        `);

    await queryRunner.query(`
            ALTER TABLE measurements
            ADD COLUMN IF NOT EXISTS "metabolicAge" INTEGER
        `);

    // Colunas para dobras cutâneas, diâmetros ósseos e fórmula
    await queryRunner.query(`
            ALTER TABLE measurements
            ADD COLUMN IF NOT EXISTS skinfolds JSONB DEFAULT '{}'::jsonb
        `);

    await queryRunner.query(`
            ALTER TABLE measurements
            ADD COLUMN IF NOT EXISTS "boneDiameters" JSONB DEFAULT '{}'::jsonb
        `);

    await queryRunner.query(`
            ALTER TABLE measurements
            ADD COLUMN IF NOT EXISTS "skinfoldFormula" VARCHAR(50)
        `);

    // Atualizar a estrutura do campo measurements (circunferências)
    // Isso não vai afetar dados existentes, apenas permitirá novos campos
    this.logger.log(
      'Migração para avaliação antropométrica completa concluída.',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover colunas para dobras cutâneas, diâmetros ósseos e fórmula
    await queryRunner.query(`
            ALTER TABLE measurements
            DROP COLUMN IF EXISTS "skinfoldFormula"
        `);

    await queryRunner.query(`
            ALTER TABLE measurements
            DROP COLUMN IF EXISTS "boneDiameters"
        `);

    await queryRunner.query(`
            ALTER TABLE measurements
            DROP COLUMN IF EXISTS skinfolds
        `);

    // Remover colunas de bioimpedância
    await queryRunner.query(`
            ALTER TABLE measurements
            DROP COLUMN IF EXISTS "metabolicAge"
        `);

    await queryRunner.query(`
            ALTER TABLE measurements
            DROP COLUMN IF EXISTS "boneMass"
        `);

    await queryRunner.query(`
            ALTER TABLE measurements
            DROP COLUMN IF EXISTS "fatFreeMass"
        `);

    await queryRunner.query(`
            ALTER TABLE measurements
            DROP COLUMN IF EXISTS "muscleMassPercentage"
        `);

    await queryRunner.query(`
            ALTER TABLE measurements
            DROP COLUMN IF EXISTS "fatMass"
        `);

    // Remover colunas de medidas básicas
    await queryRunner.query(`
            ALTER TABLE measurements
            DROP COLUMN IF EXISTS "kneeHeight"
        `);

    await queryRunner.query(`
            ALTER TABLE measurements
            DROP COLUMN IF EXISTS "sittingHeight"
        `);

    // Remover coluna de altura
    await queryRunner.query(`
            ALTER TABLE measurements
            DROP COLUMN IF EXISTS height
        `);
  }

  private logger = {
    log: (message: string) => console.log(message),
    error: (message: string) => console.error(message),
  };
}
