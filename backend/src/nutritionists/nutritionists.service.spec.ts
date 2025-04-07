import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { NutritionistsService } from './nutritionists.service';
import { Nutritionist } from './entities/nutritionist.entity';
import { CreateNutritionistDto } from './dto/create-nutritionist.dto';
import { UpdateNutritionistDto } from './dto/update-nutritionist.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('NutritionistsService', () => {
  let service: NutritionistsService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NutritionistsService,
        {
          provide: getRepositoryToken(Nutritionist),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<NutritionistsService>(NutritionistsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateNutritionistDto = {
      name: 'Test Nutritionist',
      email: 'test@example.com',
      password: 'password123',
      phone: '11999999999',
      crn: 'CRN/SP 12345',
      specialties: ['Esportiva', 'Clínica'],
      clinicName: 'Test Clinic',
    };

    it('should create a new nutritionist', async () => {
      const hashedPassword = 'hashed_password';
      const expectedNutritionist = {
        id: 'uuid',
        ...createDto,
        passwordHash: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(expectedNutritionist);
      mockRepository.save.mockResolvedValue(expectedNutritionist);

      const result = await service.create(createDto);

      expect(result).toEqual(expectedNutritionist);
      expect(bcrypt.hash).toHaveBeenCalledWith(createDto.password, 10);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDto,
        passwordHash: hashedPassword,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(expectedNutritionist);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockRepository.findOne.mockResolvedValue({ id: 'existing-id' });

      await expect(service.create(createDto)).rejects.toThrow(
        new ConflictException('Email já cadastrado'),
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of nutritionists', async () => {
      const expectedNutritionists = [
        {
          id: '1',
          name: 'Nutritionist 1',
          email: 'nutri1@example.com',
        },
        {
          id: '2',
          name: 'Nutritionist 2',
          email: 'nutri2@example.com',
        },
      ];

      mockRepository.find.mockResolvedValue(expectedNutritionists);

      const result = await service.findAll();

      expect(result).toEqual(expectedNutritionists);
      expect(mockRepository.find).toHaveBeenCalledWith({
        select: [
          'id',
          'name',
          'email',
          'phone',
          'crn',
          'specialties',
          'clinicName',
          'createdAt',
          'updatedAt',
        ],
      });
    });
  });

  describe('findOne', () => {
    const nutritionistId = 'test-id';
    const expectedNutritionist = {
      id: nutritionistId,
      name: 'Test Nutritionist',
      email: 'test@example.com',
    };

    it('should return a nutritionist when found', async () => {
      mockRepository.findOne.mockResolvedValue(expectedNutritionist);

      const result = await service.findOne(nutritionistId);

      expect(result).toEqual(expectedNutritionist);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: nutritionistId },
        select: [
          'id',
          'name',
          'email',
          'phone',
          'crn',
          'specialties',
          'clinicName',
          'createdAt',
          'updatedAt',
        ],
      });
    });

    it('should throw NotFoundException when nutritionist not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(nutritionistId)).rejects.toThrow(
        new NotFoundException(
          `Nutricionista com ID ${nutritionistId} não encontrado`,
        ),
      );
    });
  });

  describe('update', () => {
    const nutritionistId = 'test-id';
    const updateDto: UpdateNutritionistDto = {
      name: 'Updated Name',
      specialties: ['Clínica', 'Pediatria'],
    };

    it('should update a nutritionist', async () => {
      const existingNutritionist = {
        id: nutritionistId,
        name: 'Old Name',
        email: 'test@example.com',
      };
      const updatedNutritionist = {
        ...existingNutritionist,
        ...updateDto,
      };

      mockRepository.findOne.mockResolvedValueOnce(existingNutritionist);
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValueOnce(updatedNutritionist);

      const result = await service.update(nutritionistId, updateDto);

      expect(result).toEqual(updatedNutritionist);
      expect(mockRepository.update).toHaveBeenCalledWith(
        nutritionistId,
        updateDto,
      );
    });

    it('should throw NotFoundException when nutritionist not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(nutritionistId, updateDto)).rejects.toThrow(
        new NotFoundException(
          `Nutricionista com ID ${nutritionistId} não encontrado`,
        ),
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when updating to existing email', async () => {
      const existingNutritionist = {
        id: nutritionistId,
        email: 'old@example.com',
      };
      const updateDtoWithEmail = {
        email: 'existing@example.com',
      };

      mockRepository.findOne
        .mockResolvedValueOnce(existingNutritionist)
        .mockResolvedValueOnce({ id: 'other-id' });

      await expect(
        service.update(nutritionistId, updateDtoWithEmail),
      ).rejects.toThrow(new ConflictException('Email já cadastrado'));
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    const nutritionistId = 'test-id';

    it('should remove a nutritionist', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(nutritionistId);

      expect(mockRepository.delete).toHaveBeenCalledWith(nutritionistId);
    });

    it('should throw NotFoundException when nutritionist not found', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(nutritionistId)).rejects.toThrow(
        new NotFoundException(
          `Nutricionista com ID ${nutritionistId} não encontrado`,
        ),
      );
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      const nutritionist = {
        passwordHash: 'hashed_password',
      } as Nutritionist;
      const password = 'correct_password';

      const result = await service.validatePassword(nutritionist, password);

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        password,
        nutritionist.passwordHash,
      );
    });
  });
});
