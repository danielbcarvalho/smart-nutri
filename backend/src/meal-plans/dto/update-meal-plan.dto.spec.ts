import { validate } from 'class-validator';
import { UpdateMealPlanDto } from './update-meal-plan.dto';

describe('UpdateMealPlanDto', () => {
  it('should validate a valid update', async () => {
    const dto = new UpdateMealPlanDto();
    dto.name = 'Updated Plan';
    dto.startDate = new Date('2024-03-20');
    dto.endDate = new Date('2024-03-27');

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate when only name is provided', async () => {
    const dto = new UpdateMealPlanDto();
    dto.name = 'Updated Plan';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate when only dates are provided', async () => {
    const dto = new UpdateMealPlanDto();
    dto.startDate = new Date('2024-03-20');
    dto.endDate = new Date('2024-03-27');

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when endDate is before startDate', async () => {
    const dto = new UpdateMealPlanDto();
    dto.startDate = new Date('2024-03-20');
    dto.endDate = new Date('2024-03-19');

    const errors = await validate(dto, { validationError: { target: false } });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('endDate');
  });

  it('should validate when notes are provided', async () => {
    const dto = new UpdateMealPlanDto();
    dto.notes = 'Updated notes';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate when all fields are optional', async () => {
    const dto = new UpdateMealPlanDto();

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
