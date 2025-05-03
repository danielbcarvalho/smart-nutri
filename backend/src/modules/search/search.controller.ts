import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Busca global por pacientes e planos alimentares' })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: 'Termo de busca (mínimo 3 caracteres)',
  })
  @ApiResponse({
    status: 200,
    description:
      'Retorna uma lista combinada de pacientes e planos alimentares',
  })
  async search(@Query('q') query: string) {
    return this.searchService.search(query);
  }
}
