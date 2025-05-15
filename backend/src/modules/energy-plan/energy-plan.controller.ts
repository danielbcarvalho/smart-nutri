import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EnergyPlanService } from './energy-plan.service';
import {
  CreateEnergyPlanDto,
  UpdateEnergyPlanDto,
  QueryEnergyPlanDto,
  EnergyPlanResponseDto,
} from './dto';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/guards/roles.guard';
import { Roles } from '../../modules/auth/decorators/roles.decorator';
import { UserRole } from '../../modules/auth/enums/user-role.enum';

@ApiTags('energy-plans')
@Controller('energy-plans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnergyPlanController {
  constructor(private readonly energyPlanService: EnergyPlanService) {}

  @Post()
  @Roles(UserRole.NUTRITIONIST)
  @ApiOperation({ summary: 'Create a new energy plan' })
  @ApiResponse({
    status: 201,
    description: 'The energy plan has been successfully created.',
    type: EnergyPlanResponseDto,
  })
  create(@Body() createEnergyPlanDto: CreateEnergyPlanDto) {
    return this.energyPlanService.create(createEnergyPlanDto);
  }

  @Get()
  @Roles(UserRole.NUTRITIONIST, UserRole.PATIENT)
  @ApiOperation({ summary: 'Get all energy plans' })
  @ApiResponse({
    status: 200,
    description: 'Return all energy plans.',
    type: [EnergyPlanResponseDto],
  })
  findAll(@Query() query: QueryEnergyPlanDto) {
    return this.energyPlanService.findAll(query);
  }

  @Get(':id')
  @Roles(UserRole.NUTRITIONIST, UserRole.PATIENT)
  @ApiOperation({ summary: 'Get an energy plan by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the energy plan.',
    type: EnergyPlanResponseDto,
  })
  findOne(@Param('id') id: string) {
    return this.energyPlanService.findOne(id);
  }

  @Get('patient/:patientId')
  @Roles(UserRole.NUTRITIONIST, UserRole.PATIENT)
  @ApiOperation({ summary: 'Get energy plans by patient id' })
  @ApiResponse({
    status: 200,
    description: 'Return the energy plans for the patient.',
    type: [EnergyPlanResponseDto],
  })
  findByPatient(@Param('patientId') patientId: string) {
    return this.energyPlanService.findByPatient(patientId);
  }

  @Get('consultation/:consultationId')
  @Roles(UserRole.NUTRITIONIST, UserRole.PATIENT)
  @ApiOperation({ summary: 'Get energy plans by consultation id' })
  @ApiResponse({
    status: 200,
    description: 'Return the energy plans for the consultation.',
    type: [EnergyPlanResponseDto],
  })
  findByConsultation(@Param('consultationId') consultationId: string) {
    return this.energyPlanService.findByConsultation(consultationId);
  }

  @Patch(':id')
  @Roles(UserRole.NUTRITIONIST)
  @ApiOperation({ summary: 'Update an energy plan' })
  @ApiResponse({
    status: 200,
    description: 'The energy plan has been successfully updated.',
    type: EnergyPlanResponseDto,
  })
  update(
    @Param('id') id: string,
    @Body() updateEnergyPlanDto: UpdateEnergyPlanDto,
  ) {
    return this.energyPlanService.update(id, updateEnergyPlanDto);
  }

  @Delete(':id')
  @Roles(UserRole.NUTRITIONIST)
  @ApiOperation({ summary: 'Delete an energy plan' })
  @ApiResponse({
    status: 200,
    description: 'The energy plan has been successfully deleted.',
  })
  remove(@Param('id') id: string) {
    return this.energyPlanService.remove(id);
  }
}
