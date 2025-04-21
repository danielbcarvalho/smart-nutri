import { MigrationInterface, QueryRunner } from 'typeorm';

export class PasswordEncryptionUpdate1745193833324
  implements MigrationInterface
{
  name = 'PasswordEncryptionUpdate1745193833324';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Não precisamos fazer nada nesta migração, pois estamos apenas alterando a lógica
    // de criptografia sem alterar a estrutura do banco de dados
    console.log('Migração de criptografia executada.');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Não há necessidade de fazer nada na reversão
    console.log('Migração de criptografia revertida.');
  }
}
