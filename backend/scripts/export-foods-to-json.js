const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MONGO_URI =
  'mongodb+srv://smartnutri:37131054@smartnutri.fa8xm6z.mongodb.net/?retryWrites=true&w=majority&appName=smartnutri';
const OUTPUT = path.resolve(__dirname, '../alimentos.json');

async function exportFoods() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection(COLLECTION);
    console.log(`[export-foods-to-json] Buscando alimentos...`);
    const alimentos = await collection
      .find(
        {},
        {
          projection: {
            _id: 0,
            codigo: 1,
            descricao: 1,
            classe: 1,
            nutrientes: 1,
            descricao_simplificada: 1,
            tags: 1,
            metadados: 1,
          },
        },
      )
      .toArray();
    console.log(
      `[export-foods-to-json] Total de alimentos: ${alimentos.length}`,
    );
    fs.writeFileSync(OUTPUT, JSON.stringify(alimentos, null, 2), 'utf-8');
    console.log(`[export-foods-to-json] Exportado para ${OUTPUT}`);
  } catch (err) {
    console.error('[export-foods-to-json] Erro:', err);
  } finally {
    await client.close();
  }
}

exportFoods();
