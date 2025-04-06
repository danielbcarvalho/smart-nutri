import { Test, TestingModule } from '@nestjs/testing';
import { MealPlansController } from './meal-plans.controller';
import { MealPlansService } from './meal-plans.service';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';
import { CreateMealDto } from './dto/create-meal.dto';
import { Patient } from '../patients/entities/patient.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('MealPlansController', () => {
  let controller: MealPlansController;
  let service: MealPlansService;
  let patientRepository: Repository<Patient>;

  const mockMealPlansService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    addMeal: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MealPlansController],
      providers: [
        {
          provide: MealPlansService,
          useValue: mockMealPlansService,
        },
        {
          provide: getRepositoryToken(Patient),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MealPlansController>(MealPlansController);
    service = module.get<MealPlansService>(MealPlansService);
    patientRepository = module.get(getRepositoryToken(Patient));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a meal plan', async () => {
      const createMealPlanDto: CreateMealPlanDto = {
        name: 'Test Meal Plan',
        patientId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: new Date(),
        endDate: new Date(),
        meals: [],
      };

      const patient = patientRepository.create({
        id: createMealPlanDto.patientId,
        name: 'Test Patient',
      });
      await patientRepository.save(patient);

      const result = { id: '1', ...createMealPlanDto };
      mockMealPlansService.create.mockResolvedValue(result);

      expect(await controller.create(createMealPlanDto)).toBe(result);
      expect(mockMealPlansService.create).toHaveBeenCalledWith(
        createMealPlanDto,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of meal plans', async () => {
      const result = [{ id: '1', name: 'Test Meal Plan' }];
      mockMealPlansService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
      expect(mockMealPlansService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a meal plan', async () => {
      const result = { id: '1', name: 'Test Meal Plan' };
      mockMealPlansService.findOne.mockResolvedValue(result);

      expect(await controller.findOne('1')).toBe(result);
      expect(mockMealPlansService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a meal plan', async () => {
      const updateMealPlanDto: UpdateMealPlanDto = {
        name: 'Updated Meal Plan',
      };

      const result = { id: '1', ...updateMealPlanDto };
      mockMealPlansService.update.mockResolvedValue(result);

      expect(await controller.update('1', updateMealPlanDto)).toBe(result);
      expect(mockMealPlansService.update).toHaveBeenCalledWith(
        '1',
        updateMealPlanDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a meal plan', async () => {
      const result = { id: '1', name: 'Test Meal Plan' };
      mockMealPlansService.remove.mockResolvedValue(result);

      expect(await controller.remove('1')).toBe(result);
      expect(mockMealPlansService.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('addMeal', () => {
    it('should add a meal to a meal plan', async () => {
      const addMealDto: CreateMealDto = {
        name: 'Test Meal',
        time: '08:00',
        notes: 'Test notes',
        mealFoods: [],
      };

      const result = { id: '1', name: 'Test Meal Plan', meals: [addMealDto] };
      mockMealPlansService.addMeal.mockResolvedValue(result);

      expect(await controller.addMeal('1', addMealDto)).toBe(result);
      expect(mockMealPlansService.addMeal).toHaveBeenCalledWith(
        '1',
        addMealDto,
      );
    });
  });
});
