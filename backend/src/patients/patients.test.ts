import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { Patient } from './entities/patient.entity';
import { Gender } from './enums/gender.enum';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { Measurement } from './entities/measurement.entity';

describe('PatientsController (e2e)', () => {
  let app: INestApplication;
  let patientsService: PatientsService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    patientsService = app.get<PatientsService>(PatientsService);
  }, 10000); // Aumentando o timeout para 10 segundos

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('GET /patients', () => {
    it('should return an array of patients', async () => {
      const response = await request(app.getHttpServer())
        .get('/patients')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /patients', () => {
    it('should create a new patient', async () => {
      const createPatientDto: CreatePatientDto = {
        name: 'Test Patient',
        email: 'test@example.com',
        phone: '1234567890',
        birthDate: new Date('1990-01-01'),
        gender: Gender.MALE,
        height: 170,
        weight: 70,
        goals: ['Perda de peso', 'Ganho de massa muscular'],
        allergies: ['none'],
        healthConditions: ['none'],
        medications: ['none'],
        observations: 'Test observations',
      };

      const response = await request(app.getHttpServer())
        .post('/patients')
        .send(createPatientDto)
        .expect(201);

      const patient = response.body as Patient;
      expect(patient).toHaveProperty('id');
      expect(patient.name).toBe(createPatientDto.name);
      expect(patient.email).toBe(createPatientDto.email);
    });
  });

  describe('GET /patients/:id', () => {
    let patientId: string;

    beforeEach(async () => {
      const createPatientDto: CreatePatientDto = {
        name: 'Test Patient for Get',
        email: 'get@example.com',
        phone: '1234567890',
        birthDate: new Date('1990-01-01'),
        gender: Gender.MALE,
        height: 170,
        weight: 70,
        goals: ['Perda de peso', 'Ganho de massa muscular'],
        allergies: ['none'],
        healthConditions: ['none'],
        medications: ['none'],
        observations: 'Test observations',
      };

      const patient = await patientsService.create(createPatientDto);
      patientId = patient.id;
    });

    it('should return a patient by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/patients/${patientId}`)
        .expect(200);

      const patient = response.body as Patient;
      expect(patient).toHaveProperty('id', patientId);
      expect(patient.name).toBe('Test Patient for Get');
    });
  });

  it('should return 404 for non-existent patient', async () => {
    await request(app.getHttpServer())
      .get('/patients/123e4567-e89b-12d3-a456-426614174000')
      .expect(404);
  });

  describe('PATCH /patients/:id', () => {
    let patientId: string;

    beforeEach(async () => {
      const createPatientDto: CreatePatientDto = {
        name: 'Test Patient for Update',
        email: 'update@example.com',
        phone: '1234567890',
        birthDate: new Date('1990-01-01'),
        gender: Gender.MALE,
        height: 170,
        weight: 70,
        goals: ['Perda de peso', 'Ganho de massa muscular'],
        allergies: ['none'],
        healthConditions: ['none'],
        medications: ['none'],
        observations: 'Test observations',
      };

      const patient = await patientsService.create(createPatientDto);
      patientId = patient.id;
    });

    it('should update a patient', async () => {
      const updatePatientDto = {
        name: 'Updated Test Patient',
        weight: 75,
      };

      const response = await request(app.getHttpServer())
        .patch(`/patients/${patientId}`)
        .send(updatePatientDto)
        .expect(200);

      const patient = response.body as Patient;
      expect(patient.name).toBe(updatePatientDto.name);
      expect(patient.weight).toBe(updatePatientDto.weight);
    });
  });

  describe('DELETE /patients/:id', () => {
    let patientId: string;

    beforeEach(async () => {
      const createPatientDto: CreatePatientDto = {
        name: 'Test Patient for Delete',
        email: 'delete@example.com',
        phone: '1234567890',
        birthDate: new Date('1990-01-01'),
        gender: Gender.MALE,
        height: 170,
        weight: 70,
        goals: ['Perda de peso', 'Ganho de massa muscular'],
        allergies: ['none'],
        healthConditions: ['none'],
        medications: ['none'],
        observations: 'Test observations',
      };

      const patient = await patientsService.create(createPatientDto);
      patientId = patient.id;
    });

    it('should delete a patient', async () => {
      await request(app.getHttpServer())
        .delete(`/patients/${patientId}`)
        .expect(204);

      // Verify patient was deleted
      await request(app.getHttpServer())
        .get(`/patients/${patientId}`)
        .expect(404);
    });
  });

  describe('POST /patients/:id/measurements', () => {
    let patientId: string;

    beforeEach(async () => {
      const createPatientDto: CreatePatientDto = {
        name: 'Test Patient for Measurements',
        email: 'measurements@example.com',
        phone: '1234567890',
        birthDate: new Date('1990-01-01'),
        gender: Gender.MALE,
        height: 170,
        weight: 70,
        goals: ['Perda de peso', 'Ganho de massa muscular'],
        allergies: ['none'],
        healthConditions: ['none'],
        medications: ['none'],
        observations: 'Test observations',
      };

      const patient = await patientsService.create(createPatientDto);
      patientId = patient.id;
    });

    it('should create a new measurement', async () => {
      const createMeasurementDto: CreateMeasurementDto = {
        date: new Date('2024-04-06'),
        weight: 70,
        bodyFat: 20,
        muscleMass: 50,
        bodyWater: 60,
        visceralFat: 5,
        measurements: {
          chest: 100,
          waist: 80,
          hip: 90,
          arm: 30,
          thigh: 50,
        },
      };

      const response = await request(app.getHttpServer())
        .post(`/patients/${patientId}/measurements`)
        .send(createMeasurementDto)
        .expect(201);

      const measurement = response.body as Measurement;
      expect(measurement).toHaveProperty('id');
      expect(measurement.weight).toBe(createMeasurementDto.weight);
      expect(measurement.bodyFat).toBe(createMeasurementDto.bodyFat);
    });
  });

  describe('GET /patients/:id/measurements', () => {
    let patientId: string;

    beforeEach(async () => {
      const createPatientDto: CreatePatientDto = {
        name: 'Test Patient for Get Measurements',
        email: 'getmeasurements@example.com',
        phone: '1234567890',
        birthDate: new Date('1990-01-01'),
        gender: Gender.MALE,
        height: 170,
        weight: 70,
        goals: ['Perda de peso', 'Ganho de massa muscular'],
        allergies: ['none'],
        healthConditions: ['none'],
        medications: ['none'],
        observations: 'Test observations',
      };

      const patient = await patientsService.create(createPatientDto);
      patientId = patient.id;

      const createMeasurementDto: CreateMeasurementDto = {
        date: new Date('2024-04-06'),
        weight: 70,
        bodyFat: 20,
        muscleMass: 50,
        bodyWater: 60,
        visceralFat: 5,
        measurements: {
          chest: 100,
          waist: 80,
          hip: 90,
          arm: 30,
          thigh: 50,
        },
      };

      await patientsService.createMeasurement(patientId, createMeasurementDto);
    });

    it('should return an array of measurements', async () => {
      const response = await request(app.getHttpServer()).get(
        `/patients/${patientId}/measurements`,
      );

      interface MeasurementResponse {
        id: string;
        weight: string;
        bodyFat: string;
        measurements: {
          chest: number;
          waist: number;
          hip: number;
          arm: number;
          thigh: number;
        };
      }

      expect(response.status).toBe(200);
      const measurements = response.body as MeasurementResponse[];
      expect(Array.isArray(measurements)).toBe(true);
      expect(measurements.length).toBeGreaterThan(0);

      const measurement = measurements[0];
      expect(measurement).toHaveProperty('id');
      expect(parseFloat(measurement.weight)).toBe(70);
      expect(parseFloat(measurement.bodyFat)).toBe(20);
    });
  });
});
