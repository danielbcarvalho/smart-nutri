import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const isTestEnvironment = process.env.NODE_ENV === 'test';
    console.log(
      'Creating TypeORM options for environment:',
      process.env.NODE_ENV,
    );
    console.log('Is test environment:', isTestEnvironment);

    // Verificar se as variáveis de ambiente estão definidas
    const host = this.configService.get('DATABASE_HOST');
    const port = +this.configService.get('DATABASE_PORT');
    const username = this.configService.get('DATABASE_USERNAME');
    const password = this.configService.get('DATABASE_PASSWORD');
    const database = this.configService.get('DATABASE_NAME');

    console.log('Database configuration:');
    console.log(`Host: ${host}`);
    console.log(`Port: ${port}`);
    console.log(`Username: ${username}`);
    console.log(`Database: ${database}`);

    if (!host || !port || !username || !password || !database) {
      console.error('Missing database configuration:', {
        host: !!host,
        port: !!port,
        username: !!username,
        password: !!password,
        database: !!database,
      });
      throw new Error('Missing database configuration');
    }

    const options: TypeOrmModuleOptions = {
      type: 'postgres',
      host,
      port,
      username,
      password,
      database,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: true,
      dropSchema: isTestEnvironment,
      migrationsRun: false,
      migrations: [],
      logging: true,
      // Adicionar opções específicas para o ambiente de teste
      ...(isTestEnvironment && {
        dropSchema: true,
        synchronize: true,
        logging: true,
        // Forçar recriação do schema
        extra: {
          // Desabilitar restrições de chave estrangeira durante a sincronização
          statement_timeout: 0,
          idle_in_transaction_session_timeout: 0,
        },
        // Desabilitar cache de entidades
        cache: false,
        // Desabilitar cache de queries
        queryCache: false,
        // Desabilitar cache de resultados
        resultCache: false,
        // Desabilitar cache de metadados
        metadataCache: false,
      }),
    };

    console.log('TypeORM options:', {
      ...options,
      password: '******', // Hide password in logs
    });

    return options;
  }
}
