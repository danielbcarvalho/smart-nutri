import { Test, TestingModule } from '@nestjs/testing';
import { MealPlansController } from './meal-plans.controller';
import { MealPlansService } from './meal-plans.service';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';
import { CreateMealDto } from './dto/create-meal.dto';
import { Patient } from '../patients/entities/patient.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from '@nestjs/common';

interface RequestWithUser extends Request {
  user: {
    id: string;
  };
}

describe('MealPlansController', () => {
  let controller: MealPlansController;
  let patientRepository: Repository<Patient>;

  const mockMealPlansService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    addMeal: jest.fn(),
  };

  const mockRequest: RequestWithUser = {
    user: {
      id: '123e4567-e89b-12d3-a456-426614174000',
    },
  } as RequestWithUser;

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
        nutritionistId: '123e4567-e89b-12d3-a456-426614174000',
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        meals: [],
      };

      const patient = patientRepository.create({
        id: createMealPlanDto.patientId,
        name: 'Test Patient',
      });
      await patientRepository.save(patient);

      const result = { id: '1', ...createMealPlanDto };
      mockMealPlansService.create.mockResolvedValue(result);

      expect(await controller.create(createMealPlanDto, mockRequest)).toBe(
        result,
      );
      expect(mockMealPlansService.create).toHaveBeenCalledWith(
        createMealPlanDto,
        mockRequest.user.id,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of meal plans', async () => {
      const result = [{ id: '1', name: 'Test Meal Plan' }];
      mockMealPlansService.findAll.mockResolvedValue(result);

      expect(await controller.findAll(mockRequest)).toBe(result);
      expect(mockMealPlansService.findAll).toHaveBeenCalledWith(
        mockRequest.user.id,
      );
    });
  });

  describe('findOne', () => {
    it('should return a meal plan', async () => {
      const result = { id: '1', name: 'Test Meal Plan' };
      mockMealPlansService.findOne.mockResolvedValue(result);

      expect(await controller.findOne('1', mockRequest)).toBe(result);
      expect(mockMealPlansService.findOne).toHaveBeenCalledWith(
        '1',
        mockRequest.user.id,
      );
    });
  });

  describe('update', () => {
    it('should update a meal plan', async () => {
      const updateMealPlanDto: UpdateMealPlanDto = {
        name: 'Updated Meal Plan',
      };

      const result = { id: '1', ...updateMealPlanDto };
      mockMealPlansService.update.mockResolvedValue(result);

      expect(await controller.update('1', updateMealPlanDto, mockRequest)).toBe(
        result,
      );
      expect(mockMealPlansService.update).toHaveBeenCalledWith(
        '1',
        updateMealPlanDto,
        mockRequest.user.id,
      );
    });
  });

  describe('remove', () => {
    it('should remove a meal plan', async () => {
      const result = { id: '1', name: 'Test Meal Plan' };
      mockMealPlansService.remove.mockResolvedValue(result);

      expect(await controller.remove('1', mockRequest)).toBe(result);
      expect(mockMealPlansService.remove).toHaveBeenCalledWith(
        '1',
        mockRequest.user.id,
      );
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

      expect(await controller.addMeal('1', addMealDto, mockRequest)).toBe(
        result,
      );
      expect(mockMealPlansService.addMeal).toHaveBeenCalledWith(
        '1',
        addMealDto,
        mockRequest.user.id,
      );
    });
  });
});
