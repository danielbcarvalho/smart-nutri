import { PartialType } from '@nestjs/mapped-types';
import { CreateMealPlanTemplateDto } from './create-meal-plan-template.dto';

export class UpdateMealPlanTemplateDto extends PartialType(
  CreateMealPlanTemplateDto,
) {}
