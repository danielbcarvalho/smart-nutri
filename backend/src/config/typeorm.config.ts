import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { join } from 'path';

config();

const configService = new ConfigService();

console.log('[TypeORM Config] DB_HOST:', configService.get('DB_HOST'));
console.log('[TypeORM Config] DB_PORT:', configService.get('DB_PORT'));
console.log('[TypeORM Config] DB_USERNAME:', configService.get('DB_USERNAME'));
console.log('[TypeORM Config] DB_PASSWORD:', configService.get('DB_PASSWORD'));
console.log('[TypeORM Config] DB_DATABASE:', configService.get('DB_DATABASE'));
console.log(
  '[TypeORM Config] SUPABASE_URL:',
  configService.get('SUPABASE_URL'),
);
console.log(
  '[TypeORM Config] SUPABASE_ANON_KEY:',
  configService.get('SUPABASE_ANON_KEY'),
);
console.log(
  '[TypeORM Config] SUPABASE_SERVICE_ROLE_KEY:',
  configService.get('SUPABASE_SERVICE_ROLE_KEY'),
);

export default new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: +configService.get('DB_PORT'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_DATABASE'),
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, '..', 'database', 'migrations', '*.{ts,js}')],
  migrationsRun: true,
  synchronize: false,
  logging: true,
});
