import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { Food } from './entities/food.entity';
import { FoodsService } from './foods.service';
import { FoodsController } from './foods.controller';
import { TbcaDatabaseService } from './services/tbca-database.service';
import { Alimento, AlimentoSchema } from './schemas/alimento.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([Food]),
    HttpModule,
    MongooseModule.forFeature([
      { name: Alimento.name, schema: AlimentoSchema },
    ]),
  ],
  controllers: [FoodsController],
  providers: [FoodsService, TbcaDatabaseService],
  exports: [FoodsService],
})
export class FoodsModule {}
