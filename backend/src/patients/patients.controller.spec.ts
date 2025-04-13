import { Test, TestingModule } from '@nestjs/testing';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { Gender } from './enums/gender.enum';
import {
  Patient,
  PatientStatus,
  MonitoringStatus,
  ConsultationFrequency,
} from './entities/patient.entity';
import { Measurement } from './entities/measurement.entity';
import { Request } from '@nestjs/common';
import { Nutritionist } from '../nutritionists/entities/nutritionist.entity';

interface RequestWithUser extends Request {
  user: {
    id: string;
  };
}

describe('PatientsController', () => {
  let controller: PatientsController;
  let service: PatientsService;

  const mockRequest: RequestWithUser = {
    user: {
      id: '123e4567-e89b-12d3-a456-426614174000',
    },
  } as RequestWithUser;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientsController],
      providers: [
        {
          provide: PatientsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            createMeasurement: jest.fn(),
            findMeasurements: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PatientsController>(PatientsController);
    service = module.get<PatientsService>(PatientsService);
  });

  describe('create', () => {
    it('should create a patient', async () => {
      const createPatientDto: CreatePatientDto = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123456789',
        birthDate: '1990-01-01',
        height: 180,
        weight: 75,
        gender: Gender.MALE,
        cpf: '12345678900',
        status: PatientStatus.ACTIVE,
        nutritionistId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const patient: Patient = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123456789',
        birthDate: '1990-01-01',
        height: 180,
        weight: 75,
        gender: Gender.MALE,
        measurements: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        goals: [],
        allergies: [],
        healthConditions: [],
        medications: [],
        observations: '',
        mealPlans: [],
        cpf: '12345678900',
        status: PatientStatus.ACTIVE,
        nutritionistId: '123e4567-e89b-12d3-a456-426614174000',
        nutritionist: {} as Nutritionist,
        lastConsultationAt: new Date(),
        nextConsultationAt: new Date(),
        monitoringStatus: MonitoringStatus.IN_PROGRESS,
        consultationFrequency: ConsultationFrequency.MONTHLY,
        customConsultationDays: 0,
        address: '123 Main St',
        isSample: false,
        instagram: '',
        photos: [],
        consultations: [],
      };

      const createSpy = jest.spyOn(service, 'create');
      createSpy.mockResolvedValue(patient);

      const result = await controller.create(createPatientDto, mockRequest);
      expect(result).toEqual(patient);
      expect(createSpy).toHaveBeenCalledWith(
        createPatientDto,
        mockRequest.user.id,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of patients', async () => {
      const patients: Patient[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '123456789',
          birthDate: '1990-01-01',
          height: 180,
          weight: 75,
          gender: Gender.MALE,
          measurements: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          goals: [],
          allergies: [],
          healthConditions: [],
          medications: [],
          observations: '',
          mealPlans: [],
          cpf: '12345678900',
          status: PatientStatus.ACTIVE,
          nutritionistId: '123e4567-e89b-12d3-a456-426614174000',
          nutritionist: {} as Nutritionist,
          lastConsultationAt: new Date(),
          nextConsultationAt: new Date(),
          monitoringStatus: MonitoringStatus.IN_PROGRESS,
          consultationFrequency: ConsultationFrequency.MONTHLY,
          customConsultationDays: 0,
          address: '123 Main St',
          isSample: false,
          instagram: '',
          photos: [],
          consultations: [],
        },
        {
          id: '2',
          name: 'Jane Doe',
          email: 'jane@example.com',
          phone: '987654321',
          birthDate: '1995-01-01',
          height: 165,
          weight: 60,
          gender: Gender.FEMALE,
          measurements: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          goals: [],
          allergies: [],
          healthConditions: [],
          medications: [],
          observations: '',
          mealPlans: [],
          cpf: '98765432100',
          status: PatientStatus.ACTIVE,
          nutritionistId: '123e4567-e89b-12d3-a456-426614174000',
          nutritionist: {} as Nutritionist,
          lastConsultationAt: new Date(),
          nextConsultationAt: new Date(),
          monitoringStatus: MonitoringStatus.IN_PROGRESS,
          consultationFrequency: ConsultationFrequency.MONTHLY,
          customConsultationDays: 0,
          address: '456 Main St',
          isSample: false,
          instagram: '',
          photos: [],
          consultations: [],
        },
      ];

      const findAllSpy = jest.spyOn(service, 'findAll');
      findAllSpy.mockResolvedValue(patients);

      const result = await controller.findAll(mockRequest);
      expect(result).toEqual(patients);
      expect(findAllSpy).toHaveBeenCalledWith(mockRequest.user.id);
    });
  });

  describe('findOne', () => {
    it('should return a patient', async () => {
      const patient: Patient = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123456789',
        birthDate: '1990-01-01',
        height: 180,
        weight: 75,
        gender: Gender.MALE,
        measurements: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        goals: [],
        allergies: [],
        healthConditions: [],
        medications: [],
        observations: '',
        mealPlans: [],
        cpf: '12345678900',
        status: PatientStatus.ACTIVE,
        nutritionistId: '123e4567-e89b-12d3-a456-426614174000',
        nutritionist: {} as Nutritionist,
        lastConsultationAt: new Date(),
        nextConsultationAt: new Date(),
        monitoringStatus: MonitoringStatus.IN_PROGRESS,
        consultationFrequency: ConsultationFrequency.MONTHLY,
        customConsultationDays: 0,
        address: '123 Main St',
        isSample: false,
        instagram: '',
        photos: [],
        consultations: [],
      };

      const findOneSpy = jest.spyOn(service, 'findOne');
      findOneSpy.mockResolvedValue(patient);

      const result = await controller.findOne('1', mockRequest);
      expect(result).toEqual(patient);
      expect(findOneSpy).toHaveBeenCalledWith('1', mockRequest.user.id);
    });
  });

  describe('update', () => {
    it('should update a patient', async () => {
      const updatePatientDto: UpdatePatientDto = {
        name: 'John Doe Updated',
      };

      const patient: Patient = {
        id: '1',
        name: 'John Doe Updated',
        email: 'john@example.com',
        phone: '123456789',
        birthDate: '1990-01-01',
        height: 180,
        weight: 75,
        gender: Gender.MALE,
        measurements: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        goals: [],
        allergies: [],
        healthConditions: [],
        medications: [],
        observations: '',
        mealPlans: [],
        cpf: '12345678900',
        status: PatientStatus.ACTIVE,
        nutritionistId: '123e4567-e89b-12d3-a456-426614174000',
        nutritionist: {} as Nutritionist,
        lastConsultationAt: new Date(),
        nextConsultationAt: new Date(),
        monitoringStatus: MonitoringStatus.IN_PROGRESS,
        consultationFrequency: ConsultationFrequency.MONTHLY,
        customConsultationDays: 0,
        address: '123 Main St',
        isSample: false,
        instagram: '',
        photos: [],
        consultations: [],
      };

      const updateSpy = jest.spyOn(service, 'update');
      updateSpy.mockResolvedValue(patient);

      const result = await controller.update(
        '1',
        updatePatientDto,
        mockRequest,
      );
      expect(result).toEqual(patient);
      expect(updateSpy).toHaveBeenCalledWith(
        '1',
        updatePatientDto,
        mockRequest.user.id,
      );
    });
  });

  describe('remove', () => {
    it('should remove a patient', async () => {
      const removeSpy = jest.spyOn(service, 'remove');
      removeSpy.mockResolvedValue(undefined);

      await controller.remove('1', mockRequest);
      expect(removeSpy).toHaveBeenCalledWith('1', mockRequest.user.id);
    });
  });

  describe('createMeasurement', () => {
    it('should create a measurement for a patient', async () => {
      const patient: Patient = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123456789',
        birthDate: '1990-01-01',
        height: 180,
        weight: 75,
        gender: Gender.MALE,
        measurements: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        goals: [],
        allergies: [],
        healthConditions: [],
        medications: [],
        observations: '',
        mealPlans: [],
        cpf: '12345678900',
        status: PatientStatus.ACTIVE,
        nutritionistId: '123e4567-e89b-12d3-a456-426614174000',
        nutritionist: {} as Nutritionist,
        lastConsultationAt: new Date(),
        nextConsultationAt: new Date(),
        monitoringStatus: MonitoringStatus.IN_PROGRESS,
        consultationFrequency: ConsultationFrequency.MONTHLY,
        customConsultationDays: 0,
        address: '123 Main St',
        isSample: false,
        instagram: '',
        photos: [],
        consultations: [],
      };

      const createMeasurementDto: CreateMeasurementDto = {
        date: new Date().toISOString(),
        weight: 75,
        measurements: {
          chest: 95,
          waist: 80,
          hip: 100,
          arm: 32,
          thigh: 55,
        },
        patientId: '1',
        nutritionistId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const measurement: Measurement = {
        id: '1',
        date: new Date(createMeasurementDto.date),
        weight: createMeasurementDto.weight,
        height: 180,
        sittingHeight: 0,
        kneeHeight: 0,
        bodyFat: 20,
        fatMass: 15,
        muscleMassPercentage: 40,
        muscleMass: 35,
        fatFreeMass: 0,
        boneMass: 0,
        visceralFat: 8,
        bodyWater: 60,
        metabolicAge: 0,
        measurements: createMeasurementDto.measurements,
        skinfolds: {},
        boneDiameters: {},
        skinfoldFormula: '',
        patientId: '1',
        patient: {
          ...patient,
          isSample: false,
          instagram: '',
          photos: [],
          consultations: [],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        nutritionist: {} as Nutritionist,
        nutritionistId: '123e4567-e89b-12d3-a456-426614174000',
        consultation: {} as any,
        consultationId: '',
      };

      const createMeasurementSpy = jest.spyOn(service, 'createMeasurement');
      createMeasurementSpy.mockResolvedValue(measurement);

      const result = await controller.createMeasurement(
        '1',
        createMeasurementDto,
        mockRequest,
      );
      expect(result).toEqual(measurement);
      expect(createMeasurementSpy).toHaveBeenCalledWith(
        '1',
        createMeasurementDto,
        mockRequest.user.id,
      );
    });
  });

  describe('findMeasurements', () => {
    it('should return an array of measurements for a patient', async () => {
      const patient: Patient = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123456789',
        birthDate: '1990-01-01',
        height: 180,
        weight: 75,
        gender: Gender.MALE,
        measurements: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        goals: [],
        allergies: [],
        healthConditions: [],
        medications: [],
        observations: '',
        mealPlans: [],
        cpf: '12345678900',
        status: PatientStatus.ACTIVE,
        nutritionistId: '123e4567-e89b-12d3-a456-426614174000',
        nutritionist: {} as Nutritionist,
        lastConsultationAt: new Date(),
        nextConsultationAt: new Date(),
        monitoringStatus: MonitoringStatus.IN_PROGRESS,
        consultationFrequency: ConsultationFrequency.MONTHLY,
        customConsultationDays: 0,
        address: '123 Main St',
        isSample: false,
        instagram: '',
        photos: [],
        consultations: [],
      };

      const measurements: Measurement[] = [
        {
          id: '1',
          date: new Date(),
          weight: 75,
          height: 180,
          sittingHeight: 0,
          kneeHeight: 0,
          bodyFat: 20,
          fatMass: 15,
          muscleMassPercentage: 40,
          muscleMass: 35,
          fatFreeMass: 0,
          boneMass: 0,
          visceralFat: 8,
          bodyWater: 60,
          metabolicAge: 0,
          measurements: {
            chest: 95,
            waist: 80,
            hip: 100,
            arm: 32,
            thigh: 55,
          },
          skinfolds: {},
          boneDiameters: {},
          skinfoldFormula: '',
          patientId: '1',
          patient: {
            ...patient,
            isSample: false,
            instagram: '',
            photos: [],
            consultations: [],
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          nutritionist: {} as Nutritionist,
          nutritionistId: '123e4567-e89b-12d3-a456-426614174000',
          consultation: {} as any,
          consultationId: '',
        },
      ];

      const findMeasurementsSpy = jest.spyOn(service, 'findMeasurements');
      findMeasurementsSpy.mockResolvedValue(measurements);

      const result = await controller.findMeasurements('1', mockRequest);
      expect(result).toEqual(measurements);
      expect(findMeasurementsSpy).toHaveBeenCalledWith(
        '1',
        mockRequest.user.id,
      );
    });
  });
});
