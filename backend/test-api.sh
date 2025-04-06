#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Função para executar testes
run_tests() {
    echo -e "${GREEN}Iniciando testes da API SmartNutri...${NC}\n"

    # Verifica se o servidor está rodando
    if ! curl -s http://localhost:8000/health > /dev/null; then
        echo -e "${RED}Erro: O servidor não está rodando. Inicie o servidor com 'npm run start:dev' primeiro.${NC}"
        exit 1
    fi

    # Criar dados de teste
    echo -e "${YELLOW}Criando dados de teste...${NC}"

    # Criar um paciente
    echo -e "\n${YELLOW}Criando paciente...${NC}"
    PATIENT_RESPONSE=$(curl -s -X POST http://localhost:8000/patients \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Paciente Teste",
            "email": "teste@example.com",
            "phone": "11999999999",
            "birthDate": "1990-01-01",
            "gender": "M",
            "height": 175,
            "weight": 70
        }')
    echo "Resposta: $PATIENT_RESPONSE"
    PATIENT_ID=$(echo $PATIENT_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    if [ -z "$PATIENT_ID" ]; then
        echo -e "${RED}Erro: Não foi possível extrair o ID do paciente da resposta${NC}"
        exit 1
    fi
    echo -e "${GREEN}Paciente criado com ID: $PATIENT_ID${NC}"

    # Criar um alimento
    echo -e "\n${YELLOW}Criando alimento...${NC}"
    FOOD_RESPONSE=$(curl -s -X POST http://localhost:8000/foods \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Alimento Teste",
            "servingSize": 100,
            "servingUnit": "g",
            "calories": 100,
            "protein": 10,
            "carbohydrates": 20,
            "fat": 5
        }')
    echo "Resposta: $FOOD_RESPONSE"
    FOOD_ID=$(echo $FOOD_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    if [ -z "$FOOD_ID" ]; then
        echo -e "${RED}Erro: Não foi possível extrair o ID do alimento da resposta${NC}"
        exit 1
    fi
    echo -e "${GREEN}Alimento criado com ID: $FOOD_ID${NC}"

    # Criar um plano alimentar
    echo -e "\n${YELLOW}Criando plano alimentar...${NC}"
    MEAL_PLAN_RESPONSE=$(curl -s -X POST http://localhost:8000/meal-plans \
        -H "Content-Type: application/json" \
        -d "{
            \"patientId\": \"$PATIENT_ID\",
            \"title\": \"Plano Teste\",
            \"startDate\": \"2024-03-20\",
            \"endDate\": \"2024-03-27\",
            \"goal\": \"Teste\",
            \"observations\": \"Plano de teste\"
        }")
    echo "Resposta: $MEAL_PLAN_RESPONSE"
    MEAL_PLAN_ID=$(echo $MEAL_PLAN_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    if [ -z "$MEAL_PLAN_ID" ]; then
        echo -e "${RED}Erro: Não foi possível extrair o ID do plano alimentar da resposta${NC}"
        exit 1
    fi
    echo -e "${GREEN}Plano alimentar criado com ID: $MEAL_PLAN_ID${NC}"

    echo -e "\n${GREEN}Dados de teste criados com sucesso!${NC}\n"

    # Função para testar endpoint
    test_endpoint() {
        local method=$1
        local endpoint=$2
        local expected_status=$3
        local data=$4

        echo -e "${YELLOW}Testando $method $endpoint...${NC}"
        if [ -n "$data" ]; then
            RESPONSE=$(curl -s -X $method "http://localhost:8000$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data")
        else
            RESPONSE=$(curl -s -X $method "http://localhost:8000$endpoint")
        fi
        echo "Resposta: $RESPONSE"
        
        if echo "$RESPONSE" | grep -q "id"; then
            echo -e "${GREEN}✓${NC}"
            return 0
        else
            echo -e "${RED}✗${NC}"
            return 1
        fi
    }

    # Testa os endpoints
    test_endpoint "GET" "/foods"
    test_endpoint "GET" "/foods/$FOOD_ID"
    test_endpoint "GET" "/patients"
    test_endpoint "GET" "/patients/$PATIENT_ID"
    test_endpoint "GET" "/meal-plans"
    test_endpoint "GET" "/meal-plans/$MEAL_PLAN_ID"
    test_endpoint "POST" "/foods/$FOOD_ID/favorite"

    echo -e "\n${GREEN}Testes concluídos!${NC}"
}

# Executa os testes
run_tests 