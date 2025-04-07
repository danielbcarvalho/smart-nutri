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
import { NutritionistsService } from './nutritionists.service';
import { CreateNutritionistDto } from './dto/create-nutritionist.dto';
import { UpdateNutritionistDto } from './dto/update-nutritionist.dto';
import { Nutritionist } from './entities/nutritionist.entity';

@ApiTags('nutritionists')
@Controller('nutritionists')
export class NutritionistsController {
  constructor(private readonly nutritionistsService: NutritionistsService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar nutricionista',
    description: 'Cria um novo nutricionista no sistema',
  })
  @ApiBody({ type: CreateNutritionistDto })
  @ApiResponse({
    status: 201,
    description: 'Nutricionista criado com sucesso',
    type: Nutritionist,
  })
  @ApiResponse({
    status: 409,
    description: 'Email já cadastrado',
  })
  create(@Body() createNutritionistDto: CreateNutritionistDto) {
    return this.nutritionistsService.create(createNutritionistDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar nutricionistas',
    description: 'Retorna a lista de todos os nutricionistas',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de nutricionistas',
    type: [Nutritionist],
  })
  findAll() {
    return this.nutritionistsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar nutricionista',
    description: 'Retorna os detalhes de um nutricionista específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do nutricionista',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Nutricionista encontrado',
    type: Nutritionist,
  })
  @ApiResponse({
    status: 404,
    description: 'Nutricionista não encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.nutritionistsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar nutricionista',
    description: 'Atualiza os dados de um nutricionista específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do nutricionista',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateNutritionistDto })
  @ApiResponse({
    status: 200,
    description: 'Nutricionista atualizado com sucesso',
    type: Nutritionist,
  })
  @ApiResponse({
    status: 404,
    description: 'Nutricionista não encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Email já cadastrado',
  })
  update(
    @Param('id') id: string,
    @Body() updateNutritionistDto: UpdateNutritionistDto,
  ) {
    return this.nutritionistsService.update(id, updateNutritionistDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remover nutricionista',
    description: 'Remove um nutricionista do sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do nutricionista',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Nutricionista removido com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Nutricionista não encontrado',
  })
  remove(@Param('id') id: string) {
    return this.nutritionistsService.remove(id);
  }
}
