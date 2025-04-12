import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Patient,
  PatientStatus,
  MonitoringStatus,
  ConsultationFrequency,
} from '../src/patients/entities/patient.entity';
import { Measurement } from '../src/patients/entities/measurement.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Gender } from '../src/patients/enums/gender.enum';
import { v4 as uuidv4 } from 'uuid';

interface AuthResponse {
  access_token: string;
  id: string;
}

interface PatientResponse {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  address: string;
  birthDate: string;
  gender: Gender;
  status: PatientStatus;
  height: number;
  weight: number;
  goals: string[];
  allergies: string[];
  healthConditions: string[];
  medications: string[];
  observations: string;
  nutritionistId: string;
  monitoringStatus: MonitoringStatus;
  consultationFrequency: ConsultationFrequency;
  customConsultationDays: number;
  createdAt: string;
  updatedAt: string;
}

interface MeasurementResponse {
  id: string;
  date: string;
  weight: number;
  bodyFat: number;
  muscleMass: number;
  bodyWater: number;
  visceralFat: number;
  measurements: {
    chest: number;
    waist: number;
    hip: number;
    arm: number;
    thigh: number;
  };
  patientId: string;
  nutritionistId: string;
  createdAt: string;
  updatedAt: string;
}

describe('PatientsController (e2e)', () => {
  let app: INestApplication;
  let patientRepository: Repository<Patient>;
  let measurementRepository: Repository<Measurement>;
  let authToken: string;
  let nutritionistId: string;

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
    phone: '11999999999',
    address: '123 Main St',
    birthDate: '1990-01-01',
    gender: Gender.MALE,
    status: PatientStatus.ACTIVE,
    height: 175,
    weight: 70,
    goals: ['weight loss'],
    allergies: ['peanuts'],
    healthConditions: ['diabetes'],
    medications: ['insulin'],
    observations: 'Test patient',
    monitoringStatus: MonitoringStatus.IN_PROGRESS,
    consultationFrequency: ConsultationFrequency.MONTHLY,
    customConsultationDays: 0,
  };

  const mockMeasurement = {
    date: new Date().toISOString(),
    weight: 75,
    bodyFat: 20,
    muscleMass: 35,
    bodyWater: 60,
    visceralFat: 8,
    measurements: {
      chest: 95,
      waist: 80,
      hip: 100,
      arm: 32,
      thigh: 55,
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TypeOrmModule.forFeature([Patient, Measurement])],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    patientRepository = moduleFixture.get<Repository<Patient>>(
      getRepositoryToken(Patient),
    );
    measurementRepository = moduleFixture.get<Repository<Measurement>>(
      getRepositoryToken(Measurement),
    );

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
  });

  beforeEach(async () => {
    await patientRepository.delete({});
    await measurementRepository.delete({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/patients (POST)', () => {
    it('should create a patient', async () => {
      const response = await request(app.getHttpServer())
        .post('/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockPatient)
        .expect(201);

      const patient = response.body as PatientResponse;
      expect(patient).toHaveProperty('id');
      expect(patient.name).toBe(mockPatient.name);
      expect(patient.email).toBe(mockPatient.email);
      expect(patient.nutritionistId).toBe(nutritionistId);
    });

    it('should fail when required fields are missing', async () => {
      const invalidPatient = {
        email: 'test@patient.com',
        // name missing
      };

      await request(app.getHttpServer())
        .post('/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidPatient)
        .expect(400);
    });

    it('should fail when patient with same email exists', async () => {
      // First create a patient
      await request(app.getHttpServer())
        .post('/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockPatient)
        .expect(201);

      // Try to create another patient with same email
      await request(app.getHttpServer())
        .post('/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockPatient)
        .expect(409);
    });
  });

  describe('/patients (GET)', () => {
    it('should return an array of patients', async () => {
      // First create a patient
      await request(app.getHttpServer())
        .post('/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockPatient)
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const patients = response.body as PatientResponse[];
      expect(Array.isArray(patients)).toBe(true);
      expect(patients.length).toBeGreaterThan(0);
      expect(patients[0].name).toBe(mockPatient.name);
      expect(patients[0].email).toBe(mockPatient.email);
    });
  });

  describe('/patients/:id (GET)', () => {
    it('should return a patient', async () => {
      // First create a patient
      const createResponse = await request(app.getHttpServer())
        .post('/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockPatient)
        .expect(201);

      const createdPatient = createResponse.body as PatientResponse;
      const patientId = createdPatient.id;

      const response = await request(app.getHttpServer())
        .get(`/patients/${patientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const patient = response.body as PatientResponse;
      expect(patient.id).toBe(patientId);
      expect(patient.name).toBe(mockPatient.name);
      expect(patient.email).toBe(mockPatient.email);
    });

    it('should return 404 when patient does not exist', async () => {
      const nonExistentId = uuidv4();
      await request(app.getHttpServer())
        .get(`/patients/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/patients/:id (PATCH)', () => {
    it('should update a patient', async () => {
      // First create a patient
      const createResponse = await request(app.getHttpServer())
        .post('/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockPatient)
        .expect(201);

      const createdPatient = createResponse.body as PatientResponse;
      const patientId = createdPatient.id;
      const updateData = {
        name: 'Updated Name',
        phone: '11988888888',
      };

      const response = await request(app.getHttpServer())
        .patch(`/patients/${patientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      const updatedPatient = response.body as PatientResponse;
      expect(updatedPatient.id).toBe(patientId);
      expect(updatedPatient.name).toBe(updateData.name);
      expect(updatedPatient.phone).toBe(updateData.phone);
    });

    it('should return 404 when patient does not exist', async () => {
      const nonExistentId = uuidv4();
      await request(app.getHttpServer())
        .patch(`/patients/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Name' })
        .expect(404);
    });
  });

  describe('/patients/:id (DELETE)', () => {
    it('should delete a patient', async () => {
      // First create a patient
      const createResponse = await request(app.getHttpServer())
        .post('/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockPatient)
        .expect(201);

      const createdPatient = createResponse.body as PatientResponse;
      const patientId = createdPatient.id;

      await request(app.getHttpServer())
        .delete(`/patients/${patientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify patient is deleted
      await request(app.getHttpServer())
        .get(`/patients/${patientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 404 when patient does not exist', async () => {
      const nonExistentId = uuidv4();
      await request(app.getHttpServer())
        .delete(`/patients/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/patients/:id/measurements (POST)', () => {
    it('should create a measurement for a patient', async () => {
      // First create a patient
      const createResponse = await request(app.getHttpServer())
        .post('/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockPatient)
        .expect(201);

      const createdPatient = createResponse.body as PatientResponse;
      const patientId = createdPatient.id;

      const response = await request(app.getHttpServer())
        .post(`/patients/${patientId}/measurements`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockMeasurement)
        .expect(201);

      const measurement = response.body as MeasurementResponse;
      expect(measurement).toHaveProperty('id');
      expect(measurement.patientId).toBe(patientId);
      expect(measurement.weight).toBe(mockMeasurement.weight);
      expect(measurement.measurements).toEqual(mockMeasurement.measurements);
    });

    it('should return 404 when patient does not exist', async () => {
      const nonExistentId = uuidv4();
      await request(app.getHttpServer())
        .post(`/patients/${nonExistentId}/measurements`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockMeasurement)
        .expect(404);
    });
  });

  describe('/patients/:id/measurements (GET)', () => {
    it('should return measurements for a patient', async () => {
      // First create a patient
      const createResponse = await request(app.getHttpServer())
        .post('/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockPatient)
        .expect(201);

      const createdPatient = createResponse.body as PatientResponse;
      const patientId = createdPatient.id;

      // Create a measurement
      await request(app.getHttpServer())
        .post(`/patients/${patientId}/measurements`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockMeasurement)
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/patients/${patientId}/measurements`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const measurements = response.body as MeasurementResponse[];
      expect(Array.isArray(measurements)).toBe(true);
      expect(measurements.length).toBeGreaterThan(0);
      expect(measurements[0].patientId).toBe(patientId);
      expect(measurements[0].weight).toBe(mockMeasurement.weight);
    });

    it('should return 404 when patient does not exist', async () => {
      const nonExistentId = uuidv4();
      await request(app.getHttpServer())
        .get(`/patients/${nonExistentId}/measurements`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/patients/search (GET)', () => {
    it('should search patients by name or email', async () => {
      // First create a patient
      await request(app.getHttpServer())
        .post('/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mockPatient)
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/patients/search')
        .query({ query: 'Test' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const patients = response.body as PatientResponse[];
      expect(Array.isArray(patients)).toBe(true);
      expect(patients.length).toBeGreaterThan(0);
      expect(patients[0].name).toContain('Test');
    });

    it('should return empty array when no matches found', async () => {
      const response = await request(app.getHttpServer())
        .get('/patients/search')
        .query({ query: 'NonExistentPatient' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const patients = response.body as PatientResponse[];
      expect(Array.isArray(patients)).toBe(true);
      expect(patients.length).toBe(0);
    });
  });
});
