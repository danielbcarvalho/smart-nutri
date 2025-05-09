import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovePatientUniqueConstraints1745070000000
  implements MigrationInterface
{
  name = 'RemovePatientUniqueConstraints1745070000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar se a constraint existe
    const constraintExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'patients' 
        AND constraint_name = 'UQ_5947301223f5a908fd5e372b0fb'
      );
    `);

    // Só remove a constraint se ela existir
    if (constraintExists[0].exists) {
      await queryRunner.query(`
        ALTER TABLE "patients" DROP CONSTRAINT "UQ_5947301223f5a908fd5e372b0fb"
      `);
    }

    // Também remover a constraint de unique para email, se existir
    try {
      // Isso pode falhar se a constraint não existir, mas seguiremos em frente
      const result = await queryRunner.query(
        `SELECT constraint_name FROM information_schema.table_constraints 
         WHERE table_name = 'patients' AND constraint_type = 'UNIQUE' 
         AND constraint_name LIKE '%email%'`,
      );

      if (result && result.length > 0) {
        const emailConstraint = result[0].constraint_name;
        await queryRunner.query(
          `ALTER TABLE "patients" DROP CONSTRAINT "${emailConstraint}"`,
        );
      }
    } catch (error) {
      console.log('Erro ao tentar encontrar constraint do email:', error);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Verificar se a constraint existe antes de tentar recriá-la
    const constraintExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'patients' 
        AND constraint_name = 'UQ_5947301223f5a908fd5e372b0fb'
      );
    `);

    if (!constraintExists[0].exists) {
      await queryRunner.query(`
        ALTER TABLE "patients" ADD CONSTRAINT "UQ_5947301223f5a908fd5e372b0fb" UNIQUE ("cpf")
      `);
    }

    await queryRunner.query(
      `ALTER TABLE "patients" ADD CONSTRAINT "UQ_patients_email" UNIQUE ("email")`,
    );
  }
}
