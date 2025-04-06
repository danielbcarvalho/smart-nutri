import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  OpenFoodFactsProduct,
  OpenFoodFactsSearchResponse,
} from '../interfaces/openfoodfacts.interface';

@Injectable()
export class OpenFoodFactsService {
  private readonly logger = new Logger(OpenFoodFactsService.name);
  private readonly baseUrl = 'https://world.openfoodfacts.org/api/v2';

  constructor(private readonly httpService: HttpService) {}

  async searchFoods(
    query: string,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<OpenFoodFactsSearchResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<OpenFoodFactsSearchResponse>(`${this.baseUrl}/search`, {
          params: {
            search_terms: query,
            fields: 'product_name,nutriments,categories_tags',
            page_size: pageSize,
            page,
          },
        }),
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Error searching foods: ${error.message}`);
      throw new Error(`Failed to search foods: ${error.message}`);
    }
  }

  async getFood(id: string): Promise<OpenFoodFactsProduct> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<{ product: OpenFoodFactsProduct }>(
          `${this.baseUrl}/product/${id}`,
        ),
      );

      return response.data.product;
    } catch (error) {
      this.logger.error(`Error getting food: ${error.message}`);
      throw new Error(`Failed to get food: ${error.message}`);
    }
  }
}
