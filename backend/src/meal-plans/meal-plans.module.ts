import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealPlansController } from './meal-plans.controller';
import { MealPlansService } from './meal-plans.service';
import { MealPlan } from './entities/meal-plan.entity';
import { Meal } from './entities/meal.entity';
import { MealFood } from './entities/meal-food.entity';
import { Patient } from '../patients/entities/patient.entity';
import { PatientsModule } from '../patients/patients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MealPlan, Meal, MealFood, Patient]),
    PatientsModule,
  ],
  controllers: [MealPlansController],
  providers: [MealPlansService],
  exports: [MealPlansService],
})
export class MealPlansModule {}
