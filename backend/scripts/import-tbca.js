const { MongoClient } = require('mongodb');
const fs = require('fs');
const readline = require('readline');

// Função para converter string para número quando possível
const convertToNumberIfPossible = (value) => {
  if (value === 'NA' || value === 'Tr') return value;
  return isNaN(parseFloat(value.replace(',', '.')))
    ? value
    : parseFloat(value.replace(',', '.'));
};

// Função para criar versão simplificada do texto (sem acentos)
const simplificarTexto = (texto) => {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\w\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

async function importTBCA() {
  // Sua string de conexão do MongoDB Atlas
  const uri =
    'mongodb+srv://smartnutri:37131054@smartnutri.fa8xm6z.mongodb.net/?retryWrites=true&w=majority&appName=smartnutri';
  const client = new MongoClient(uri);

  try {
    // Conectar ao MongoDB
    console.log('Conectando ao MongoDB Atlas...');
    await client.connect();
    console.log('Conectado com sucesso!');

    const db = client.db('tbca_database');
    const collection = db.collection('alimentos');

    // Verificar se já existem dados na coleção
    const count = await collection.countDocuments();
    if (count > 0) {
      console.log(
        `A coleção já contém ${count} documentos. Deseja limpar antes de importar? (S/n)`,
      );
      // Em um script real, você pode adicionar uma interação do usuário aqui
      // Para este exemplo, vamos apenas prosseguir
      await collection.deleteMany({});
      console.log('Coleção limpa.');
    }

    // Preparar leitura do arquivo
    const fileStream = fs.createReadStream('../food-database/alimentos.txt');
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    console.log('Iniciando importação de alimentos...');

    let counter = 0;
    const batchSize = 100;
    let batch = [];

    // Processar cada linha do arquivo
    for await (const line of rl) {
      try {
        const alimentoOriginal = JSON.parse(line);

        // Transformar os nutrientes em um formato mais adequado
        const nutrientesMap = {};
        const nutrientesArray = alimentoOriginal.nutrientes.map((n) => {
          // Normalizar nome do componente para chave do objeto
          const chave = n.Componente.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '_');

          const valor = convertToNumberIfPossible(n['Valor por 100g']);

          nutrientesMap[chave] = {
            valor,
            unidade: n.Unidades,
          };

          return {
            componente: n.Componente,
            unidade: n.Unidades,
            valor_por_100g: valor,
          };
        });

        // Criar documento para inserção
        const alimento = {
          codigo: alimentoOriginal.codigo,
          classe: alimentoOriginal.classe,
          descricao: alimentoOriginal.descricao,
          descricao_simplificada: simplificarTexto(alimentoOriginal.descricao),
          tags: simplificarTexto(alimentoOriginal.descricao)
            .split(' ')
            .filter((word) => word.length > 3), // Palavras com mais de 3 letras como tags
          nutrientes: nutrientesMap,
          nutrientes_array: nutrientesArray,
          metadados: {
            ultima_atualizacao: new Date(),
            fonte: 'TBCA',
            versao_scraper: '1.0',
          },
        };

        batch.push(alimento);
        counter++;

        // Inserir em lotes para melhor performance
        if (batch.length >= batchSize) {
          await collection.insertMany(batch);
          console.log(`Processados ${counter} alimentos...`);
          batch = [];
        }
      } catch (error) {
        console.error(`Erro ao processar linha: ${error.message}`);
      }
    }

    // Inserir os registros restantes
    if (batch.length > 0) {
      await collection.insertMany(batch);
    }

    console.log(`Importação concluída! ${counter} alimentos importados.`);

    // Criar índices para otimizar as consultas
    console.log('Criando índices...');
    await collection.createIndex({ codigo: 1 }, { unique: true });
    await collection.createIndex({ classe: 1 });
    await collection.createIndex(
      { descricao: 'text', descricao_simplificada: 'text', tags: 'text' },
      {
        weights: {
          descricao: 10,
          descricao_simplificada: 5,
          tags: 1,
        },
        name: 'idx_text_search',
      },
    );

    // Índices para nutrientes comumente pesquisados
    await collection.createIndex({ 'nutrientes.energia_kcal.valor': 1 });
    await collection.createIndex({ 'nutrientes.proteina.valor': 1 });
    await collection.createIndex({ 'nutrientes.carboidrato_total.valor': 1 });
    await collection.createIndex({ 'nutrientes.lipidios.valor': 1 });

    console.log('Índices criados com sucesso!');
  } catch (error) {
    console.error(`Erro durante a importação: ${error.message}`);
  } finally {
    await client.close();
    console.log('Conexão com MongoDB Atlas fechada.');
  }
}

// Executar a importação
importTBCA().catch(console.error);
