/**
 * Script para exportar a estrutura do banco de dados
 *
 * Este script gera um arquivo Markdown com a estrutura completa do banco de dados,
 * incluindo todas as tabelas, colunas, tipos de dados, constraints e valores padrão.
 *
 * Execute com: node export-db-structure.js
 */

require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function exportDatabaseStructure() {
  // Configuração do cliente PostgreSQL
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || 'smartnutri_db',
  });

  try {
    await client.connect();
    console.log('Conectado ao PostgreSQL');

    const query = `
      WITH column_info AS (
        SELECT 
          c.table_name,
          c.column_name,
          c.data_type,
          c.character_maximum_length,
          c.is_nullable,
          c.column_default,
          c.ordinal_position,
          STRING_AGG(
            DISTINCT 
            CASE 
              WHEN tc.constraint_type = 'PRIMARY KEY' THEN 'PK'
              WHEN tc.constraint_type = 'FOREIGN KEY' THEN 'FK'
              ELSE NULL
            END,
            ','
          ) as constraints
        FROM 
          information_schema.columns c
          LEFT JOIN information_schema.table_constraints tc 
            ON tc.table_name = c.table_name
          LEFT JOIN information_schema.key_column_usage kcu 
            ON kcu.constraint_name = tc.constraint_name 
            AND kcu.column_name = c.column_name
        WHERE 
          c.table_schema = 'public'
        GROUP BY 
          c.table_name,
          c.column_name,
          c.data_type,
          c.character_maximum_length,
          c.is_nullable,
          c.column_default,
          c.ordinal_position
      )
      SELECT * FROM column_info
      ORDER BY 
        table_name,
        ordinal_position;
    `;

    const result = await client.query(query);

    // Formatar o resultado
    let output = '# Estrutura do Banco de Dados\n\n';
    output += `Gerado em: ${new Date().toLocaleString()}\n\n`;

    // Adicionar índice de tabelas
    output += '## Índice de Tabelas\n\n';
    const uniqueTables = [...new Set(result.rows.map((row) => row.table_name))];
    uniqueTables.forEach((table) => {
      output += `- [${table}](#tabela-${table.toLowerCase()})\n`;
    });
    output += '\n';

    let currentTable = '';

    result.rows.forEach((row) => {
      if (row.table_name !== currentTable) {
        currentTable = row.table_name;
        output += `\n## Tabela: ${currentTable} {#tabela-${currentTable.toLowerCase()}}\n\n`;
        output +=
          '| Coluna | Tipo | Tamanho | Nullable | Default | Constraints |\n';
        output +=
          '|--------|------|----------|----------|----------|------------|\n';
      }

      // Formatar o tipo de dado para incluir tamanho quando aplicável
      const dataType = row.character_maximum_length
        ? `${row.data_type}(${row.character_maximum_length})`
        : row.data_type;

      // Formatar o valor default para melhor legibilidade
      const defaultValue = row.column_default
        ? row.column_default.replace(/::.*$/, '') // Remove type casting
        : 'NULL';

      // Formatar as constraints
      const constraints = row.constraints || '';

      output += `| ${row.column_name} | ${dataType} | ${row.character_maximum_length || '-'} | ${row.is_nullable} | ${defaultValue} | ${constraints} |\n`;
    });

    // Adicionar informações sobre o banco
    output += '\n## Informações do Banco\n\n';
    output += `- **Host:** ${process.env.DB_HOST || 'localhost'}\n`;
    output += `- **Porta:** ${process.env.DB_PORT || 5432}\n`;
    output += `- **Banco de Dados:** ${process.env.DB_DATABASE || 'smartnutri_db'}\n`;
    output += `- **Schema:** public\n`;

    // Criar diretório docs se não existir
    const docsDir = path.join(__dirname, '..', 'docs');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir);
    }

    // Salvar em arquivo
    const outputPath = path.join(docsDir, 'database_structure.md');
    fs.writeFileSync(outputPath, output);
    console.log(`✅ Estrutura do banco exportada para ${outputPath}`);
  } catch (error) {
    console.error('❌ Erro ao exportar estrutura:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Executar o script
exportDatabaseStructure();
