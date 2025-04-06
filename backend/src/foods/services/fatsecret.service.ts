import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as FatSecret from 'fatsecret';
import {
  FatSecretFood,
  FatSecretSearchResponse,
  FatSecretGetResponse,
  FatSecretServing,
} from '../interfaces/fatsecret.interface';

interface FatSecretClient {
  method(
    method: string,
    params: Record<string, string | number>,
    callback: (error: Error | null, response: any) => void,
  ): void;
}

@Injectable()
export class FatSecretService {
  private readonly client: FatSecretClient;
  private readonly logger = new Logger(FatSecretService.name);

  constructor(private configService: ConfigService) {
    const clientId = this.configService.get<string>('FATSECRET_CLIENT_ID');
    const clientSecret = this.configService.get<string>('FATSECRET_CLIENT_SECRET');

    this.logger.debug('Iniciando FatSecret Service');
    this.logger.debug(`Client ID configurado: ${!!clientId}`);
    this.logger.debug(`Client Secret configurado: ${!!clientSecret}`);

    if (!clientId || !clientSecret) {
      this.logger.error('FatSecret API credentials are not configured');
      throw new Error('FatSecret API credentials are not configured');
    }

    this.client = new FatSecret(clientId, clientSecret) as FatSecretClient;
    this.logger.debug('FatSecret client inicializado');
  }

  async searchFoods(
    query: string,
    pageNumber: number = 0,
    maxResults: number = 20,
  ): Promise<FatSecretSearchResponse> {
    try {
      return await new Promise((resolve, reject) => {
        this.client.method(
          'foods.search',
          {
            search_expression: query,
            page_number: pageNumber,
            max_results: maxResults,
          },
          (error: Error | null, response: FatSecretSearchResponse) => {
            if (error) {
              reject(new Error(`FatSecret API Error: ${error.message}`));
              return;
            }
            resolve(response);
          },
        );
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error searching foods: ${message}`);
      throw error;
    }
  }

  async getFoodDetails(foodId: string): Promise<FatSecretGetResponse> {
    try {
      return await new Promise((resolve, reject) => {
        this.client.method(
          'food.get',
          {
            food_id: foodId,
          },
          (error: Error | null, response: FatSecretGetResponse) => {
            if (error) {
              reject(new Error(`FatSecret API Error: ${error.message}`));
              return;
            }
            resolve(response);
          },
        );
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error getting food details: ${message}`);
      throw error;
    }
  }

  private parseNutritionalInfo(fatSecretFood: FatSecretFood) {
    const servings = fatSecretFood.servings.serving;
    const serving: FatSecretServing = Array.isArray(servings)
      ? servings[0]
      : servings;

    return {
      servingSize: parseFloat(serving.metric_serving_amount || '0'),
      servingUnit: serving.metric_serving_unit || 'g',
      calories: parseFloat(serving.calories || '0'),
      protein: parseFloat(serving.protein || '0'),
      carbohydrates: parseFloat(serving.carbohydrate || '0'),
      fat: parseFloat(serving.fat || '0'),
      fiber: parseFloat(serving.fiber || '0'),
      sugar: parseFloat(serving.sugar || '0'),
      sodium: parseFloat(serving.sodium || '0'),
    };
  }
}
