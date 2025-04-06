import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { Patient } from '../patients/entities/patient.entity';
import { MealPlan } from '../meal-plans/entities/meal-plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Patient, MealPlan])],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
