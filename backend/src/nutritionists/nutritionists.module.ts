import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NutritionistsService } from './nutritionists.service';
import { NutritionistsController } from './nutritionists.controller';
import { Nutritionist } from './entities/nutritionist.entity';
import { PatientsModule } from '../patients/patients.module';

@Module({
  imports: [TypeOrmModule.forFeature([Nutritionist]), PatientsModule],
  controllers: [NutritionistsController],
  providers: [NutritionistsService],
  exports: [NutritionistsService],
})
export class NutritionistsModule {}
