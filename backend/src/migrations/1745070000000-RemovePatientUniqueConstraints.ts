import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovePatientUniqueConstraints1745070000000
  implements MigrationInterface
{
  name = 'RemovePatientUniqueConstraints1745070000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Descobrir o nome da constraint de unique para cpf
    const cpfConstraint = 'UQ_5947301223f5a908fd5e372b0fb'; // Identificada a partir do erro
    await queryRunner.query(
      `ALTER TABLE "patients" DROP CONSTRAINT "${cpfConstraint}"`,
    );

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
    // Adicionar as constraints de volta, caso seja necessário reverter
    await queryRunner.query(
      `ALTER TABLE "patients" ADD CONSTRAINT "UQ_5947301223f5a908fd5e372b0fb" UNIQUE ("cpf")`,
    );
    await queryRunner.query(
      `ALTER TABLE "patients" ADD CONSTRAINT "UQ_patients_email" UNIQUE ("email")`,
    );
  }
}
