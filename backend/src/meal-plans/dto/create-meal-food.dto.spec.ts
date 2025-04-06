import { validate } from 'class-validator';
import { CreateMealFoodDto } from './create-meal-food.dto';

describe('CreateMealFoodDto', () => {
  it('should validate a valid meal food', async () => {
    const dto = new CreateMealFoodDto();
    dto.foodId = '123e4567-e89b-12d3-a456-426614174000';
    dto.amount = 100;
    dto.unit = 'g';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when foodId is not a valid UUID', async () => {
    const dto = new CreateMealFoodDto();
    dto.foodId = '123e4567-e89b-12d3-a456'; // Invalid UUID format
    dto.amount = 100;
    dto.unit = 'g';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('foodId');
  });

  it('should fail validation when amount is negative', async () => {
    const dto = new CreateMealFoodDto();
    dto.foodId = '123e4567-e89b-12d3-a456-426614174000';
    dto.amount = -1;
    dto.unit = 'g';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('amount');
  });

  it('should fail validation when unit is empty', async () => {
    const dto = new CreateMealFoodDto();
    dto.foodId = '123e4567-e89b-12d3-a456-426614174000';
    dto.amount = 100;
    dto.unit = '';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('unit');
  });

  it('should fail validation when all fields are missing', async () => {
    const dto = new CreateMealFoodDto();

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.map((error) => error.property)).toContain('foodId');
    expect(errors.map((error) => error.property)).toContain('amount');
    expect(errors.map((error) => error.property)).toContain('unit');
  });
});
