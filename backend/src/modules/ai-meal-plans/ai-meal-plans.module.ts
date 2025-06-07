import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { AiMealPlansController } from './ai-meal-plans.controller';
import { AiMealPlansService } from './ai-meal-plans.service';
import { PatientDataAggregationService } from './services/patient-data-aggregation.service';
import { AiProviderService } from './services/ai-provider.service';
import { FoodMatchingService } from './services/food-matching.service';

// Import existing entities that we'll use
import { Patient } from '../patients/entities/patient.entity';
import { Measurement } from '../patients/entities/measurement.entity';
import { MealPlan } from '../meal-plan/entities/meal-plan.entity';
import { Meal } from '../meal-plan/entities/meal.entity';
import { MealFood } from '../meal-plan/entities/meal-food.entity';
import { Food } from '../foods/entities/food.entity';
import { EnergyPlan } from '../energy-plan/entities/energy-plan.entity';
import { Photo } from '../photos/entities/photo.entity';

// Import related modules for dependency injection
import { PatientsModule } from '../patients/patients.module';
import { FoodsModule } from '../foods/foods.module';
import { MealPlansModule } from '../meal-plan/meal-plans.module';
import { EnergyPlanModule } from '../energy-plan/energy-plan.module';
import { PhotosModule } from '../photos/photos.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      Patient,
      Measurement,
      MealPlan,
      Meal,
      MealFood,
      Food,
      EnergyPlan,
      Photo,
    ]),
    PatientsModule,
    FoodsModule,
    MealPlansModule,
    EnergyPlanModule,
    PhotosModule,
  ],
  controllers: [AiMealPlansController],
  providers: [
    AiMealPlansService,
    PatientDataAggregationService,
    AiProviderService,
    FoodMatchingService,
  ],
  exports: [
    AiMealPlansService,
    PatientDataAggregationService,
    FoodMatchingService,
  ],
})
export class AiMealPlansModule {}