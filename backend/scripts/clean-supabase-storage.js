/**
 * Script para limpar o armazenamento do Supabase
 *
 * Este script exclui todos os arquivos armazenados no Supabase Storage,
 * permitindo começar com um armazenamento limpo.
 *
 * Execute com: node clean-supabase-storage.js
 * Para limpar produção: NODE_ENV=production node clean-supabase-storage.js
 */

require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
});
const { createClient } = require('@supabase/supabase-js');

// Valores padrão do Supabase se não definidos no .env
const DEFAULT_SUPABASE_URL = 'https://glmgvpvyvxaqezoyrxml.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsbWd2cHZ5dnhhcWV6b3lyeG1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1Nzg0NTksImV4cCI6MjA2MDE1NDQ1OX0.l50JyqA8w7SQYqw9_eGNxQiAnukpRwM3oOxW-FIn8nw';
const DEFAULT_SUPABASE_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsbWd2cHZ5dnhhcWV6b3lyeG1sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDU3ODQ1OSwiZXhwIjoyMDYwMTU0NDU5fQ.caZDMgwH5qlLhSef1VQegYHc35kLqgUdn0LWiJPPwJY';

async function cleanSupabaseStorage() {
  // Usa os valores do ambiente ou os padrões definidos acima
  const supabaseUrl = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseServiceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SUPABASE_SERVICE_ROLE_KEY;

  console.log(
    `\n⚠️  AVISO: Você está prestes a EXCLUIR TODOS OS ARQUIVOS do armazenamento Supabase de ${process.env.NODE_ENV} ⚠️`,
  );
  console.log('\nEsta operação NÃO PODE ser desfeita!');

  console.log('\nDetalhes da conexão:');
  console.log(`URL: ${supabaseUrl}`);
  console.log(`Ambiente: ${process.env.NODE_ENV}`);

  // Prossegue com a limpeza
  console.log(
    `\nIniciando limpeza do armazenamento Supabase de ${process.env.NODE_ENV}...`,
  );

  try {
    // Inicializa o cliente do Supabase
    console.log('Conectando ao Supabase...');

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Lista todos os buckets
    console.log('Listando buckets de armazenamento...');
    const { data: buckets, error: bucketsError } =
      await supabase.storage.listBuckets();

    if (bucketsError) {
      throw bucketsError;
    }

    if (!buckets || buckets.length === 0) {
      console.log('\nNenhum bucket encontrado. Nada para limpar.');
      return;
    }

    console.log(`\nEncontrados ${buckets.length} buckets`);

    // Para cada bucket, excluir todos os arquivos
    for (const bucket of buckets) {
      console.log(`\nProcessando bucket: ${bucket.name}`);

      // Lista todos os arquivos no bucket
      const { data: files, error: filesError } = await supabase.storage
        .from(bucket.name)
        .list();

      if (filesError) {
        console.error(
          `  Erro ao listar arquivos do bucket ${bucket.name}:`,
          filesError,
        );
        continue;
      }

      if (!files || files.length === 0) {
        console.log(`  Bucket ${bucket.name} está vazio`);
        continue;
      }

      console.log(`  Encontrados ${files.length} arquivos para excluir`);

      // Exclui os arquivos em lotes de 100 para evitar sobrecarga
      const batchSize = 100;
      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        const filePaths = batch.map((file) => file.name);

        const { error: deleteError } = await supabase.storage
          .from(bucket.name)
          .remove(filePaths);

        if (deleteError) {
          console.error(
            `  Erro ao excluir lote de arquivos do bucket ${bucket.name}:`,
            deleteError,
          );
        } else {
          console.log(
            `  Excluídos ${filePaths.length} arquivos do bucket ${bucket.name} (lote ${Math.floor(i / batchSize) + 1})`,
          );
        }
      }
    }

    console.log(
      `\n✅ Limpeza do armazenamento Supabase de ${process.env.NODE_ENV} concluída com sucesso!`,
    );
  } catch (error) {
    console.error('Erro ao limpar armazenamento Supabase:', error);
  }
}

// Executa a função principal
cleanSupabaseStorage();
