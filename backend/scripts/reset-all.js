/**
 * Script para resetar completamente a aplicação
 *
 * Este script orquestra a limpeza dos dados do banco de dados PostgreSQL e do armazenamento Supabase,
 * permitindo começar com um ambiente limpo.
 *
 * Execute com: node reset-all.js
 * Para limpar produção: NODE_ENV=production node reset-all.js
 */

const { spawn } = require('child_process');
const path = require('path');

// Obtém o diretório atual dos scripts
const SCRIPTS_DIR = __dirname;

async function resetAll() {
  const isProduction = process.env.NODE_ENV === 'production';
  const environment = isProduction ? 'PRODUÇÃO' : 'desenvolvimento';

  console.log(
    `\n🧹 RESET COMPLETO DO AMBIENTE DE ${environment.toUpperCase()} 🧹`,
  );
  console.log('\nEste script irá:');
  console.log(
    '1. Limpar todos os dados do banco de dados PostgreSQL (mantendo a estrutura)',
  );
  console.log('2. Excluir todos os arquivos do armazenamento Supabase');
  console.log('3. Corrigir a tabela de migrações para garantir consistência');
  console.log(
    '4. Executar as migrations para garantir que a estrutura do banco esteja atualizada',
  );

  if (isProduction) {
    console.log('\n⚠️  ATENÇÃO: Você está em ambiente de PRODUÇÃO! ⚠️');
    console.log(
      'Esta operação excluirá TODOS OS DADOS DE PRODUÇÃO e NÃO PODE ser desfeita!',
    );
  }

  console.log('\n🚀 Iniciando processo de reset completo...\n');

  try {
    // 1. Limpar banco de dados
    console.log('🗄️  Etapa 1/4: Limpando dados do banco de dados...');

    // Caminhos absolutos para os scripts
    const dbScript = isProduction
      ? path.join(SCRIPTS_DIR, 'clean-prod-db.js')
      : path.join(SCRIPTS_DIR, 'clean-dev-db.js');

    await runScript(dbScript);

    // 2. Limpar armazenamento Supabase
    console.log('\n📁 Etapa 2/4: Limpando armazenamento Supabase...');

    const storageScript = path.join(SCRIPTS_DIR, 'clean-supabase-storage.js');
    await runScript(storageScript);

    // 3. Corrigir tabela de migrações
    console.log('\n🔧 Etapa 3/4: Corrigindo tabela de migrações...');

    const fixMigrationsScript = path.join(SCRIPTS_DIR, 'fix-migrations.js');
    await runScript(fixMigrationsScript);

    // 4. Executar migrations
    console.log(
      '\n📊 Etapa 4/4: Executando migrations para atualizar a estrutura do banco, se necessário...',
    );

    // Ajustamos o caminho para voltar um diretório acima do diretório scripts
    const migrationCmd = isProduction
      ? 'cd "' +
        path.join(SCRIPTS_DIR, '..') +
        '" && NODE_ENV=production npm run migration:run'
      : 'cd "' + path.join(SCRIPTS_DIR, '..') + '" && npm run migration:run';

    await runCommand(migrationCmd);

    // 5. Finalizar
    console.log('\n✅ Reset completo finalizado com sucesso!');
    console.log('\n🎉 O ambiente está agora limpo e pronto para uso.');

    if (!isProduction) {
      console.log('\nVocê pode iniciar o servidor com: npm run start:dev');
    }
  } catch (error) {
    console.error('\n❌ Erro durante o processo de reset:', error);
    console.log(
      '\nO processo de reset foi interrompido. Alguns passos podem não ter sido concluídos.',
    );
  }
}

// Função para executar um script node
function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    console.log(`Executando script: ${scriptPath}`);

    const env = { ...process.env };
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      env,
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script ${scriptPath} falhou com código ${code}`));
      }
    });
  });
}

// Função para executar comandos shell
function runCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`Executando comando: ${command}`);

    const env = { ...process.env };
    const child = spawn(command, {
      stdio: 'inherit',
      shell: true,
      env,
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Comando "${command}" falhou com código ${code}`));
      }
    });
  });
}

// Executa a função principal
resetAll();
