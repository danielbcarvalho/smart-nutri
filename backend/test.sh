#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Função para executar testes
run_tests() {
    echo -e "${GREEN}Iniciando testes da API SmartNutri...${NC}\n"

    # Verifica se o servidor está rodando
    if ! curl -s http://localhost:3000/health > /dev/null; then
        echo -e "${RED}Erro: O servidor não está rodando. Inicie o servidor com 'npm run start:dev' primeiro.${NC}"
        exit 1
    fi

    # Instala o newman se não estiver instalado
    if ! command -v newman &> /dev/null; then
        echo "Instalando newman..."
        npm install -g newman
    fi

    # Executa os testes
    echo "Executando testes..."
    newman run postman/SmartNutri.postman_collection.json \
        --env-var "baseUrl=http://localhost:3000"
}

# Executa os testes
run_tests
