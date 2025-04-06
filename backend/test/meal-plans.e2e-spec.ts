import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealPlan } from '../src/meal-plans/entities/meal-plan.entity';
import { Meal } from '../src/meal-plans/entities/meal.entity';
import { MealFood } from '../src/meal-plans/entities/meal-food.entity';
import { Patient } from '../src/patients/entities/patient.entity';
import { Repository } from 'typeorm';

describe('MealPlansController (e2e)', () => {
  let app: INestApplication;
  let mealPlanRepository: Repository<MealPlan>;
  let mealRepository: Repository<Meal>;
  let mealFoodRepository: Repository<MealFood>;
  let patientRepository: Repository<Patient>;

  const mockPatient = {
    name: 'Test Patient',
    email: 'test@example.com',
    phone: '1234567890',
    birthDate: new Date('1990-01-01'),
    gender: 'M',
    height: 1.75,
    weight: 70,
  };

  const mockMealPlan = {
    name: 'Test Plan',
    startDate: new Date('2024-03-20'),
    endDate: new Date('2024-03-27'),
    notes: 'Test notes',
  };

  const mockMeal = {
    name: 'Test Meal',
    time: '08:00',
    mealFoods: [],
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forFeature([MealPlan, Meal, MealFood, Patient]),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
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

    await app.init();
  });

  beforeEach(async () => {
    await mealFoodRepository.delete({});
    await mealRepository.delete({});
    await mealPlanRepository.delete({});
    await patientRepository.delete({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/meal-plans (POST)', () => {
    it('should create a meal plan', async () => {
      const patient = await patientRepository.save(mockPatient);

      const response = await request(app.getHttpServer())
        .post('/meal-plans')
        .send({
          ...mockMealPlan,
          patientId: patient.id,
          meals: [mockMeal],
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(mockMealPlan.name);
      expect(response.body.patientId).toBe(patient.id);
      expect(response.body.meals).toHaveLength(1);
    });

    it('should fail when patient does not exist', async () => {
      await request(app.getHttpServer())
        .post('/meal-plans')
        .send({
          ...mockMealPlan,
          patientId: 'non-existent-id',
          meals: [mockMeal],
        })
        .expect(404);
    });
  });

  describe('/meal-plans (GET)', () => {
    it('should return all meal plans', async () => {
      const patient = await patientRepository.save(mockPatient);
      await mealPlanRepository.save({
        ...mockMealPlan,
        patient,
      });

      const response = await request(app.getHttpServer())
        .get('/meal-plans')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe(mockMealPlan.name);
    });
  });

  describe('/meal-plans/patient/:patientId (GET)', () => {
    it('should return meal plans for a patient', async () => {
      const patient = await patientRepository.save(mockPatient);
      await mealPlanRepository.save({
        ...mockMealPlan,
        patient,
      });

      const response = await request(app.getHttpServer())
        .get(`/meal-plans/patient/${patient.id}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe(mockMealPlan.name);
      expect(response.body[0].patientId).toBe(patient.id);
    });

    it('should return empty array when patient has no meal plans', async () => {
      const patient = await patientRepository.save(mockPatient);

      const response = await request(app.getHttpServer())
        .get(`/meal-plans/patient/${patient.id}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('/meal-plans/:id (GET)', () => {
    it('should return a meal plan', async () => {
      const patient = await patientRepository.save(mockPatient);
      const mealPlan = await mealPlanRepository.save({
        ...mockMealPlan,
        patient,
      });

      const response = await request(app.getHttpServer())
        .get(`/meal-plans/${mealPlan.id}`)
        .expect(200);

      expect(response.body.id).toBe(mealPlan.id);
      expect(response.body.name).toBe(mockMealPlan.name);
    });

    it('should return 404 when meal plan does not exist', async () => {
      await request(app.getHttpServer())
        .get('/meal-plans/non-existent-id')
        .expect(404);
    });
  });

  describe('/meal-plans/:id (PATCH)', () => {
    it('should update a meal plan', async () => {
      const patient = await patientRepository.save(mockPatient);
      const mealPlan = await mealPlanRepository.save({
        ...mockMealPlan,
        patient,
      });

      const updateData = {
        name: 'Updated Plan',
      };

      const response = await request(app.getHttpServer())
        .patch(`/meal-plans/${mealPlan.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.id).toBe(mealPlan.id);
      expect(response.body.name).toBe(updateData.name);
    });
  });

  describe('/meal-plans/:id (DELETE)', () => {
    it('should delete a meal plan', async () => {
      const patient = await patientRepository.save(mockPatient);
      const mealPlan = await mealPlanRepository.save({
        ...mockMealPlan,
        patient,
      });

      await request(app.getHttpServer())
        .delete(`/meal-plans/${mealPlan.id}`)
        .expect(200);

      const deletedMealPlan = await mealPlanRepository.findOne({
        where: { id: mealPlan.id },
      });
      expect(deletedMealPlan).toBeNull();
    });
  });

  describe('/meal-plans/:id/meals (POST)', () => {
    it('should add a meal to a meal plan', async () => {
      const patient = await patientRepository.save(mockPatient);
      const mealPlan = await mealPlanRepository.save({
        ...mockMealPlan,
        patient,
      });

      const response = await request(app.getHttpServer())
        .post(`/meal-plans/${mealPlan.id}/meals`)
        .send(mockMeal)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(mockMeal.name);
      expect(response.body.time).toBe(mockMeal.time);
      expect(response.body.mealPlanId).toBe(mealPlan.id);
    });

    it('should fail when meal plan does not exist', async () => {
      await request(app.getHttpServer())
        .post('/meal-plans/non-existent-id/meals')
        .send(mockMeal)
        .expect(404);
    });
  });
});
