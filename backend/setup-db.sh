#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Função para verificar se o PostgreSQL está rodando
check_postgres() {
  echo -e "${GREEN}Verificando se o PostgreSQL está rodando...${NC}"
  
  if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo -e "${RED}Erro: O PostgreSQL não está rodando. Inicie o PostgreSQL e tente novamente.${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}PostgreSQL está rodando.${NC}"
}

# Função para criar o banco de dados se não existir
create_database() {
  echo -e "${GREEN}Verificando se o banco de dados existe...${NC}"
  
  if ! psql -U postgres -lqt | cut -d \| -f 1 | grep -qw smartnutri_db; then
    echo -e "${GREEN}Criando banco de dados smartnutri_db...${NC}"
    psql -U postgres -c "CREATE DATABASE smartnutri_db;"
    echo -e "${GREEN}Banco de dados criado com sucesso.${NC}"
  else
    echo -e "${GREEN}Banco de dados já existe.${NC}"
  fi
}

# Função para executar as migrações
run_migrations() {
  echo -e "${GREEN}Executando migrações...${NC}"
  
  # Instalar dependências se necessário
  if [ ! -d "node_modules" ]; then
    echo -e "${GREEN}Instalando dependências...${NC}"
    npm install
  fi
  
  # Executar migrações
  echo -e "${GREEN}Executando migrações do TypeORM...${NC}"
  npm run migration:run
  
  echo -e "${GREEN}Migrações executadas com sucesso.${NC}"
}

# Executar funções
check_postgres
create_database
run_migrations

echo -e "${GREEN}Configuração do banco de dados concluída com sucesso!${NC}"
echo -e "${GREEN}Você pode agora iniciar o servidor com 'npm run start:dev'${NC}" 