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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Criar um novo alimento manualmente' })
  @ApiResponse({
    status: 201,
    description: 'Food item created successfully',
    type: Food,
  })
  create(@Body() createFoodDto: CreateFoodDto): Promise<Food> {
    return this.foodsService.create(createFoodDto);
  }

  @Post('save-from-api')
  @ApiOperation({ summary: 'Salvar um alimento da API no banco de dados local' })
  saveFromApi(@Body() saveApiFoodDto: SaveApiFoodDto) {
    return this.foodsService.saveFromApi(saveApiFoodDto.externalId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all food items' })
  @ApiResponse({
    status: 200,
    description: 'List of all food items',
    type: [Food],
  })
  findAll() {
    return this.foodsService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search food items' })
  @ApiResponse({
    status: 200,
    description: 'Search results from local cache and FatSecret API',
    type: [Food],
  })
  search(@Query() searchFoodDto: SearchFoodDto) {
    return this.foodsService.search(searchFoodDto);
  }

  @Get('favorites')
  @ApiOperation({ summary: 'Get favorite food items' })
  @ApiResponse({
    status: 200,
    description: 'List of favorite food items',
    type: [Food],
  })
  getFavorites() {
    return this.foodsService.getFavorites();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a food item by ID' })
  @ApiResponse({ status: 200, description: 'Food item found', type: Food })
  @ApiResponse({ status: 404, description: 'Food item not found' })
  findOne(@Param('id') id: string) {
    return this.foodsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a food item' })
  @ApiResponse({
    status: 200,
    description: 'Food item updated successfully',
    type: Food,
  })
  update(@Param('id') id: string, @Body() updateFoodDto: UpdateFoodDto) {
    return this.foodsService.update(id, updateFoodDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a food item' })
  @ApiResponse({ status: 204, description: 'Food item deleted successfully' })
  remove(@Param('id') id: string) {
    return this.foodsService.remove(id);
  }

  @Patch(':id/favorite')
  @ApiOperation({ summary: 'Toggle favorite status of a food item' })
  @ApiResponse({
    status: 200,
    description: 'Food item favorite status toggled',
    type: Food,
  })
  toggleFavorite(@Param('id') id: string) {
    return this.foodsService.toggleFavorite(id);
  }
}
