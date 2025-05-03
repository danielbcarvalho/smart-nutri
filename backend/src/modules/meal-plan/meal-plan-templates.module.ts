import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealPlanTemplate } from './entities/meal-plan-template.entity';
import { MealTemplate } from './entities/meal-template.entity';
import { FoodTemplate } from './entities/food-template.entity';
import { MealPlanTemplatesService } from './services/meal-plan-templates.service';
import { MealPlanTemplatesController } from './controllers/meal-plan-templates.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([MealPlanTemplate, MealTemplate, FoodTemplate]),
  ],
  controllers: [MealPlanTemplatesController],
  providers: [MealPlanTemplatesService],
  exports: [MealPlanTemplatesService],
})
export class MealPlanTemplatesModule {}
