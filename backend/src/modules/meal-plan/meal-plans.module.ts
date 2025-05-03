import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealPlan } from './entities/meal-plan.entity';
import { Meal } from './entities/meal.entity';
import { MealFood } from './entities/meal-food.entity';
import { MealPlanTemplate } from './entities/meal-plan-template.entity';
import { MealTemplate } from './entities/meal-template.entity';
import { FoodTemplate } from './entities/food-template.entity';
import { MealPlansService } from './services/meal-plans.service';
import { MealPlansController } from './controllers/meal-plans.controller';
import { MealPlanTemplatesService } from './services/meal-plan-templates.service';
import { MealPlanTemplatesController } from './controllers/meal-plan-templates.controller';
import { FoodsModule } from '../foods/foods.module';
import { Food } from '../foods/entities/food.entity';
import { PatientsModule } from '../patients/patients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MealPlan,
      Meal,
      MealFood,
      MealPlanTemplate,
      MealTemplate,
      FoodTemplate,
      Food,
    ]),
    PatientsModule,
    FoodsModule,
  ],
  controllers: [MealPlansController, MealPlanTemplatesController],
  providers: [MealPlansService, MealPlanTemplatesService],
  exports: [MealPlansService, MealPlanTemplatesService],
})
export class MealPlansModule {}
