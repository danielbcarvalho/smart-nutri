import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { FoodsService } from './foods.service';
import { CreateFoodDto } from './dto/create-food.dto';
import { Food } from './entities/food.entity';
import { AppModule } from '../../app.module';

describe('FoodsController (e2e)', () => {
  let app: INestApplication;
  let foodsService: FoodsService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    foodsService = app.get<FoodsService>(FoodsService);
  }, 10000); // Aumentando o timeout para 10 segundos

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('GET /foods', () => {
    it('should return an array of foods', async () => {
      const response = await request(app.getHttpServer())
        .get('/foods')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /foods', () => {
    it('should create a new food', async () => {
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

      const response = await request(app.getHttpServer())
        .post('/foods')
        .send(createFoodDto)
        .expect(201);

      const food = response.body as Food;
      expect(food).toHaveProperty('id');
      expect(food.name).toBe(createFoodDto.name);
      expect(food.calories).toBe(createFoodDto.calories);
    });
  });

  describe('GET /foods/:id', () => {
    let foodId: string;

    beforeEach(async () => {
      const createFoodDto: CreateFoodDto = {
        name: 'Test Food for Get',
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

    it('should return a food by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/foods/${foodId}`)
        .expect(200);

      const food = response.body as Food;
      expect(food).toHaveProperty('id', foodId);
      expect(food.name).toBe('Test Food for Get');
    });

    it('should return 404 for non-existent food', async () => {
      await request(app.getHttpServer())
        .get('/foods/123e4567-e89b-12d3-a456-426614174000')
        .expect(404);
    });
  });

  describe('PATCH /foods/:id', () => {
    let foodId: string;

    beforeEach(async () => {
      const createFoodDto: CreateFoodDto = {
        name: 'Test Food for Update',
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

    it('should update a food', async () => {
      const updateFoodDto = {
        name: 'Updated Test Food',
        calories: 150,
      };

      const response = await request(app.getHttpServer())
        .patch(`/foods/${foodId}`)
        .send(updateFoodDto)
        .expect(200);

      const food = response.body as Food;
      expect(food.name).toBe(updateFoodDto.name);
      expect(food.calories).toBe(updateFoodDto.calories);
    });
  });

  describe('DELETE /foods/:id', () => {
    let foodId: string;

    beforeEach(async () => {
      const createFoodDto: CreateFoodDto = {
        name: 'Test Food for Delete',
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

    it('should delete a food', async () => {
      await request(app.getHttpServer()).delete(`/foods/${foodId}`).expect(204);

      // Verify food was deleted
      await request(app.getHttpServer()).get(`/foods/${foodId}`).expect(404);
    });
  });
});
