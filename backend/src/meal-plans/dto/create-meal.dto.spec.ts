import { validate } from 'class-validator';
import { CreateMealDto } from './create-meal.dto';
import { CreateMealFoodDto } from './create-meal-food.dto';

describe('CreateMealDto', () => {
  it('should validate a valid meal', async () => {
    const dto = new CreateMealDto();
    dto.name = 'Test Meal';
    dto.time = '08:00';
    dto.mealFoods = [];

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when name is empty', async () => {
    const dto = new CreateMealDto();
    dto.name = '';
    dto.time = '08:00';
    dto.mealFoods = [];

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
  });

  it('should fail validation when time is not in HH:mm format', async () => {
    const dto = new CreateMealDto();
    dto.name = 'Test Meal';
    dto.time = '8:00';
    dto.mealFoods = [];

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('time');
  });

  it('should fail validation when time is invalid', async () => {
    const dto = new CreateMealDto();
    dto.name = 'Test Meal';
    dto.time = '25:00';
    dto.mealFoods = [];

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('time');
  });

  it('should validate mealFoods array', async () => {
    const dto = new CreateMealDto();
    dto.name = 'Test Meal';
    dto.time = '08:00';

    // Criar um objeto CreateMealFoodDto válido
    const mealFood = new CreateMealFoodDto();
    mealFood.foodId = '123e4567-e89b-12d3-a456-426614174000';
    mealFood.amount = 100;
    mealFood.unit = 'g';

    dto.mealFoods = [mealFood];

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when mealFoods contains invalid items', async () => {
    const dto = new CreateMealDto();
    dto.name = 'Test Meal';
    dto.time = '08:00';

    // Criar um objeto CreateMealFoodDto inválido
    const mealFood = new CreateMealFoodDto();
    mealFood.foodId = 'invalid-uuid';
    mealFood.amount = -1;
    mealFood.unit = '';

    dto.mealFoods = [mealFood];

    const errors = await validate(dto, { validationError: { target: false } });
    expect(errors.length).toBeGreaterThan(0);
  });
});
