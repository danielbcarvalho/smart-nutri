import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Food } from './entities/food.entity';
import { FoodsService } from './foods.service';
import { FoodsController } from './foods.controller';
import { OpenFoodFactsService } from './services/openfoodfacts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Food]),
    HttpModule,
  ],
  controllers: [FoodsController],
  providers: [FoodsService, OpenFoodFactsService],
  exports: [FoodsService],
})
export class FoodsModule {}
