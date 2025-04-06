import { Test, TestingModule } from '@nestjs/testing';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { Gender } from './enums/gender.enum';
import { Patient } from './entities/patient.entity';
import { Measurement } from './entities/measurement.entity';

describe('PatientsController', () => {
  let controller: PatientsController;
  let service: PatientsService;

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
        birthDate: new Date('1990-01-01'),
        height: 180,
        weight: 75,
        gender: Gender.MALE,
      };

      const patient: Patient = {
        id: '1',
        ...createPatientDto,
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

      jest.spyOn(service, 'create').mockResolvedValue(patient);

      const result = await controller.create(createPatientDto);
      expect(result).toEqual(patient);
      expect(service.create).toHaveBeenCalledWith(createPatientDto);
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
        },
        {
          id: '2',
          name: 'Jane Doe',
          email: 'jane@example.com',
          phone: '987654321',
          birthDate: new Date('1995-01-01'),
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
        },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(patients);

      const result = await controller.findAll();
      expect(result).toEqual(patients);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a patient', async () => {
      const patient: Patient = {
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

      jest.spyOn(service, 'findOne').mockResolvedValue(patient);

      const result = await controller.findOne('1');
      expect(result).toEqual(patient);
      expect(service.findOne).toHaveBeenCalledWith('1');
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

      jest.spyOn(service, 'update').mockResolvedValue(patient);

      const result = await controller.update('1', updatePatientDto);
      expect(result).toEqual(patient);
      expect(service.update).toHaveBeenCalledWith('1', updatePatientDto);
    });
  });

  describe('remove', () => {
    it('should remove a patient', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      await controller.remove('1');
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('createMeasurement', () => {
    it('should create a measurement for a patient', async () => {
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

      const createMeasurementDto: CreateMeasurementDto = {
        date: new Date(),
        weight: 75,
        measurements: {
          chest: 95,
          waist: 80,
          hip: 100,
          arm: 32,
          thigh: 55,
        },
      };

      const measurement: Measurement = {
        id: '1',
        date: createMeasurementDto.date,
        weight: createMeasurementDto.weight,
        measurements: createMeasurementDto.measurements,
        patientId: '1',
        patient: patient,
        createdAt: new Date(),
        updatedAt: new Date(),
        bodyFat: 20,
        muscleMass: 35,
        bodyWater: 60,
        visceralFat: 8,
      };

      jest.spyOn(service, 'createMeasurement').mockResolvedValue(measurement);

      const result = await controller.createMeasurement(
        '1',
        createMeasurementDto,
      );
      expect(result).toEqual(measurement);
      expect(service.createMeasurement).toHaveBeenCalledWith(
        '1',
        createMeasurementDto,
      );
    });
  });

  describe('findMeasurements', () => {
    it('should return an array of measurements for a patient', async () => {
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

      const measurements: Measurement[] = [
        {
          id: '1',
          date: new Date(),
          weight: 75,
          measurements: {
            chest: 95,
            waist: 80,
            hip: 100,
            arm: 32,
            thigh: 55,
          },
          patientId: '1',
          patient: patient,
          createdAt: new Date(),
          updatedAt: new Date(),
          bodyFat: 20,
          muscleMass: 35,
          bodyWater: 60,
          visceralFat: 8,
        },
      ];

      jest.spyOn(service, 'findMeasurements').mockResolvedValue(measurements);

      const result = await controller.findMeasurements('1');
      expect(result).toEqual(measurements);
      expect(service.findMeasurements).toHaveBeenCalledWith('1');
    });
  });
});
