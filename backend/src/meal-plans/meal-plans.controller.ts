import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { MealPlansService } from './meal-plans.service';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';
import { CreateMealDto } from './dto/create-meal.dto';
import { MealPlan } from './entities/meal-plan.entity';
import { Meal } from './entities/meal.entity';

@ApiTags('meal-plans')
@Controller('meal-plans')
export class MealPlansController {
  constructor(private readonly mealPlansService: MealPlansService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar um novo plano alimentar',
    description:
      'Cria um novo plano alimentar para um paciente com suas refeições',
  })
  @ApiBody({ type: CreateMealPlanDto })
  @ApiResponse({
    status: 201,
    description: 'Plano alimentar criado com sucesso',
    type: MealPlan,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos fornecidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Paciente não encontrado',
  })
  create(@Body() createMealPlanDto: CreateMealPlanDto) {
    return this.mealPlansService.create(createMealPlanDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos os planos alimentares',
    description: 'Retorna uma lista de todos os planos alimentares cadastrados',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de planos alimentares retornada com sucesso',
    type: [MealPlan],
  })
  findAll() {
    return this.mealPlansService.findAll();
  }

  @Get('patient/:patientId')
  @ApiOperation({
    summary: 'Buscar planos por paciente',
    description:
      'Retorna todos os planos alimentares de um paciente específico',
  })
  @ApiParam({
    name: 'patientId',
    description: 'ID do paciente',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de planos alimentares do paciente',
    type: [MealPlan],
  })
  @ApiResponse({
    status: 404,
    description: 'Paciente não encontrado',
  })
  findByPatient(@Param('patientId') patientId: string) {
    return this.mealPlansService.findByPatient(patientId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar plano por ID',
    description: 'Retorna os detalhes de um plano alimentar específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do plano alimentar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Plano alimentar encontrado',
    type: MealPlan,
  })
  @ApiResponse({
    status: 404,
    description: 'Plano alimentar não encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.mealPlansService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar plano alimentar',
    description: 'Atualiza as informações de um plano alimentar existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do plano alimentar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateMealPlanDto })
  @ApiResponse({
    status: 200,
    description: 'Plano alimentar atualizado com sucesso',
    type: MealPlan,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos fornecidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Plano alimentar não encontrado',
  })
  update(
    @Param('id') id: string,
    @Body() updateMealPlanDto: UpdateMealPlanDto,
  ) {
    return this.mealPlansService.update(id, updateMealPlanDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remover plano alimentar',
    description: 'Remove um plano alimentar do sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do plano alimentar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Plano alimentar removido com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Plano alimentar não encontrado',
  })
  remove(@Param('id') id: string) {
    return this.mealPlansService.remove(id);
  }

  @Post(':id/meals')
  @ApiOperation({
    summary: 'Adicionar refeição',
    description: 'Adiciona uma nova refeição a um plano alimentar existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do plano alimentar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: CreateMealDto })
  @ApiResponse({
    status: 201,
    description: 'Refeição adicionada com sucesso',
    type: Meal,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos fornecidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Plano alimentar não encontrado',
  })
  async addMeal(@Param('id') id: string, @Body() createMealDto: CreateMealDto) {
    return this.mealPlansService.addMeal(id, createMealDto);
  }
}
