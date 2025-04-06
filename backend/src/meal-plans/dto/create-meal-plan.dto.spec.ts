import { validate } from 'class-validator';
import { CreateMealPlanDto } from './create-meal-plan.dto';
import { CreateMealDto } from './create-meal.dto';

describe('CreateMealPlanDto', () => {
  it('should validate a valid meal plan', async () => {
    const dto = new CreateMealPlanDto();
    dto.name = 'Test Plan';
    dto.startDate = new Date();
    dto.endDate = new Date(Date.now() + 86400000); // 1 day after
    dto.patientId = '123e4567-e89b-12d3-a456-426614174000';
    dto.meals = [];

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when name is empty', async () => {
    const dto = new CreateMealPlanDto();
    dto.name = '';
    dto.startDate = new Date();
    dto.endDate = new Date(Date.now() + 86400000); // 1 day after
    dto.patientId = '123e4567-e89b-12d3-a456-426614174000';
    dto.meals = [];

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
  });

  it('should fail validation when patientId is not a valid UUID', async () => {
    const dto = new CreateMealPlanDto();
    dto.name = 'Test Plan';
    dto.startDate = new Date();
    dto.endDate = new Date(Date.now() + 86400000); // 1 day after
    dto.patientId = 'invalid-uuid';
    dto.meals = [];

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('patientId');
  });

  it('should fail validation when endDate is before startDate', async () => {
    const dto = new CreateMealPlanDto();
    dto.name = 'Test Plan';
    dto.startDate = new Date();
    dto.endDate = new Date(Date.now() - 86400000); // 1 day before
    dto.patientId = '123e4567-e89b-12d3-a456-426614174000';
    dto.meals = [];

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('endDate');
  });

  it('should validate meals array', async () => {
    const dto = new CreateMealPlanDto();
    dto.name = 'Test Plan';
    dto.startDate = new Date();
    dto.endDate = new Date(Date.now() + 86400000); // 1 day after
    dto.patientId = '123e4567-e89b-12d3-a456-426614174000';

    // Criar um objeto CreateMealDto válido
    const meal = new CreateMealDto();
    meal.name = 'Breakfast';
    meal.time = '08:00';
    meal.mealFoods = [];

    dto.meals = [meal];

    const errors = await validate(dto, { validationError: { target: false } });
    expect(errors.length).toBe(0);
  });
});
