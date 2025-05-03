import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { EncryptionService } from './encryption.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NutritionistsService } from '../modules/nutritionists/nutritionists.service';
import { Nutritionist } from '../modules/nutritionists/entities/nutritionist.entity';

/**
 * Este script deve ser usado apenas para fins do MVP, para migrar senhas existentes para
 * o sistema de criptografia reversível.
 *
 * OBS: Este script NÃO deve ser implementado em produção, pois senhas hashed com bcrypt
 * não podem ser recuperadas. Esse script serve para nutricionistas criados após a
 * implementação da criptografia reversível.
 */

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const nutritionistService = app.get(NutritionistsService);
    const encryptionService = app.get(EncryptionService);
    const nutritionistRepository = app.get(
      'NutritionistRepository',
    ) as Repository<Nutritionist>;

    // Apenas uma demonstração de como usar o serviço diretamente
    console.log('Exemplo de uso da criptografia reversível:');
    const senha = 'senha123';
    const senhaCriptografada = encryptionService.encrypt(senha);
    console.log(`Senha original: ${senha}`);
    console.log(`Senha criptografada: ${senhaCriptografada}`);
    console.log(
      `Senha descriptografada: ${encryptionService.decrypt(senhaCriptografada)}`,
    );

    console.log('\n---- AVISO ----');
    console.log(
      'Este script é apenas para demonstração e não executa migrações de senhas existentes.',
    );
    console.log(
      'Para migrar senhas, descomente o código abaixo e execute novamente.',
    );

    /*
    // Buscar nutricionistas
    console.log('\nMigrando senhas...');
    const nutritionists = await nutritionistRepository.find();
    let convertidos = 0;
    
    // Para cada nutricionista, tentar criar uma senha padrão pois não é possível recuperar a senha original
    for (const nutritionist of nutritionists) {
      try {
        // Senha padrão para o MVP - na prática, seria necessário um processo de recuperação de senha
        const novaSenha = 'smartnutri123'; 
        
        // Atualizar senha com criptografia reversível
        const passwordHash = encryptionService.encrypt(novaSenha);
        await nutritionistRepository.update(nutritionist.id, { passwordHash });
        
        console.log(`Migrado ${nutritionist.email} - nova senha: smartnutri123`);
        convertidos++;
      } catch (error) {
        console.error(`Erro ao migrar ${nutritionist.email}:`, error.message);
      }
    }
    
    console.log(`\nMigração concluída. ${convertidos} de ${nutritionists.length} senhas migradas.`);
    */
  } catch (error) {
    console.error('Erro durante a migração:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
