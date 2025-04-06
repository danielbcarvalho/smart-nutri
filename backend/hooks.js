const hooks = require('hooks');
const { v4: uuidv4 } = require('uuid');

// Token de autenticação
const AUTH_TOKEN = 'seu-token-jwt-aqui';

// IDs de exemplo para os testes
const EXAMPLE_IDS = {
  patient: uuidv4(),
  food: uuidv4(),
  mealPlan: uuidv4(),
};

// Hook para adicionar token de autenticação em todas as requisições
hooks.beforeEach((transaction) => {
  // Adiciona o token de autenticação no header
  transaction.request.headers = {
    ...transaction.request.headers,
    Authorization: `Bearer ${AUTH_TOKEN}`,
  };

  // Substitui IDs nas URLs
  const url = transaction.request.uri;

  // Extrai o parâmetro da URL usando regex
  const idMatch = url.match(/\/([^\/]+)\/([^\/]+)/);
  if (idMatch) {
    const [, resource, id] = idMatch;

    // Substitui o ID com base no recurso
    if (resource === 'patients') {
      transaction.request.uri = url.replace(
        /\/patients\/[^\/]+/,
        `/patients/${EXAMPLE_IDS.patient}`,
      );
    } else if (resource === 'foods') {
      transaction.request.uri = url.replace(
        /\/foods\/[^\/]+/,
        `/foods/${EXAMPLE_IDS.food}`,
      );
    } else if (resource === 'meal-plans') {
      transaction.request.uri = url.replace(
        /\/meal-plans\/[^\/]+/,
        `/meal-plans/${EXAMPLE_IDS.mealPlan}`,
      );
    }
  }
});

// Hook para adicionar dados de exemplo no corpo das requisições
hooks.beforeEach((transaction) => {
  if (
    transaction.request.method === 'POST' ||
    transaction.request.method === 'PUT'
  ) {
    // Verifica se o corpo da requisição é um JSON válido
    try {
      const body = JSON.parse(transaction.request.body || '{}');

      // Adiciona dados de exemplo para pacientes
      if (transaction.request.uri.includes('/patients')) {
        body.name = 'John Doe';
        body.email = 'john@example.com';
        body.phone = '1234567890';
        body.gender = 'M';
        body.birthDate = '1990-01-01';
        body.height = 1.75;
        body.weight = 70;
      }

      // Adiciona dados de exemplo para alimentos
      if (transaction.request.uri.includes('/foods')) {
        body.name = 'Apple';
        body.calories = 95;
        body.protein = 0.5;
        body.carbohydrates = 25;
        body.fat = 0.3;
      }

      // Adiciona dados de exemplo para planos alimentares
      if (transaction.request.uri.includes('/meal-plans')) {
        body.patientId = EXAMPLE_IDS.patient;
        body.title = 'Weekly Plan';
        body.description = 'A balanced weekly meal plan';
        body.startDate = new Date().toISOString().split('T')[0];
        body.endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];
      }

      transaction.request.body = JSON.stringify(body);
    } catch (error) {
      console.error('Erro ao processar o corpo da requisição:', error);
    }
  }
});

// Hook para criar dados necessários antes dos testes
hooks.before('POST /foods > 201', (transaction) => {
  // Dados de exemplo para criação de alimento
  transaction.request.body = JSON.stringify({
    name: 'Maçã',
    servingSize: 100,
    servingUnit: 'g',
    calories: 52,
    protein: 0.3,
    carbohydrates: 14,
    fat: 0.2,
  });
});

// Hook para criar dados necessários antes dos testes de pacientes
hooks.before('POST /patients > 201', (transaction) => {
  // Dados de exemplo para criação de paciente
  transaction.request.body = JSON.stringify({
    name: 'João Silva',
    email: 'joao@example.com',
    phone: '11999999999',
    birthDate: '1990-01-01',
    gender: 'M',
    height: 175,
    weight: 70,
  });
});

// Hook para criar dados necessários antes dos testes de planos alimentares
hooks.before('POST /meal-plans > 201', (transaction) => {
  // Dados de exemplo para criação de plano alimentar
  transaction.request.body = JSON.stringify({
    patientId: EXAMPLE_IDS.patient,
    title: 'Plano Semanal',
    startDate: '2024-03-20',
    endDate: '2024-03-27',
    goal: 'Perda de peso',
    observations: 'Plano inicial',
  });
});
