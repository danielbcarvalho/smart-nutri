import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientsService } from './patients.service';
import { Patient } from './entities/patient.entity';
import { Measurement } from './entities/measurement.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { Gender } from './enums/gender.enum';

describe('PatientsService', () => {
  let service: PatientsService;
  let patientRepository: Repository<Patient>;
  let measurementRepository: Repository<Measurement>;

  const mockPatientRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
  };

  const mockMeasurementRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

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
    it('should create a patient with valid data', async () => {
      const createPatientDto: CreatePatientDto = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        birthDate: new Date('1990-01-01'),
        height: 175,
        weight: 70,
        gender: Gender.MALE,
        goals: ['weight loss', 'muscle gain'],
        allergies: ['peanuts', 'lactose'],
        healthConditions: ['diabetes'],
        medications: ['insulin'],
      };

      const patient = { id: '1', ...createPatientDto };
      mockPatientRepository.create.mockReturnValue(patient);
      mockPatientRepository.save.mockResolvedValue(patient);

      const result = await service.create(createPatientDto);
      expect(result).toEqual(patient);
      expect(mockPatientRepository.create).toHaveBeenCalledWith(
        createPatientDto,
      );
      expect(mockPatientRepository.save).toHaveBeenCalledWith(patient);
    });
  });

  describe('findAll', () => {
    it('should return an array of patients', async () => {
      const patients = [
        { id: '1', name: 'John Doe' },
        { id: '2', name: 'Jane Doe' },
      ];
      mockPatientRepository.find.mockResolvedValue(patients);

      const result = await service.findAll();
      expect(result).toEqual(patients);
    });
  });

  describe('findOne', () => {
    it('should return a patient by id', async () => {
      const patient = { id: '1', name: 'John Doe' };
      mockPatientRepository.findOne.mockResolvedValue(patient);

      const result = await service.findOne('1');
      expect(result).toEqual(patient);
    });
  });

  describe('update', () => {
    it('should update a patient', async () => {
      const existingPatient = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        birthDate: new Date('1990-01-01'),
        height: 175,
        weight: 70,
        gender: Gender.MALE,
        goals: ['weight loss', 'muscle gain'],
        allergies: ['peanuts', 'lactose'],
        healthConditions: ['diabetes'],
        medications: ['insulin'],
        measurements: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        observations: '',
        mealPlans: [],
      };

      const updatePatientDto: UpdatePatientDto = {
        name: 'John Updated',
        weight: 72,
      };

      const updatedPatient = {
        ...existingPatient,
        ...updatePatientDto,
      };

      mockPatientRepository.findOne.mockResolvedValue(existingPatient);
      mockPatientRepository.save.mockResolvedValue(updatedPatient);

      const result = await service.update('1', updatePatientDto);
      expect(result).toEqual(updatedPatient);
      expect(mockPatientRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockPatientRepository.save).toHaveBeenCalledWith(updatedPatient);
    });
  });

  describe('addMeasurement', () => {
    it('should add a measurement to a patient', async () => {
      const createMeasurementDto: CreateMeasurementDto = {
        date: new Date('2025-04-05'),
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
      };

      const patient = { id: '1', name: 'John Doe' };
      const measurement = { id: '1', patientId: '1', ...createMeasurementDto };

      mockPatientRepository.findOne.mockResolvedValue(patient);
      mockMeasurementRepository.create.mockReturnValue(measurement);
      mockMeasurementRepository.save.mockResolvedValue(measurement);

      const result = await service.createMeasurement('1', createMeasurementDto);
      expect(result).toEqual(measurement);
    });
  });

  describe('getMeasurements', () => {
    it('should return all measurements for a patient', async () => {
      const measurements = [
        { id: '1', patientId: '1', weight: 70 },
        { id: '2', patientId: '1', weight: 69 },
      ];
      mockMeasurementRepository.find.mockResolvedValue(measurements);

      const result = await service.findMeasurements('1');
      expect(result).toEqual(measurements);
    });
  });

  describe('remove', () => {
    it('should remove a patient', async () => {
      const patient = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123456789',
        birthDate: new Date('1990-01-01'),
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
      };

      mockPatientRepository.findOne.mockResolvedValue(patient);
      mockPatientRepository.remove.mockResolvedValue(patient);

      await service.remove('1');
      expect(mockPatientRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockPatientRepository.remove).toHaveBeenCalledWith(patient);
    });
  });
});
