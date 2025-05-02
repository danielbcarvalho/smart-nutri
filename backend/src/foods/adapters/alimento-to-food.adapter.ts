import { Alimento } from '../schemas/alimento.schema';
import { Food } from '../entities/food.entity';

export class AlimentoToFoodAdapter {
  static adapt(alimento: Alimento): Food {
    const food = new Food();

    // Mapeamento de campos básicos
    food.externalId = alimento.codigo;
    food.name = alimento.descricao;
    food.servingSize = 100; // TBCA usa 100g como padrão
    food.servingUnit = 'g';

    // Nutrientes básicos
    food.calories = this.parseNutrientValue(
      alimento.nutrientes?.energia_kcal?.valor,
    );
    food.protein = this.parseNutrientValue(
      alimento.nutrientes?.proteina?.valor,
    );
    food.carbohydrates = this.parseNutrientValue(
      alimento.nutrientes?.carboidrato_total?.valor,
    );
    food.fat = this.parseNutrientValue(alimento.nutrientes?.lipidios?.valor);
    food.fiber = this.parseNutrientValue(
      alimento.nutrientes?.fibra_alimentar?.valor,
    );
    food.sugar = this.parseNutrientValue(alimento.nutrientes?.acucares?.valor);
    food.sodium = this.parseNutrientValue(alimento.nutrientes?.sodio?.valor);

    // Categorias baseadas na classe
    food.categories = [alimento.classe];
    food.source = 'TBCA';
    food.sourceId = alimento.codigo;

    // Metadados adicionais
    food.additionalNutrients = this.extractAdditionalNutrients(alimento);

    return food;
  }

  private static parseNutrientValue(
    value: number | string | undefined,
  ): number {
    if (value === undefined || value === null) {
      return 0;
    }

    if (typeof value === 'string') {
      // Remove 'tr' (traços) e converte para número
      if (value.toLowerCase() === 'tr') {
        return 0;
      }
      return parseFloat(value) || 0;
    }

    return value || 0;
  }

  private static extractAdditionalNutrients(
    alimento: Alimento,
  ): Record<string, number> {
    const additionalNutrients: Record<string, number> = {};

    // Extrai nutrientes que não são mapeados diretamente para campos da entidade Food
    const skipNutrients = [
      'energia_kcal',
      'proteina',
      'carboidrato_total',
      'lipidios',
      'fibra_alimentar',
      'acucares',
      'sodio',
    ];

    if (alimento.nutrientes) {
      Object.entries(alimento.nutrientes).forEach(([key, nutriente]) => {
        if (!skipNutrients.includes(key) && nutriente?.valor !== undefined) {
          additionalNutrients[key] = this.parseNutrientValue(nutriente.valor);
        }
      });
    }

    return additionalNutrients;
  }
}
