import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MealPlansService } from './meal-plans.service';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';
import { CreateMealDto } from './dto/create-meal.dto';
import { MealPlan } from './entities/meal-plan.entity';
import { Meal } from './entities/meal.entity';

interface ErrorResponse {
  message?: string;
  response?: {
    message?: string | string[];
  };
}

@ApiTags('meal-plans')
@Controller('meal-plans')
export class MealPlansController {
  constructor(private readonly mealPlansService: MealPlansService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo plano alimentar' })
  @ApiResponse({
    status: 201,
    description: 'Plano alimentar criado com sucesso',
    type: MealPlan,
  })
  create(@Body() createMealPlanDto: CreateMealPlanDto) {
    return this.mealPlansService.create(createMealPlanDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os planos alimentares' })
  @ApiResponse({
    status: 200,
    description: 'Lista de planos alimentares',
    type: [MealPlan],
  })
  findAll() {
    return this.mealPlansService.findAll();
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Buscar planos alimentares de um paciente' })
  @ApiResponse({
    status: 200,
    description: 'Lista de planos alimentares do paciente',
    type: [MealPlan],
  })
  findByPatient(@Param('patientId') patientId: string) {
    return this.mealPlansService.findByPatient(patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um plano alimentar por ID' })
  @ApiResponse({
    status: 200,
    description: 'Plano alimentar encontrado',
    type: MealPlan,
  })
  findOne(@Param('id') id: string) {
    return this.mealPlansService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um plano alimentar' })
  @ApiResponse({
    status: 200,
    description: 'Plano alimentar atualizado',
    type: MealPlan,
  })
  update(
    @Param('id') id: string,
    @Body() updateMealPlanDto: UpdateMealPlanDto,
  ) {
    return this.mealPlansService.update(id, updateMealPlanDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um plano alimentar' })
  @ApiResponse({
    status: 200,
    description: 'Plano alimentar removido',
  })
  remove(@Param('id') id: string) {
    return this.mealPlansService.remove(id);
  }

  @Post(':id/meals')
  @ApiOperation({ summary: 'Adicionar uma refeição ao plano alimentar' })
  @ApiResponse({
    status: 201,
    description: 'Refeição adicionada com sucesso',
    type: Meal,
  })
  async addMeal(@Param('id') id: string, @Body() createMealDto: CreateMealDto) {
    try {
      console.log('Received meal data:', createMealDto);
      return await this.mealPlansService.addMeal(id, createMealDto);
    } catch (error) {
      const err = error as ErrorResponse;
      console.error('Error adding meal:', err);
      throw new BadRequestException({
        message: 'Erro ao adicionar refeição',
        details: err.message,
        validationErrors: err.response?.message,
      });
    }
  }
}
