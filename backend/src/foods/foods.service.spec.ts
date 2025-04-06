import { Test, TestingModule } from '@nestjs/testing';
import { FoodsService } from './foods.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Food } from './entities/food.entity';
import { OpenFoodFactsService } from './services/openfoodfacts.service';
import { Repository } from 'typeorm';

describe('FoodsService', () => {
  let service: FoodsService;
  let foodRepository: Repository<Food>;

  const mockRepository = () => ({
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoodsService,
        {
          provide: getRepositoryToken(Food),
          useFactory: mockRepository,
        },
        {
          provide: OpenFoodFactsService,
          useValue: {
            searchFood: jest.fn(),
            getFoodDetails: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FoodsService>(FoodsService);
    foodRepository = module.get<Repository<Food>>(getRepositoryToken(Food));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
