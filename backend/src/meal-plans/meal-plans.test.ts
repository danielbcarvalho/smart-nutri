import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { MealPlansService } from './meal-plans.service';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { MealPlan } from './entities/meal-plan.entity';
import { PatientsService } from '../patients/patients.service';
import { CreatePatientDto } from '../patients/dto/create-patient.dto';
import { Gender } from '../patients/enums/gender.enum';
import { FoodsService } from '../foods/foods.service';
import { CreateFoodDto } from '../foods/dto/create-food.dto';

describe('MealPlansController (e2e)', () => {
  let app: INestApplication;
  let mealPlansService: MealPlansService;
  let patientsService: PatientsService;
  let foodsService: FoodsService;
  let patientId: string;
  let foodId: string;

  const mockNutritionistId = '123e4567-e89b-12d3-a456-426614174000';

  beforeAll(async () => {
    jest.setTimeout(10000);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Obter os serviços após a inicialização do app
    mealPlansService = app.get<MealPlansService>(MealPlansService);
    patientsService = app.get<PatientsService>(PatientsService);
    foodsService = app.get<FoodsService>(FoodsService);

    // Criar paciente de teste
    const createPatientDto: CreatePatientDto = {
      name: 'Test Patient for Meal Plans',
      email: 'mealplans@example.com',
      phone: '1234567890',
      birthDate: '1990-01-01',
      gender: Gender.MALE,
      height: 170,
      weight: 70,
      goals: ['Perda de peso', 'Ganho de massa muscular'],
      allergies: ['none'],
      healthConditions: ['none'],
      medications: ['none'],
      observations: 'Test observations',
      cpf: '12345678900',
      nutritionistId: mockNutritionistId,
    };
    const patient = await patientsService.create(
      createPatientDto,
      mockNutritionistId,
    );
    patientId = patient.id;

    // Criar alimento de teste
    const createFoodDto: CreateFoodDto = {
      name: 'Test Food',
      fatsecretId: '123456',
      servingSize: 100,
      servingUnit: 'g',
      calories: 100,
      protein: 10,
      carbohydrates: 20,
      fat: 5,
      categories: ['test'],
    };
    const food = await foodsService.create(createFoodDto);
    foodId = food.id;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('GET /meal-plans', () => {
    it('should return an array of meal plans', async () => {
      const response = await request(app.getHttpServer())
        .get('/meal-plans')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /meal-plans', () => {
    it('should create a new meal plan', async () => {
      const createMealPlanDto: CreateMealPlanDto = {
        patientId,
        name: 'Plano Semanal',
        startDate: '2024-04-06',
        endDate: '2024-04-12',
        nutritionistId: mockNutritionistId,
        meals: [
          {
            name: 'Café da manhã',
            time: '08:00',
            mealFoods: [
              {
                foodId,
                amount: 1,
                unit: 'g',
              },
            ],
          },
          {
            name: 'Almoço',
            time: '12:00',
            mealFoods: [
              {
                foodId,
                amount: 2,
                unit: 'g',
              },
            ],
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/meal-plans')
        .send(createMealPlanDto)
        .expect(201);

      const mealPlan = response.body as MealPlan;
      expect(mealPlan).toHaveProperty('id');
      expect(mealPlan.patientId).toBe(patientId);
      expect(mealPlan.meals.length).toBe(2);
      expect(mealPlan.meals[0].mealFoods.length).toBe(1);
      expect(mealPlan.meals[1].mealFoods.length).toBe(1);
    });
  });

  describe('GET /meal-plans/:id', () => {
    let mealPlanId: string;

    beforeAll(async () => {
      const createMealPlanDto: CreateMealPlanDto = {
        patientId,
        name: 'Plano Semanal',
        startDate: '2024-04-06',
        endDate: '2024-04-12',
        nutritionistId: mockNutritionistId,
        meals: [
          {
            name: 'Café da manhã',
            time: '08:00',
            mealFoods: [
              {
                foodId,
                amount: 1,
                unit: 'g',
              },
            ],
          },
        ],
      };

      const mealPlan = await mealPlansService.create(
        createMealPlanDto,
        mockNutritionistId,
      );
      mealPlanId = mealPlan.id;
    });

    it('should return a meal plan by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/meal-plans/${mealPlanId}`)
        .expect(200);

      const mealPlan = response.body as MealPlan;
      expect(mealPlan).toHaveProperty('id', mealPlanId);
      expect(mealPlan.patientId).toBe(patientId);
      expect(mealPlan.meals.length).toBe(1);
    });

    it('should return 404 for non-existent meal plan', async () => {
      await request(app.getHttpServer())
        .get('/meal-plans/123e4567-e89b-12d3-a456-426614174000')
        .expect(404);
    });
  });

  describe('PATCH /meal-plans/:id', () => {
    let mealPlanId: string;

    beforeAll(async () => {
      const createMealPlanDto: CreateMealPlanDto = {
        patientId,
        name: 'Plano Semanal',
        startDate: '2024-04-06',
        endDate: '2024-04-12',
        nutritionistId: mockNutritionistId,
        meals: [
          {
            name: 'Café da manhã',
            time: '08:00',
            mealFoods: [
              {
                foodId,
                amount: 1,
                unit: 'g',
              },
            ],
          },
        ],
      };

      const mealPlan = await mealPlansService.create(
        createMealPlanDto,
        mockNutritionistId,
      );
      mealPlanId = mealPlan.id;
    });

    it('should update a meal plan', async () => {
      const updateMealPlanDto = {
        meals: [
          {
            name: 'Café da manhã atualizado',
            time: '09:00',
            mealFoods: [
              {
                foodId,
                amount: 2,
                unit: 'g',
              },
            ],
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .patch(`/meal-plans/${mealPlanId}`)
        .send(updateMealPlanDto)
        .expect(200);

      const mealPlan = response.body as MealPlan;
      expect(mealPlan.meals[0].name).toBe('Café da manhã atualizado');
      expect(mealPlan.meals[0].time).toBe('09:00');
      expect(mealPlan.meals[0].mealFoods[0].amount).toBe(2);
    });
  });

  describe('DELETE /meal-plans/:id', () => {
    let mealPlanId: string;

    beforeAll(async () => {
      const createMealPlanDto: CreateMealPlanDto = {
        patientId,
        name: 'Plano Semanal',
        startDate: '2024-04-06',
        endDate: '2024-04-12',
        nutritionistId: mockNutritionistId,
        meals: [
          {
            name: 'Café da manhã',
            time: '08:00',
            mealFoods: [
              {
                foodId,
                amount: 1,
                unit: 'g',
              },
            ],
          },
        ],
      };

      const mealPlan = await mealPlansService.create(
        createMealPlanDto,
        mockNutritionistId,
      );
      mealPlanId = mealPlan.id;
    });

    it('should delete a meal plan', async () => {
      await request(app.getHttpServer())
        .delete(`/meal-plans/${mealPlanId}`)
        .expect(204);

      // Verify meal plan was deleted
      await request(app.getHttpServer())
        .get(`/meal-plans/${mealPlanId}`)
        .expect(404);
    });
  });

  describe('GET /meal-plans/patient/:patientId', () => {
    beforeAll(async () => {
      // Create multiple meal plans for the test patient
      const createMealPlanDto1: CreateMealPlanDto = {
        patientId,
        name: 'Plano Semanal 1',
        startDate: '2024-04-06',
        endDate: '2024-04-12',
        nutritionistId: mockNutritionistId,
        meals: [
          {
            name: 'Café da manhã',
            time: '08:00',
            mealFoods: [
              {
                foodId,
                amount: 1,
                unit: 'g',
              },
            ],
          },
        ],
      };

      const createMealPlanDto2: CreateMealPlanDto = {
        patientId,
        name: 'Plano Semanal 2',
        startDate: '2024-04-13',
        endDate: '2024-04-19',
        nutritionistId: mockNutritionistId,
        meals: [
          {
            name: 'Café da manhã',
            time: '08:00',
            mealFoods: [
              {
                foodId,
                amount: 1,
                unit: 'g',
              },
            ],
          },
        ],
      };

      await mealPlansService.create(createMealPlanDto1, mockNutritionistId);
      await mealPlansService.create(createMealPlanDto2, mockNutritionistId);
    });

    it('should return all meal plans for a patient', async () => {
      const response = await request(app.getHttpServer())
        .get(`/meal-plans/patient/${patientId}`)
        .expect(200);

      const mealPlans = response.body as MealPlan[];
      expect(Array.isArray(mealPlans)).toBe(true);
      expect(mealPlans.length).toBeGreaterThan(1);
      expect(mealPlans.every((plan) => plan.patientId === patientId)).toBe(
        true,
      );
    });

    it('should return empty array for non-existent patient', async () => {
      const response = await request(app.getHttpServer())
        .get('/meal-plans/patient/123e4567-e89b-12d3-a456-426614174000')
        .expect(200);

      const mealPlans = response.body as MealPlan[];
      expect(Array.isArray(mealPlans)).toBe(true);
      expect(mealPlans.length).toBe(0);
    });
  });
});
