const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configurações - preencha com seus dados do Supabase ou use variáveis de ambiente
const SUPABASE_URL =
  process.env.SUPABASE_URL || 'https://xuayjilwevkdcbnupedv.supabase.co';
console.log(
  '🚀 ~ upload-alimentos-to-supabase.js:8 ~ SUPABASE_URL 🚀🚀🚀:',
  SUPABASE_URL,
);
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1YXlqaWx3ZXZrZGNibnVwZWR2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDU3MzA4NywiZXhwIjoyMDYwMTQ5MDg3fQ.HD9ClLX-cU5vJt0U1NvvQZ16WsFGm7pWmVTvuo2OfNo';
const BUCKET = process.env.BUCKET || 'alimentos'; // ou o nome do seu bucket
const FILE_PATH = path.resolve(__dirname, '../src/food-db/alimentos.json');
const DEST_PATH = 'alimentos.json'; // Caminho no bucket

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function uploadFile() {
  const fileBuffer = fs.readFileSync(FILE_PATH);

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(DEST_PATH, fileBuffer, {
      contentType: 'application/json',
      upsert: true, // sobrescreve se já existir
    });

  if (error) {
    console.error('Erro ao fazer upload:', error);
  } else {
    console.log('Upload realizado com sucesso:', data);
    // URL pública (se o bucket for público)
    console.log(
      `URL pública: ${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${DEST_PATH}`,
    );
  }
}

uploadFile();
