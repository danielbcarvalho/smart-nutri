import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

interface AuthResponse {
  access_token: string;
  id: string;
}

interface PatientResponse {
  id: string;
  name: string;
  email: string;
  cpf: string;
  nutritionistId: string;
  createdAt: string;
  updatedAt: string;
}

interface MealFoodResponse {
  id: string;
  foodId: string;
  quantity: number;
  unit: string;
  createdAt: string;
  updatedAt: string;
}

interface MealResponse {
  id: string;
  name: string;
  time: string;
  notes: string;
  mealFoods: MealFoodResponse[];
  mealPlanId: string;
  createdAt: string;
  updatedAt: string;
}

interface MealPlanResponse {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  notes: string;
  patientId: string;
  nutritionistId: string;
  meals: MealResponse[];
  createdAt: string;
  updatedAt: string;
}

interface MealFood {
  foodId: string;
  quantity: number;
  unit: string;
}

interface Meal {
  name: string;
  time: string;
  notes: string;
  mealFoods: MealFood[];
}

interface MealPlan {
  name: string;
  startDate: string;
  endDate: string;
  notes: string;
  patientId: string;
  nutritionistId: string;
  meals: Meal[];
}

describe('MealPlans (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let nutritionistId: string;
  let patientId: string;

  const mockNutritionist = {
    name: 'Test Nutritionist',
    email: 'test@nutritionist.com',
    password: 'test123',
    crn: '12345',
  };

  const mockPatient = {
    name: 'Test Patient',
    email: 'test@patient.com',
    cpf: '12345678901',
    nutritionistId: '',
  };

  const mockMealPlan: MealPlan = {
    name: 'Test Meal Plan',
    startDate: '2024-04-07',
    endDate: '2024-04-14',
    notes: 'Test notes',
    patientId: '',
    nutritionistId: '',
    meals: [
      {
        name: 'Breakfast',
        time: '08:00',
        notes: 'Test meal notes',
        mealFoods: [
          {
            foodId: '123e4567-e89b-12d3-a456-426614174000',
            quantity: 100,
            unit: 'g',
          },
        ],
      },
    ],
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Create nutritionist
    const nutritionistResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send(mockNutritionist)
      .expect(201);

    const nutritionistData = nutritionistResponse.body as AuthResponse;
    nutritionistId = nutritionistData.id;

    // Login
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: mockNutritionist.email,
        password: mockNutritionist.password,
      })
      .expect(200);

    const loginData = loginResponse.body as AuthResponse;
    authToken = loginData.access_token;

    // Create patient
    mockPatient.nutritionistId = nutritionistId;
    const patientResponse = await request(app.getHttpServer())
      .post('/patients')
      .set('Authorization', `Bearer ${authToken}`)
      .send(mockPatient)
      .expect(201);

    const patientData = patientResponse.body as PatientResponse;
    patientId = patientData.id;
    mockMealPlan.patientId = patientId;
    mockMealPlan.nutritionistId = nutritionistId;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/meal-plans (POST) should create a meal plan', async () => {
    const response = await request(app.getHttpServer())
      .post('/meal-plans')
      .set('Authorization', `Bearer ${authToken}`)
      .send(mockMealPlan)
      .expect(201);

    const mealPlan = response.body as MealPlanResponse;
    expect(mealPlan).toHaveProperty('id');
    expect(mealPlan.name).toBe(mockMealPlan.name);
    expect(mealPlan.patientId).toBe(patientId);
    expect(mealPlan.nutritionistId).toBe(nutritionistId);
  });

  it('/meal-plans (POST) should return 404 when patient does not exist', async () => {
    const invalidMealPlan = {
      ...mockMealPlan,
      patientId: '123e4567-e89b-12d3-a456-426614174000',
    };

    await request(app.getHttpServer())
      .post('/meal-plans')
      .set('Authorization', `Bearer ${authToken}`)
      .send(invalidMealPlan)
      .expect(404);
  });

  it('/meal-plans (GET) should get all meal plans', async () => {
    const response = await request(app.getHttpServer())
      .get('/meal-plans')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    const mealPlans = response.body as MealPlanResponse[];
    expect(Array.isArray(mealPlans)).toBe(true);
    expect(mealPlans.length).toBeGreaterThan(0);
  });

  it('/meal-plans/patient/:patientId (GET) should get meal plans by patient', async () => {
    const response = await request(app.getHttpServer())
      .get(`/meal-plans/patient/${patientId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    const mealPlans = response.body as MealPlanResponse[];
    expect(Array.isArray(mealPlans)).toBe(true);
    expect(mealPlans.length).toBeGreaterThan(0);
    expect(mealPlans[0].patientId).toBe(patientId);
  });

  it('/meal-plans/:id (GET) should get a meal plan by id', async () => {
    // First, create a meal plan
    const createResponse = await request(app.getHttpServer())
      .post('/meal-plans')
      .set('Authorization', `Bearer ${authToken}`)
      .send(mockMealPlan)
      .expect(201);

    const createdMealPlan = createResponse.body as MealPlanResponse;
    const mealPlanId = createdMealPlan.id;

    // Then, get it by id
    const response = await request(app.getHttpServer())
      .get(`/meal-plans/${mealPlanId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    const mealPlan = response.body as MealPlanResponse;
    expect(mealPlan.id).toBe(mealPlanId);
    expect(mealPlan.name).toBe(mockMealPlan.name);
    expect(mealPlan.patientId).toBe(patientId);
  });

  it('/meal-plans/:id (PATCH) should update a meal plan', async () => {
    // First, create a meal plan
    const createResponse = await request(app.getHttpServer())
      .post('/meal-plans')
      .set('Authorization', `Bearer ${authToken}`)
      .send(mockMealPlan)
      .expect(201);

    const createdMealPlan = createResponse.body as MealPlanResponse;
    const mealPlanId = createdMealPlan.id;
    const updatedName = 'Updated Meal Plan';

    // Then, update it
    const response = await request(app.getHttpServer())
      .patch(`/meal-plans/${mealPlanId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: updatedName })
      .expect(200);

    const updatedMealPlan = response.body as MealPlanResponse;
    expect(updatedMealPlan.id).toBe(mealPlanId);
    expect(updatedMealPlan.name).toBe(updatedName);
  });

  it('/meal-plans/:id (DELETE) should delete a meal plan', async () => {
    // First, create a meal plan
    const createResponse = await request(app.getHttpServer())
      .post('/meal-plans')
      .set('Authorization', `Bearer ${authToken}`)
      .send(mockMealPlan)
      .expect(201);

    const createdMealPlan = createResponse.body as MealPlanResponse;
    const mealPlanId = createdMealPlan.id;

    // Then, delete it
    await request(app.getHttpServer())
      .delete(`/meal-plans/${mealPlanId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    // Finally, verify it's gone
    await request(app.getHttpServer())
      .get(`/meal-plans/${mealPlanId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);
  });

  it('/meal-plans/:id/meals (POST) should add a meal to a meal plan', async () => {
    // First, create a meal plan
    const createResponse = await request(app.getHttpServer())
      .post('/meal-plans')
      .set('Authorization', `Bearer ${authToken}`)
      .send(mockMealPlan)
      .expect(201);

    const createdMealPlan = createResponse.body as MealPlanResponse;
    const mealPlanId = createdMealPlan.id;

    // Then, add a meal to it
    const mockMeal = mockMealPlan.meals[0];
    const response = await request(app.getHttpServer())
      .post(`/meal-plans/${mealPlanId}/meals`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(mockMeal)
      .expect(201);

    const meal = response.body as MealResponse;
    expect(meal).toHaveProperty('id');
    expect(meal.name).toBe(mockMeal.name);
    expect(meal.time).toBe(mockMeal.time);
  });

  it('/meal-plans/:id/meals (GET) should get all meals for a meal plan', async () => {
    // First, create a meal plan
    const createResponse = await request(app.getHttpServer())
      .post('/meal-plans')
      .set('Authorization', `Bearer ${authToken}`)
      .send(mockMealPlan)
      .expect(201);

    const createdMealPlan = createResponse.body as MealPlanResponse;
    const mealPlanId = createdMealPlan.id;

    // Then, get its meals
    const response = await request(app.getHttpServer())
      .get(`/meal-plans/${mealPlanId}/meals`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    const meals = response.body as MealResponse[];
    expect(Array.isArray(meals)).toBe(true);
    expect(meals.length).toBeGreaterThan(0);
    expect(meals[0].name).toBe(mockMealPlan.meals[0].name);
  });
});
