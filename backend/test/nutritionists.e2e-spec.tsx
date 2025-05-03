import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { v4 as uuidv4 } from 'uuid';
import { Nutritionist } from '../src/modules/nutritionists/entities/nutritionist.entity';

describe('NutritionistsController (e2e)', () => {
  let app: INestApplication;
  let nutritionistRepository: Repository<Nutritionist>;

  const mockNutritionist = {
    name: 'Test Nutritionist',
    email: 'test@example.com',
    password: 'password123',
    phone: '11999999999',
    crn: 'CRN/SP 12345',
    specialties: ['Esportiva', 'Clínica'],
    clinicName: 'Test Clinic',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TypeOrmModule.forFeature([Nutritionist])],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    nutritionistRepository = moduleFixture.get<Repository<Nutritionist>>(
      getRepositoryToken(Nutritionist),
    );

    await app.init();
  });

  beforeEach(async () => {
    await nutritionistRepository.delete({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/nutritionists (POST)', () => {
    it('should create a nutritionist', async () => {
      const response = await request(app.getHttpServer())
        .post('/nutritionists')
        .send(mockNutritionist)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(mockNutritionist.name);
      expect(response.body.email).toBe(mockNutritionist.email);
      expect(response.body).not.toHaveProperty('password');
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('should fail when email already exists', async () => {
      await nutritionistRepository.save({
        ...mockNutritionist,
        passwordHash: 'hashed_password',
      });

      await request(app.getHttpServer())
        .post('/nutritionists')
        .send(mockNutritionist)
        .expect(409);
    });

    it('should fail when required fields are missing', async () => {
      const invalidNutritionist = {
        name: 'Test Nutritionist',
        // email missing
        password: 'password123',
      };

      await request(app.getHttpServer())
        .post('/nutritionists')
        .send(invalidNutritionist)
        .expect(400);
    });
  });

  describe('/nutritionists (GET)', () => {
    it('should return an array of nutritionists', async () => {
      await nutritionistRepository.save({
        ...mockNutritionist,
        passwordHash: 'hashed_password',
      });

      const response = await request(app.getHttpServer())
        .get('/nutritionists')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe(mockNutritionist.name);
      expect(response.body[0].email).toBe(mockNutritionist.email);
      expect(response.body[0]).not.toHaveProperty('password');
      expect(response.body[0]).not.toHaveProperty('passwordHash');
    });
  });

  describe('/nutritionists/:id (GET)', () => {
    it('should return a nutritionist', async () => {
      const savedNutritionist = await nutritionistRepository.save({
        ...mockNutritionist,
        passwordHash: 'hashed_password',
      });

      const response = await request(app.getHttpServer())
        .get(`/nutritionists/${savedNutritionist.id}`)
        .expect(200);

      expect(response.body.id).toBe(savedNutritionist.id);
      expect(response.body.name).toBe(mockNutritionist.name);
      expect(response.body.email).toBe(mockNutritionist.email);
      expect(response.body).not.toHaveProperty('password');
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('should return 404 when nutritionist does not exist', async () => {
      const nonExistentId = uuidv4();
      await request(app.getHttpServer())
        .get(`/nutritionists/${nonExistentId}`)
        .expect(404);
    });
  });

  describe('/nutritionists/:id (PATCH)', () => {
    it('should update a nutritionist', async () => {
      const savedNutritionist = await nutritionistRepository.save({
        ...mockNutritionist,
        passwordHash: 'hashed_password',
      });

      const updateData = {
        name: 'Updated Name',
        specialties: ['Clínica', 'Pediatria'],
      };

      const response = await request(app.getHttpServer())
        .patch(`/nutritionists/${savedNutritionist.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.id).toBe(savedNutritionist.id);
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.specialties).toEqual(updateData.specialties);
    });

    it('should fail when updating to existing email', async () => {
      const savedNutritionist = await nutritionistRepository.save({
        ...mockNutritionist,
        passwordHash: 'hashed_password',
      });

      const secondNutritionist = await nutritionistRepository.save({
        ...mockNutritionist,
        email: 'second@example.com',
        passwordHash: 'hashed_password',
      });

      await request(app.getHttpServer())
        .patch(`/nutritionists/${savedNutritionist.id}`)
        .send({ email: secondNutritionist.email })
        .expect(409);
    });

    it('should return 404 when nutritionist does not exist', async () => {
      const nonExistentId = uuidv4();
      await request(app.getHttpServer())
        .patch(`/nutritionists/${nonExistentId}`)
        .send({ name: 'Updated Name' })
        .expect(404);
    });
  });

  describe('/nutritionists/:id (DELETE)', () => {
    it('should delete a nutritionist', async () => {
      const savedNutritionist = await nutritionistRepository.save({
        ...mockNutritionist,
        passwordHash: 'hashed_password',
      });

      await request(app.getHttpServer())
        .delete(`/nutritionists/${savedNutritionist.id}`)
        .expect(204);

      const deletedNutritionist = await nutritionistRepository.findOne({
        where: { id: savedNutritionist.id },
      });
      expect(deletedNutritionist).toBeNull();
    });

    it('should return 404 when nutritionist does not exist', async () => {
      const nonExistentId = uuidv4();
      await request(app.getHttpServer())
        .delete(`/nutritionists/${nonExistentId}`)
        .expect(404);
    });
  });
});
