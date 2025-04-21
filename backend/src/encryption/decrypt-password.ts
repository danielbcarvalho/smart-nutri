import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { EncryptionService } from './encryption.service';

/**
 * Este script permite descriptografar uma senha fornecida como argumento
 * Uso: ts-node src/encryption/decrypt-password.ts SENHA_CRIPTOGRAFADA
 */

async function bootstrap() {
  // Verificar se a senha foi fornecida como argumento
  if (process.argv.length < 3) {
    console.error(
      'Uso: ts-node src/encryption/decrypt-password.ts SENHA_CRIPTOGRAFADA',
    );
    process.exit(1);
  }

  const encryptedPassword = process.argv[2];

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const encryptionService = app.get(EncryptionService);

    try {
      const decryptedPassword = encryptionService.decrypt(encryptedPassword);
      console.log('Senha descriptografada:', decryptedPassword);
    } catch (error) {
      console.error('Erro ao descriptografar:', error.message);
      console.error(
        'A senha fornecida pode não ser válida ou pode ter sido gerada com uma chave diferente.',
      );
    }
  } catch (error) {
    console.error('Erro ao inicializar o aplicativo:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
