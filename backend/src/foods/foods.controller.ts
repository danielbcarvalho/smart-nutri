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
  NotFoundException,
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
import { SaveTbcaFoodDto } from './dto/save-api-food.dto';
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

  @Post('save-from-tbca')
  @ApiOperation({
    summary: 'Salvar um alimento da TBCA no banco de dados local',
    description:
      'Importa um alimento da base TBCA e salva no banco de dados local',
  })
  @ApiResponse({
    status: 201,
    description: 'Alimento importado com sucesso',
    type: Food,
  })
  @ApiResponse({
    status: 404,
    description: 'Alimento não encontrado na base TBCA',
  })
  saveFromTbca(@Body() saveTbcaFoodDto: SaveTbcaFoodDto) {
    return this.foodsService.saveFromApi(saveTbcaFoodDto.codigo);
  }

  @Post('save-from-api')
  @ApiOperation({
    summary: 'Salvar um alimento da TBCA (compatibilidade)',
    description:
      'Endpoint mantido para compatibilidade com clientes existentes. Usar save-from-tbca',
  })
  @ApiResponse({
    status: 201,
    description: 'Alimento importado com sucesso',
    type: Food,
  })
  @ApiResponse({
    status: 404,
    description: 'Alimento não encontrado na base TBCA',
  })
  saveFromApi(@Body() saveTbcaFoodDto: SaveTbcaFoodDto) {
    return this.foodsService.saveFromApi(saveTbcaFoodDto.codigo);
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

  @Get('tbca/:codigo')
  @ApiOperation({
    summary: 'Buscar alimento do TBCA por código',
    description: 'Retorna os detalhes de um alimento da base TBCA pelo código',
  })
  @ApiParam({
    name: 'codigo',
    description: 'Código do alimento na TBCA',
    example: 'C0001',
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
  async findByTbcaCode(@Param('codigo') codigo: string) {
    const food = await this.foodsService.findByTbcaCode(codigo);
    if (!food) {
      throw new NotFoundException(
        `Alimento com código ${codigo} não encontrado na TBCA`,
      );
    }
    return food;
  }

  @Get('tbca/class/:classe')
  @ApiOperation({
    summary: 'Buscar alimentos do TBCA por classe',
    description:
      'Retorna alimentos da base TBCA que pertencem a uma determinada classe',
  })
  @ApiParam({
    name: 'classe',
    description: 'Classe de alimentos na TBCA',
    example: 'Cereais e derivados',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Limite de resultados',
    type: Number,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Offset para paginação',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Alimentos encontrados',
    type: [Food],
  })
  findByClass(
    @Param('classe') classe: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.foodsService.findByClass(classe, limit, offset);
  }

  @Get('tbca/nutrient/:nutrient')
  @ApiOperation({
    summary: 'Buscar alimentos do TBCA por faixa de nutriente',
    description:
      'Retorna alimentos da base TBCA com valores de nutrientes dentro de uma faixa',
  })
  @ApiParam({
    name: 'nutrient',
    description: 'Nome do nutriente',
    example: 'proteina',
  })
  @ApiQuery({
    name: 'min',
    required: false,
    description: 'Valor mínimo',
    type: Number,
  })
  @ApiQuery({
    name: 'max',
    required: false,
    description: 'Valor máximo',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Limite de resultados',
    type: Number,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Offset para paginação',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Alimentos encontrados',
    type: [Food],
  })
  findByNutrientRange(
    @Param('nutrient') nutrient: string,
    @Query('min') minValue?: number,
    @Query('max') maxValue?: number,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.foodsService.findByNutrientRange(
      nutrient,
      minValue,
      maxValue,
      limit,
      offset,
    );
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
