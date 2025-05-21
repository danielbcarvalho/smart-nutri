import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnergyPlan } from './entities/energy-plan.entity';
import { EnergyPlanController } from './energy-plan.controller';
import { EnergyPlanService } from './energy-plan.service';

@Module({
  imports: [TypeOrmModule.forFeature([EnergyPlan])],
  controllers: [EnergyPlanController],
  providers: [EnergyPlanService],
  exports: [EnergyPlanService],
})
export class EnergyPlanModule {}
