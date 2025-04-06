import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { Patient } from '../patients/entities/patient.entity';
import { MealPlan } from '../meal-plans/entities/meal-plan.entity';
import { Measurement } from '../patients/entities/measurement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Patient, MealPlan, Measurement])],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
