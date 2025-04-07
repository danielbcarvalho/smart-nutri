import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealPlan } from '../src/meal-plans/entities/meal-plan.entity';
import { Meal } from '../src/meal-plans/entities/meal.entity';
import { MealFood } from '../src/meal-plans/entities/meal-food.entity';
import { Patient } from '../src/patients/entities/patient.entity';
import { Food } from '../src/foods/entities/food.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterAll,
} from '@jest/globals';
import { Gender } from '../src/patients/enums/gender.enum';
import { v4 as uuidv4 } from 'uuid';

// Define response types
interface MealPlanResponse {
  id: string;
  name: string;
  patientId: string;
  startDate: string;
  endDate: string;
  notes?: string;
  meals: MealResponse[];
  createdAt: string;
  updatedAt: string;
}

interface MealResponse {
  id: string;
  name: string;
  time: string;
  notes?: string;
  mealPlan: {
    id: string;
  };
  mealFoods: MealFoodResponse[];
  createdAt: string;
  updatedAt: string;
}

interface MealFoodResponse {
  id: string;
  food: {
    id: string;
    name: string;
    servingSize: number;
    servingUnit: string;
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
  };
  amount: number;
  unit: string;
  createdAt: string;
  updatedAt: string;
}

describe('MealPlansController (e2e)', () => {
  let app: INestApplication;
  let mealPlanRepository: Repository<MealPlan>;
  let mealRepository: Repository<Meal>;
  let mealFoodRepository: Repository<MealFood>;
  let patientRepository: Repository<Patient>;
  let foodRepository: Repository<Food>;

  const mockPatient = {
    name: 'Test Patient',
    email: 'test@example.com',
    phone: '1234567890',
    birthDate: new Date('1990-01-01'),
    gender: Gender.MALE,
    height: 1.75,
    weight: 70,
  };

  const mockFood = {
    name: 'Test Food',
    externalId: '123456',
    servingSize: 100,
    servingUnit: 'g',
    calories: 100,
    protein: 10,
    carbohydrates: 20,
    fat: 5,
    categories: ['Test'],
  };

  const createMockMealPlan = (patient: Patient): Partial<MealPlan> => {
    const mealFoods = [
      {
        food: mockFood,
        amount: 100,
        unit: 'g',
      },
    ];

    const meals = [
      {
        id: uuidv4(),
        name: 'Test Meal',
        time: '08:00',
        notes: 'Test meal notes',
        mealFoods,
        mealPlan: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return {
      name: 'Test Plan',
      startDate: new Date('2024-03-20'),
      endDate: new Date('2024-03-27'),
      notes: 'Test notes',
      patient,
      patientId: patient.id,
      meals,
    };
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forFeature([MealPlan, Meal, MealFood, Patient, Food]),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    mealPlanRepository = moduleFixture.get<Repository<MealPlan>>(
      getRepositoryToken(MealPlan),
    );
    mealRepository = moduleFixture.get<Repository<Meal>>(
      getRepositoryToken(Meal),
    );
    mealFoodRepository = moduleFixture.get<Repository<MealFood>>(
      getRepositoryToken(MealFood),
    );
    patientRepository = moduleFixture.get<Repository<Patient>>(
      getRepositoryToken(Patient),
    );
    foodRepository = moduleFixture.get<Repository<Food>>(
      getRepositoryToken(Food),
    );

    await app.init();
  });

  beforeEach(async () => {
    await mealFoodRepository.delete({});
    await mealRepository.delete({});
    await mealPlanRepository.delete({});
    await patientRepository.delete({});
    await foodRepository.delete({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/meal-plans (POST)', () => {
    it('should create a meal plan', async () => {
      const patient = await patientRepository.save(mockPatient as Patient);
      const food = await foodRepository.save(mockFood as Food);
      const mockMealPlan = createMockMealPlan(patient);
      mockMealPlan.meals![0].mealFoods[0].food = food;

      const response = await request(app.getHttpServer())
        .post('/meal-plans')
        .send({
          ...mockMealPlan,
          patientId: patient.id,
        })
        .expect(201);

      const responseBody = response.body as MealPlanResponse;
      expect(responseBody).toHaveProperty('id');
      expect(responseBody.name).toBe(mockMealPlan.name);
      expect(responseBody.patientId).toBe(patient.id);
      expect(responseBody.meals).toHaveLength(1);
    });

    it('should fail when patient does not exist', async () => {
      const nonExistentId = uuidv4();
      const patient = await patientRepository.save(mockPatient as Patient);
      const food = await foodRepository.save(mockFood as Food);
      const mockMealPlan = createMockMealPlan(patient);
      mockMealPlan.meals![0].mealFoods[0].food = food;

      await request(app.getHttpServer())
        .post('/meal-plans')
        .send({
          ...mockMealPlan,
          patientId: nonExistentId,
        })
        .expect(404);
    });
  });

  describe('/meal-plans (GET)', () => {
    it('should return all meal plans', async () => {
      const patient = await patientRepository.save(mockPatient as Patient);
      const food = await foodRepository.save(mockFood as Food);
      const mockMealPlan = createMockMealPlan(patient);
      mockMealPlan.meals![0].mealFoods[0].food = food;
      await mealPlanRepository.save(mockMealPlan as MealPlan);

      const response = await request(app.getHttpServer())
        .get('/meal-plans')
        .expect(200);

      const responseBody = response.body as MealPlanResponse[];
      expect(Array.isArray(responseBody)).toBe(true);
      expect(responseBody).toHaveLength(1);
      expect(responseBody[0].name).toBe(mockMealPlan.name);
    });
  });

  describe('/meal-plans/patient/:patientId (GET)', () => {
    it('should return meal plans for a patient', async () => {
      const patient = await patientRepository.save(mockPatient as Patient);
      const food = await foodRepository.save(mockFood as Food);
      const mockMealPlan = createMockMealPlan(patient);
      mockMealPlan.meals![0].mealFoods[0].food = food;
      await mealPlanRepository.save(mockMealPlan as MealPlan);

      const response = await request(app.getHttpServer())
        .get(`/meal-plans/patient/${patient.id}`)
        .expect(200);

      const responseBody = response.body as MealPlanResponse[];
      expect(Array.isArray(responseBody)).toBe(true);
      expect(responseBody).toHaveLength(1);
      expect(responseBody[0].name).toBe(mockMealPlan.name);
      expect(responseBody[0].patientId).toBe(patient.id);
    });

    it('should return empty array when patient has no meal plans', async () => {
      const patient = await patientRepository.save(mockPatient as Patient);

      const response = await request(app.getHttpServer())
        .get(`/meal-plans/patient/${patient.id}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('/meal-plans/:id (GET)', () => {
    it('should return a meal plan', async () => {
      const patient = await patientRepository.save(mockPatient as Patient);
      const food = await foodRepository.save(mockFood as Food);
      const mockMealPlan = createMockMealPlan(patient);
      mockMealPlan.meals![0].mealFoods[0].food = food;
      const mealPlan = await mealPlanRepository.save(mockMealPlan as MealPlan);

      const response = await request(app.getHttpServer())
        .get(`/meal-plans/${mealPlan.id}`)
        .expect(200);

      const responseBody = response.body as MealPlanResponse;
      expect(responseBody.id).toBe(mealPlan.id);
      expect(responseBody.name).toBe(mockMealPlan.name);
    });

    it('should return 404 when meal plan does not exist', async () => {
      const nonExistentId = uuidv4();
      await request(app.getHttpServer())
        .get(`/meal-plans/${nonExistentId}`)
        .expect(404);
    });
  });

  describe('/meal-plans/:id (PATCH)', () => {
    it('should update a meal plan', async () => {
      const patient = await patientRepository.save(mockPatient as Patient);
      const food = await foodRepository.save(mockFood as Food);
      const mockMealPlan = createMockMealPlan(patient);
      mockMealPlan.meals![0].mealFoods[0].food = food;
      const mealPlan = await mealPlanRepository.save(mockMealPlan as MealPlan);

      const updateData = {
        name: 'Updated Plan',
      };

      const response = await request(app.getHttpServer())
        .patch(`/meal-plans/${mealPlan.id}`)
        .send(updateData)
        .expect(200);

      const responseBody = response.body as MealPlanResponse;
      expect(responseBody.id).toBe(mealPlan.id);
      expect(responseBody.name).toBe(updateData.name);
    });
  });

  describe('/meal-plans/:id (DELETE)', () => {
    it('should delete a meal plan', async () => {
      const patient = await patientRepository.save(mockPatient as Patient);
      const food = await foodRepository.save(mockFood as Food);
      const mockMealPlan = createMockMealPlan(patient);
      mockMealPlan.meals![0].mealFoods[0].food = food;
      const mealPlan = await mealPlanRepository.save(mockMealPlan as MealPlan);

      await request(app.getHttpServer())
        .delete(`/meal-plans/${mealPlan.id}`)
        .expect(204);

      const deletedMealPlan = await mealPlanRepository.findOne({
        where: { id: mealPlan.id },
      });
      expect(deletedMealPlan).toBeNull();
    });
  });

  describe('/meal-plans/:id/meals (POST)', () => {
    it('should add a meal to a meal plan', async () => {
      const patient = await patientRepository.save(mockPatient as Patient);
      const food = await foodRepository.save(mockFood as Food);
      const mockMealPlan = createMockMealPlan(patient);
      mockMealPlan.meals![0].mealFoods[0].food = food;
      const mealPlan = await mealPlanRepository.save(mockMealPlan as MealPlan);

      const response = await request(app.getHttpServer())
        .post(`/meal-plans/${mealPlan.id}/meals`)
        .send(mockMealPlan.meals![0])
        .expect(201);

      const responseBody = response.body as MealResponse;
      expect(responseBody).toHaveProperty('id');
      expect(responseBody.name).toBe(mockMealPlan.meals![0].name);
      expect(responseBody.time).toBe(mockMealPlan.meals![0].time);
      expect(responseBody.mealPlan.id).toBe(mealPlan.id);
    });

    it('should fail when meal plan does not exist', async () => {
      const nonExistentId = uuidv4();
      const patient = await patientRepository.save(mockPatient as Patient);
      const food = await foodRepository.save(mockFood as Food);
      const mockMealPlan = createMockMealPlan(patient);
      mockMealPlan.meals![0].mealFoods[0].food = food;

      await request(app.getHttpServer())
        .post(`/meal-plans/${nonExistentId}/meals`)
        .send(mockMealPlan.meals![0])
        .expect(404);
    });
  });
});
