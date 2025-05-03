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
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { FoodsService } from './foods.service';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { Food } from './entities/food.entity';

@ApiTags('foods')
@Controller('foods')
export class FoodsController {
  constructor(private readonly foodsService: FoodsService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar todos os alimentos',
    description: 'Retorna uma lista paginada de todos os alimentos cadastrados',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de alimentos retornada com sucesso',
    type: [Food],
  })
  findAll() {
    return this.foodsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar alimento por ID',
    description: 'Retorna os detalhes de um alimento específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do alimento',
    example: '123e4567-e89b-12d3-a456-426614174000',
    schema: {
      type: 'string',
      format: 'uuid',
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Alimento encontrado',
    type: Food,
  })
  @ApiResponse({
    status: 404,
    description: 'Alimento não encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.foodsService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Criar um novo alimento manualmente',
    description:
      'Cria um novo alimento no banco de dados local com informações nutricionais detalhadas',
  })
  @ApiResponse({
    status: 201,
    description: 'Alimento criado com sucesso',
    type: Food,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos fornecidos',
  })
  create(@Body() createFoodDto: CreateFoodDto) {
    return this.foodsService.create(createFoodDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar alimento',
    description: 'Atualiza as informações de um alimento existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do alimento',
    example: '123e4567-e89b-12d3-a456-426614174000',
    schema: {
      type: 'string',
      format: 'uuid',
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Alimento atualizado com sucesso',
    type: Food,
  })
  @ApiResponse({
    status: 404,
    description: 'Alimento não encontrado',
  })
  update(@Param('id') id: string, @Body() updateFoodDto: UpdateFoodDto) {
    return this.foodsService.update(id, updateFoodDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remover alimento',
    description: 'Remove um alimento do banco de dados',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do alimento',
    example: '123e4567-e89b-12d3-a456-426614174000',
    schema: {
      type: 'string',
      format: 'uuid',
    },
  })
  @ApiResponse({
    status: 204,
    description: 'Alimento removido com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Alimento não encontrado',
  })
  remove(@Param('id') id: string) {
    return this.foodsService.remove(id);
  }

  @Post(':id/favorite')
  @ApiOperation({
    summary: 'Alternar favorito',
    description: 'Marca ou desmarca um alimento como favorito',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do alimento',
    example: '123e4567-e89b-12d3-a456-426614174000',
    schema: {
      type: 'string',
      format: 'uuid',
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Status de favorito alterado com sucesso',
    type: Food,
  })
  @ApiResponse({
    status: 404,
    description: 'Alimento não encontrado',
  })
  toggleFavorite(@Param('id') id: string) {
    return this.foodsService.toggleFavorite(id);
  }
}
