/**
 * Script para limpar o banco de dados de desenvolvimento
 *
 * Este script limpa todas as tabelas do banco de dados, removendo todos os dados
 * mas preservando a estrutura das tabelas.
 *
 * Execute com: node clean-dev-db.js
 */

require('dotenv').config();
const { Client } = require('pg');

// Valores padrão do Supabase se não definidos no .env
const DEFAULT_DB_HOST = 'db.glmgvpvyvxaqezoyrxml.supabase.co';
const DEFAULT_DB_PORT = '5432';
const DEFAULT_DB_USERNAME = 'postgres';
const DEFAULT_DB_PASSWORD = 'smartnutri';
const DEFAULT_DB_DATABASE = 'postgres';

async function cleanDevDatabase() {
  // Usa os valores do ambiente ou os padrões definidos acima
  const dbHost = process.env.DB_HOST || DEFAULT_DB_HOST;
  const dbPort = process.env.DB_PORT || DEFAULT_DB_PORT;
  const dbUsername = process.env.DB_USERNAME || DEFAULT_DB_USERNAME;
  const dbPassword = process.env.DB_PASSWORD || DEFAULT_DB_PASSWORD;
  const dbDatabase = process.env.DB_DATABASE || DEFAULT_DB_DATABASE;

  console.log('Limpando dados do banco de dados de desenvolvimento...');
  console.log('Usando as seguintes configurações:');
  console.log(`Host: ${dbHost}`);
  console.log(`Port: ${dbPort}`);
  console.log(`Database: ${dbDatabase}`);

  const client = new Client({
    host: dbHost,
    port: dbPort,
    user: dbUsername,
    password: dbPassword,
    database: dbDatabase, // Conecta diretamente ao banco de dados que queremos limpar
  });

  try {
    await client.connect();
    console.log('Conectado ao PostgreSQL');

    // Pegar todas as tabelas do schema public
    console.log('Listando todas as tabelas...');
    const tablesQuery = `
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public';
    `;

    const { rows: tables } = await client.query(tablesQuery);

    if (tables.length === 0) {
      console.log('Nenhuma tabela encontrada no banco de dados.');
      return;
    }

    console.log(`Encontradas ${tables.length} tabelas para limpar.`);

    // Desabilitar verificações de chaves estrangeiras temporariamente
    console.log('Desabilitando verificações de chaves estrangeiras...');
    await client.query('SET session_replication_role = replica;');

    // Truncar todas as tabelas encontradas
    console.log('Truncando todas as tabelas...');
    for (const table of tables) {
      const tableName = table.tablename;
      try {
        await client.query(`TRUNCATE TABLE "${tableName}" CASCADE;`);
        console.log(`Tabela "${tableName}" truncada com sucesso.`);
      } catch (err) {
        console.warn(
          `Aviso ao truncar a tabela "${tableName}": ${err.message}`,
        );
      }
    }

    // Reabilitar verificações de chaves estrangeiras
    console.log('Reabilitando verificações de chaves estrangeiras...');
    await client.query('SET session_replication_role = origin;');

    console.log('\nDados do banco limpos com sucesso!');
    console.log(
      '\nA estrutura do banco de dados foi preservada, apenas os dados foram removidos.',
    );
  } catch (error) {
    console.error('Erro ao limpar banco de dados:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

cleanDevDatabase();
