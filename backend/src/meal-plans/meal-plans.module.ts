import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealPlan } from './entities/meal-plan.entity';
import { Meal } from './entities/meal.entity';
import { MealFood } from './entities/meal-food.entity';
import { Food } from '../foods/entities/food.entity';
import { MealPlanTemplate } from './entities/meal-plan-template.entity';
import { MealTemplate } from './entities/meal-template.entity';
import { FoodTemplate } from './entities/food-template.entity';
import { MealPlansService } from './meal-plans.service';
import { MealPlansController } from './meal-plans.controller';
import { MealPlanTemplatesService } from './meal-plan-templates.service';
import { MealPlanTemplatesController } from './meal-plan-templates.controller';
import { PatientsModule } from '../patients/patients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MealPlan,
      Meal,
      MealFood,
      Food,
      MealPlanTemplate,
      MealTemplate,
      FoodTemplate,
    ]),
    PatientsModule,
  ],
  controllers: [MealPlansController, MealPlanTemplatesController],
  providers: [MealPlansService, MealPlanTemplatesService],
  exports: [MealPlansService, MealPlanTemplatesService],
})
export class MealPlansModule {}
