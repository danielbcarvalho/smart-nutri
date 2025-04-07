import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NutritionistsService } from './nutritionists.service';
import { NutritionistsController } from './nutritionists.controller';
import { Nutritionist } from './entities/nutritionist.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Nutritionist])],
  controllers: [NutritionistsController],
  providers: [NutritionistsService],
  exports: [NutritionistsService],
})
export class NutritionistsModule {}
