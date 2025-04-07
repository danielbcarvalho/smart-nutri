import { Test, TestingModule } from '@nestjs/testing';
import { MealPlansService } from './meal-plans.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MealPlan } from './entities/meal-plan.entity';
import { Meal } from './entities/meal.entity';
import { MealFood } from './entities/meal-food.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Repository } from 'typeorm';
import { PatientsService } from '../patients/patients.service';

// Test file for MealPlansService
describe('MealPlansService', () => {
  let service: MealPlansService;
  let mealPlanRepository: Repository<MealPlan>;
  let patientRepository: Repository<Patient>;

  const mockRepository = () => ({
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  });

  const mockPatientsService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MealPlansService,
        {
          provide: getRepositoryToken(MealPlan),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Meal),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(MealFood),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Patient),
          useFactory: mockRepository,
        },
        {
          provide: PatientsService,
          useValue: mockPatientsService,
        },
      ],
    }).compile();

    service = module.get<MealPlansService>(MealPlansService);
    mealPlanRepository = module.get<Repository<MealPlan>>(
      getRepositoryToken(MealPlan),
    );
    patientRepository = module.get<Repository<Patient>>(
      getRepositoryToken(Patient),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a meal plan', async () => {
      const createMealPlanDto = {
        name: 'Test Meal Plan',
        patientId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: new Date(),
        endDate: new Date(),
        meals: [],
      };

      const patient: Partial<Patient> = {
        id: createMealPlanDto.patientId,
        name: 'Test Patient',
      };

      const mealPlan: Partial<MealPlan> = {
        id: '1',
        ...createMealPlanDto,
        patient: patient as Patient,
        notes: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const findOneSpy = jest.spyOn(patientRepository, 'findOne');
      findOneSpy.mockResolvedValue(patient as Patient);

      const createSpy = jest.spyOn(mealPlanRepository, 'create');
      createSpy.mockReturnValue(mealPlan as MealPlan);

      const saveSpy = jest.spyOn(mealPlanRepository, 'save');
      saveSpy.mockResolvedValue(mealPlan as MealPlan);

      const result = await service.create(createMealPlanDto);

      expect(result).toEqual(mealPlan);
      expect(findOneSpy).toHaveBeenCalledWith({
        where: { id: createMealPlanDto.patientId },
      });
      expect(createSpy).toHaveBeenCalledWith({
        ...createMealPlanDto,
        patient,
      });
      expect(saveSpy).toHaveBeenCalledWith(mealPlan);
    });
  });

  describe('findAll', () => {
    it('should return an array of meal plans', async () => {
      const patient: Partial<Patient> = {
        id: '1',
        name: 'Test Patient',
      };

      const mealPlans: Partial<MealPlan>[] = [
        {
          id: '1',
          name: 'Test Meal Plan',
          patient: patient as Patient,
          meals: [],
          notes: '',
          startDate: new Date(),
          endDate: new Date(),
          patientId: '1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const findSpy = jest.spyOn(mealPlanRepository, 'find');
      findSpy.mockResolvedValue(mealPlans as MealPlan[]);

      const result = await service.findAll();

      expect(result).toEqual(mealPlans);
      expect(findSpy).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a meal plan', async () => {
      const patient: Partial<Patient> = {
        id: '1',
        name: 'Test Patient',
      };

      const mealPlan: Partial<MealPlan> = {
        id: '1',
        name: 'Test Meal Plan',
        patient: patient as Patient,
        meals: [],
        notes: '',
        startDate: new Date(),
        endDate: new Date(),
        patientId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const findOneSpy = jest.spyOn(mealPlanRepository, 'findOne');
      findOneSpy.mockResolvedValue(mealPlan as MealPlan);

      const result = await service.findOne('1');

      expect(result).toEqual(mealPlan);
      expect(findOneSpy).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: [
          'patient',
          'meals',
          'meals.mealFoods',
          'meals.mealFoods.food',
        ],
      });
    });
  });
});
