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
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MealPlansService } from '../services/meal-plans.service';
import { CreateMealPlanDto } from '../dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from '../dto/update-meal-plan.dto';
import { CreateMealDto } from '../dto/create-meal.dto';
import { MealPlan } from '../entities/meal-plan.entity';
import { Meal } from '../entities/meal.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';

interface RequestWithUser extends Request {
  user: {
    id: string;
  };
}

@ApiTags('meal-plans')
@Controller('meal-plans')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
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
  create(
    @Body() createMealPlanDto: CreateMealPlanDto,
    @Request() req: RequestWithUser,
  ) {
    return this.mealPlansService.create(createMealPlanDto, req.user.id);
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
  @ApiQuery({
    name: 'patientId',
    required: false,
    type: String,
    description: 'ID do paciente para filtrar os planos',
  })
  findAll(
    @Request() req: RequestWithUser,
    @Query('patientId') patientId?: string,
  ) {
    if (patientId) {
      return this.mealPlansService.findByPatient(patientId, req.user.id);
    }
    return this.mealPlansService.findAll(req.user.id);
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
    schema: {
      type: 'string',
      format: 'uuid',
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de planos alimentares retornada com sucesso',
    type: [MealPlan],
  })
  @ApiResponse({
    status: 404,
    description: 'Paciente não encontrado',
  })
  findByPatient(
    @Param('patientId') patientId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.mealPlansService.findByPatient(patientId, req.user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar plano alimentar por ID',
    description: 'Retorna os detalhes de um plano alimentar específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do plano alimentar',
    example: '123e4567-e89b-12d3-a456-426614174000',
    schema: {
      type: 'string',
      format: 'uuid',
    },
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
  findOne(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.mealPlansService.findOne(id, req.user.id);
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
    schema: {
      type: 'string',
      format: 'uuid',
    },
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
    @Request() req: RequestWithUser,
  ) {
    return this.mealPlansService.update(id, updateMealPlanDto, req.user.id);
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
    schema: {
      type: 'string',
      format: 'uuid',
    },
  })
  @ApiResponse({
    status: 204,
    description: 'Plano alimentar removido com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Plano alimentar não encontrado',
  })
  remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.mealPlansService.remove(id, req.user.id);
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
    schema: {
      type: 'string',
      format: 'uuid',
    },
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
  addMeal(
    @Param('id') id: string,
    @Body() createMealDto: CreateMealDto,
    @Request() req: RequestWithUser,
  ) {
    return this.mealPlansService.addMeal(id, createMealDto, req.user.id);
  }

  @Get(':id/meals')
  @ApiOperation({
    summary: 'Listar refeições do plano',
    description:
      'Retorna uma lista de refeições de um plano alimentar específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do plano alimentar',
    example: '123e4567-e89b-12d3-a456-426614174000',
    schema: {
      type: 'string',
      format: 'uuid',
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de refeições retornada com sucesso',
    type: [Meal],
  })
  @ApiResponse({
    status: 404,
    description: 'Plano alimentar não encontrado',
  })
  getMeals(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.mealPlansService.getMeals(id, req.user.id);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Buscar planos de alimentação',
    description: 'Busca planos de alimentação por nome',
  })
  @ApiQuery({
    name: 'query',
    required: true,
    type: String,
    description: 'Termo de busca (nome do plano)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de planos encontrados',
    type: [MealPlan],
  })
  search(@Query('q') query: string, @CurrentUser() user: AuthenticatedUser) {
    return this.mealPlansService.search(query, user.id);
  }
}
