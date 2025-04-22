/**
 * Script para corrigir a tabela de migrações após reset
 *
 * Este script verifica se a tabela de migrações existe e insere
 * os registros necessários para marcar todas as migrações como aplicadas.
 *
 * Execute com: node fix-migrations.js
 */

require('dotenv').config();
const { Client } = require('pg');

// Valores padrão do Supabase se não definidos no .env
const DEFAULT_DB_HOST = 'db.glmgvpvyvxaqezoyrxml.supabase.co';
const DEFAULT_DB_PORT = '5432';
const DEFAULT_DB_USERNAME = 'postgres';
const DEFAULT_DB_PASSWORD = 'smartnutri';
const DEFAULT_DB_DATABASE = 'postgres';

async function fixMigrations() {
  // Usa os valores do ambiente ou os padrões definidos acima
  const dbHost = process.env.DB_HOST || DEFAULT_DB_HOST;
  const dbPort = process.env.DB_PORT || DEFAULT_DB_PORT;
  const dbUsername = process.env.DB_USERNAME || DEFAULT_DB_USERNAME;
  const dbPassword = process.env.DB_PASSWORD || DEFAULT_DB_PASSWORD;
  const dbDatabase = process.env.DB_DATABASE || DEFAULT_DB_DATABASE;

  console.log('Configurando tabela de migrações...');
  console.log('Usando as seguintes configurações:');
  console.log(`Host: ${dbHost}`);
  console.log(`Port: ${dbPort}`);
  console.log(`Database: ${dbDatabase}`);

  const client = new Client({
    host: dbHost,
    port: dbPort,
    user: dbUsername,
    password: dbPassword,
    database: dbDatabase,
  });

  try {
    await client.connect();
    console.log('Conectado ao PostgreSQL');

    // Verificar se a tabela de migrações existe
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'migrations'
      );
    `);

    const tableExists = tableCheck.rows[0].exists;

    if (tableExists) {
      console.log('Tabela de migrações encontrada. Limpando tabela...');
      await client.query('TRUNCATE TABLE migrations;');
      console.log('Tabela de migrações truncada.');
    } else {
      console.log('Criando tabela de migrações...');
      await client.query(`
        CREATE TABLE migrations (
          id SERIAL PRIMARY KEY,
          timestamp BIGINT NOT NULL,
          name VARCHAR NOT NULL
        );
      `);
      console.log('Tabela de migrações criada.');
    }

    // Inserir todas as migrações como já aplicadas
    console.log('Inserindo registros de migrações...');

    const migrations = [
      { timestamp: 1744584228668, name: 'InitialMigration1744584228668' },
      { timestamp: 1744586368974, name: 'AddIsSampleToPatient1744586368974' },
      { timestamp: 1744756264671, name: 'CreatePhotosTable1744756264671' },
      {
        timestamp: 1745067810414,
        name: 'AddPhotoUrlToNutritionists1745067810414',
      },
      {
        timestamp: 1745067810415,
        name: 'AddInstagramToNutritionists1745067810415',
      },
      { timestamp: 1745069000000, name: 'AddPhotoUrlToPatients1745069000000' },
      {
        timestamp: 1745069000000,
        name: 'RemoveCrnUniqueFromNutritionists1745069000000',
      },
      {
        timestamp: 1745070000000,
        name: 'RemovePatientUniqueConstraints1745070000000',
      },
      {
        timestamp: 1745193833324,
        name: 'PasswordEncryptionUpdate1745193833324',
      },
    ];

    for (const migration of migrations) {
      await client.query(
        'INSERT INTO migrations(timestamp, name) VALUES($1, $2)',
        [migration.timestamp, migration.name],
      );
      console.log(`Migração ${migration.name} registrada.`);
    }

    console.log('\nMigrações registradas com sucesso!');
    console.log(
      '\nAgora você deve poder executar a aplicação sem erros de migração.',
    );
  } catch (error) {
    console.error('Erro ao configurar migrações:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

fixMigrations();
