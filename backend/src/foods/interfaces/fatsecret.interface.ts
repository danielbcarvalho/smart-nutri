export interface FatSecretServing {
  serving_id: string;
  metric_serving_amount: string;
  metric_serving_unit: string;
  calories: string;
  protein: string;
  carbohydrate: string;
  fat: string;
  fiber?: string;
  sugar?: string;
  sodium?: string;
}

export interface FatSecretFood {
  food_id: string;
  food_name: string;
  food_type: string;
  food_url: string;
  servings: {
    serving: FatSecretServing | FatSecretServing[];
  };
}

export interface FatSecretSearchResponse {
  foods: {
    food: FatSecretFood[];
    max_results: string;
    page_number: string;
    total_results: string;
  };
}

export interface FatSecretGetResponse {
  food: FatSecretFood;
}
