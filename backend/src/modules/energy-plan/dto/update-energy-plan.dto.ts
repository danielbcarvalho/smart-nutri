import { PartialType } from '@nestjs/swagger';
import { CreateEnergyPlanDto } from './create-energy-plan.dto';

export class UpdateEnergyPlanDto extends PartialType(CreateEnergyPlanDto) {}
