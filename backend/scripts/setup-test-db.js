require('dotenv').config({ path: '.env.test' });
const { Client } = require('pg');

async function setupTestDatabase() {
  console.log('Starting database setup with configuration:');
  console.log(`Host: ${process.env.DATABASE_HOST}`);
  console.log(`Port: ${process.env.DATABASE_PORT}`);
  console.log(`User: ${process.env.DATABASE_USERNAME}`);
  console.log(`Database: ${process.env.DATABASE_NAME}`);

  const client = new Client({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: 'postgres',
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Verificar se o usuário tem permissões para criar bancos de dados
    const result = await client.query(`
      SELECT has_database_privilege('${process.env.DATABASE_USERNAME}', 'CREATE');
    `);
    console.log(
      'User has CREATE privilege:',
      result.rows[0].has_database_privilege,
    );

    // Terminate all connections to the test database
    await client.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = '${process.env.DATABASE_NAME}'
      AND pid <> pg_backend_pid();
    `);
    console.log('Terminated existing connections to test database');

    // Drop the test database if it exists
    await client.query(`DROP DATABASE IF EXISTS ${process.env.DATABASE_NAME}`);
    console.log(`Dropped database ${process.env.DATABASE_NAME} if it existed`);

    // Create the test database
    await client.query(`CREATE DATABASE ${process.env.DATABASE_NAME}`);
    console.log(`Created database ${process.env.DATABASE_NAME}`);

    // Connect to the test database to verify it exists
    const testClient = new Client({
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      user: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    });

    await testClient.connect();
    console.log('Successfully connected to test database');

    // Create the public schema if it doesn't exist
    await testClient.query(`CREATE SCHEMA IF NOT EXISTS public`);
    console.log('Created public schema');

    // Grant all privileges on the public schema to the user
    await testClient.query(
      `GRANT ALL ON SCHEMA public TO ${process.env.DATABASE_USERNAME}`,
    );
    console.log('Granted privileges on public schema');

    // Verificar se o usuário tem permissões no banco de dados de teste
    const privilegesResult = await testClient.query(`
      SELECT has_schema_privilege('${process.env.DATABASE_USERNAME}', 'public', 'CREATE');
    `);
    console.log(
      'User has CREATE privilege on public schema:',
      privilegesResult.rows[0].has_schema_privilege,
    );

    await testClient.end();
  } catch (error) {
    console.error('Error setting up test database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupTestDatabase();
