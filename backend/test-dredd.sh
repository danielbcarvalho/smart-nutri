#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Função para executar os testes
run_tests() {
  echo "Iniciando testes com Dredd..."
  
  # Verifica se o Dredd está instalado
  if ! command -v dredd &> /dev/null; then
    echo -e "${RED}Erro: Dredd não está instalado. Instalando...${NC}"
    npm install -g dredd
    if ! command -v dredd &> /dev/null; then
      echo -e "${RED}Erro: Falha ao instalar o Dredd. Por favor, instale manualmente com 'npm install -g dredd'${NC}"
      exit 1
    fi
    echo -e "${GREEN}Dredd instalado com sucesso!${NC}"
  fi
  
  # Verifica se o servidor está rodando
  if ! curl -s http://localhost:8000/health > /dev/null; then
    echo -e "${RED}Erro: Servidor não está rodando em http://localhost:8000${NC}"
    exit 1
  fi

  # Gera a documentação Swagger em formato JSON
  echo "Gerando documentação Swagger em formato JSON..."
  if [ -f "dist/main.js" ]; then
    node generate-swagger-json.js
    if [ ! -f "swagger.json" ]; then
      echo -e "${RED}Erro: Falha ao gerar a documentação Swagger${NC}"
      exit 1
    fi
    echo -e "${GREEN}Documentação Swagger gerada com sucesso!${NC}"
  else
    echo -e "${RED}Erro: O projeto não está compilado. Execute 'npm run build' primeiro${NC}"
    exit 1
  fi

  # Executa os testes com Dredd
  echo "Executando testes com Dredd..."
  dredd swagger.json http://localhost:8000 \
    --hookfiles=./hooks.js \
    --names \
    --reporter=spec \
    --only=patients,foods,meal-plans \
    --verbose
}

# Executa os testes
run_tests 