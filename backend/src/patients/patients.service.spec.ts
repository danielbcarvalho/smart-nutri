import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientsService } from './patients.service';
import {
  Patient,
  PatientStatus,
  MonitoringStatus,
  ConsultationFrequency,
} from './entities/patient.entity';
import { Measurement } from './entities/measurement.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { Gender } from './enums/gender.enum';
import { NotFoundException, ConflictException } from '@nestjs/common';

type MockType<T> = {
  [P in keyof T]: jest.Mock<any>;
};

const mockNutritionistId = 'nutritionist-123';

const mockCreateMeasurementDto = {
  date: new Date().toISOString(),
  weight: 70,
  bodyFat: 20,
  muscleMass: 40,
  bodyWater: 60,
  visceralFat: 5,
  measurements: {
    chest: 100,
    waist: 80,
    hip: 90,
  },
  patientId: '1',
  nutritionistId: mockNutritionistId,
};

describe('PatientsService', () => {
  let service: PatientsService;
  let patientRepository: Repository<Patient>;
  let measurementRepository: Repository<Measurement>;

  const mockPatientRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getOne: jest.fn(),
    })),
  } as MockType<Repository<Patient>>;

  const mockMeasurementRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  } as MockType<Repository<Measurement>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        {
          provide: getRepositoryToken(Patient),
          useValue: mockPatientRepository,
        },
        {
          provide: getRepositoryToken(Measurement),
          useValue: mockMeasurementRepository,
        },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
    patientRepository = module.get<Repository<Patient>>(
      getRepositoryToken(Patient),
    );
    measurementRepository = module.get<Repository<Measurement>>(
      getRepositoryToken(Measurement),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createPatientDto = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      cpf: '12345678900',
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
    };

    it('should create a new patient', async () => {
      const savedPatient = {
        id: '1',
        ...createPatientDto,
        nutritionistId: mockNutritionistId,
        monitoringStatus: MonitoringStatus.IN_PROGRESS,
        consultationFrequency: ConsultationFrequency.MONTHLY,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockPatientRepository.findOne.mockResolvedValue(null);
      mockPatientRepository.create.mockReturnValue(savedPatient);
      mockPatientRepository.save.mockResolvedValue(savedPatient);

      const result = await service.create(createPatientDto, mockNutritionistId);

      expect(result).toEqual(savedPatient);
      expect(mockPatientRepository.create).toHaveBeenCalledWith({
        ...createPatientDto,
        nutritionistId: mockNutritionistId,
      });
      expect(mockPatientRepository.save).toHaveBeenCalledWith(savedPatient);
    });

    it('should throw ConflictException if patient with same email exists', async () => {
      const existingPatient = {
        id: '1',
        email: createPatientDto.email,
        nutritionistId: mockNutritionistId,
      };

      mockPatientRepository.findOne.mockResolvedValue(existingPatient);

      await expect(
        service.create(createPatientDto, mockNutritionistId),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return an array of patients', async () => {
      const patients = [
        {
          id: '1',
          name: 'John Doe',
          nutritionistId: mockNutritionistId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      mockPatientRepository.find.mockResolvedValue(patients);

      const result = await service.findAll(mockNutritionistId);

      expect(result).toEqual(patients);
      expect(mockPatientRepository.find).toHaveBeenCalledWith({
        where: { nutritionistId: mockNutritionistId },
        order: { name: 'ASC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a patient', async () => {
      const patient = {
        id: '1',
        name: 'John Doe',
        nutritionistId: mockNutritionistId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockPatientRepository.findOne.mockResolvedValue(patient);

      const result = await service.findOne('1', mockNutritionistId);

      expect(result).toEqual(patient);
      expect(mockPatientRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1', nutritionistId: mockNutritionistId },
      });
    });

    it('should throw NotFoundException if patient not found', async () => {
      mockPatientRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('1', mockNutritionistId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updatePatientDto = {
      name: 'John Doe Updated',
      email: 'john.updated@example.com',
    };

    it('should update a patient', async () => {
      const existingPatient = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        nutritionistId: mockNutritionistId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedPatient = {
        ...existingPatient,
        ...updatePatientDto,
      };

      mockPatientRepository.findOne.mockResolvedValueOnce(existingPatient);
      mockPatientRepository.findOne.mockResolvedValueOnce(null);
      mockPatientRepository.save.mockResolvedValue(updatedPatient);

      const result = await service.update(
        '1',
        updatePatientDto,
        mockNutritionistId,
      );

      expect(result).toEqual(updatedPatient);
      expect(mockPatientRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1', nutritionistId: mockNutritionistId },
      });
      expect(mockPatientRepository.save).toHaveBeenCalledWith(updatedPatient);
    });

    it('should throw NotFoundException if patient not found', async () => {
      mockPatientRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('1', updatePatientDto, mockNutritionistId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if email already exists', async () => {
      const existingPatient = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        nutritionistId: mockNutritionistId,
      };

      const conflictingPatient = {
        id: '2',
        email: updatePatientDto.email,
        nutritionistId: mockNutritionistId,
      };

      mockPatientRepository.findOne
        .mockResolvedValueOnce(existingPatient)
        .mockResolvedValueOnce(conflictingPatient);

      await expect(
        service.update('1', updatePatientDto, mockNutritionistId),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove a patient', async () => {
      const patient = {
        id: '1',
        name: 'John Doe',
        nutritionistId: mockNutritionistId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockPatientRepository.findOne.mockResolvedValue(patient);
      mockPatientRepository.remove.mockResolvedValue(patient);

      await service.remove('1', mockNutritionistId);

      expect(mockPatientRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1', nutritionistId: mockNutritionistId },
      });
      expect(mockPatientRepository.remove).toHaveBeenCalledWith(patient);
    });

    it('should throw NotFoundException if patient not found', async () => {
      mockPatientRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('1', mockNutritionistId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createMeasurement', () => {
    it('should create a measurement for a patient', async () => {
      const patient = {
        id: '1',
        name: 'John Doe',
        nutritionistId: mockNutritionistId,
      };

      const measurement = {
        id: '1',
        ...mockCreateMeasurementDto,
        patient,
      };

      mockPatientRepository.findOne.mockResolvedValue(patient);
      mockMeasurementRepository.create.mockReturnValue(measurement);
      mockMeasurementRepository.save.mockResolvedValue(measurement);

      const result = await service.createMeasurement(
        '1',
        mockCreateMeasurementDto,
        mockNutritionistId,
      );

      expect(result).toEqual(measurement);
      expect(mockMeasurementRepository.create).toHaveBeenCalledWith({
        ...mockCreateMeasurementDto,
        patient,
        nutritionistId: mockNutritionistId,
      });
      expect(mockMeasurementRepository.save).toHaveBeenCalledWith(measurement);
    });

    it('should throw NotFoundException if patient not found', async () => {
      mockPatientRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createMeasurement(
          '1',
          mockCreateMeasurementDto,
          mockNutritionistId,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findMeasurements', () => {
    it('should return all measurements for a patient', async () => {
      const patient = {
        id: '1',
        name: 'John Doe',
        nutritionistId: mockNutritionistId,
      };

      const measurements = [
        {
          id: '1',
          patientId: '1',
          weight: 70,
          date: new Date().toISOString(),
        },
        {
          id: '2',
          patientId: '1',
          weight: 69,
          date: new Date().toISOString(),
        },
      ];

      mockPatientRepository.findOne.mockResolvedValue(patient);
      mockMeasurementRepository.find.mockResolvedValue(measurements);

      const result = await service.findMeasurements('1', mockNutritionistId);

      expect(result).toEqual(measurements);
      expect(mockMeasurementRepository.find).toHaveBeenCalledWith({
        where: {
          patient: { id: patient.id },
          nutritionistId: mockNutritionistId,
        },
        order: { date: 'DESC' },
      });
    });

    it('should throw NotFoundException if patient not found', async () => {
      mockPatientRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findMeasurements('1', mockNutritionistId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('search', () => {
    it('should search patients by name', async () => {
      const patients = [
        {
          id: '1',
          name: 'John Doe',
          nutritionistId: mockNutritionistId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(patients),
      };

      mockPatientRepository.createQueryBuilder.mockReturnValue(
        queryBuilder as any,
      );

      const result = await service.search('John', mockNutritionistId);

      expect(result).toEqual(patients);
      expect(mockPatientRepository.createQueryBuilder).toHaveBeenCalledWith(
        'patient',
      );
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'patient.nutritionistId = :nutritionistId',
        { nutritionistId: mockNutritionistId },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        '(LOWER(patient.name) LIKE LOWER(:query) OR LOWER(patient.email) LIKE LOWER(:query))',
        { query: '%John%' },
      );
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('patient.name', 'ASC');
      expect(queryBuilder.take).toHaveBeenCalledWith(5);
    });
  });
});
