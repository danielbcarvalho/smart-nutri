import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { FoodsService } from './foods.service';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { SearchFoodDto } from './dto/search-food.dto';
import { SaveApiFoodDto } from './dto/save-api-food.dto';
import { Food } from './entities/food.entity';

@ApiTags('foods')
@Controller('foods')
export class FoodsController {
  constructor(private readonly foodsService: FoodsService) {}

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
  create(@Body() createFoodDto: CreateFoodDto): Promise<Food> {
    return this.foodsService.create(createFoodDto);
  }

  @Post('save-from-api')
  @ApiOperation({
    summary: 'Salvar um alimento da API no banco de dados local',
    description:
      'Importa um alimento da API externa e salva no banco de dados local',
  })
  @ApiResponse({
    status: 201,
    description: 'Alimento importado com sucesso',
    type: Food,
  })
  @ApiResponse({
    status: 404,
    description: 'Alimento não encontrado na API externa',
  })
  saveFromApi(@Body() saveApiFoodDto: SaveApiFoodDto) {
    return this.foodsService.saveFromApi(saveApiFoodDto.externalId);
  }

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

  @Get('search')
  @ApiOperation({
    summary: 'Pesquisar alimentos',
    description: 'Pesquisa alimentos por nome ou descrição',
  })
  @ApiQuery({ name: 'query', required: false, description: 'Termo de busca' })
  @ApiResponse({
    status: 200,
    description: 'Resultados da pesquisa',
    type: [Food],
  })
  search(@Query() searchFoodDto: SearchFoodDto) {
    return this.foodsService.search(searchFoodDto);
  }

  @Get('favorites')
  @ApiOperation({
    summary: 'Listar alimentos favoritos',
    description: 'Retorna a lista de alimentos marcados como favoritos',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de favoritos retornada com sucesso',
    type: [Food],
  })
  getFavorites() {
    return this.foodsService.getFavorites();
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
