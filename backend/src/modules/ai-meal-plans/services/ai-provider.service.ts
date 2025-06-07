import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

import { AiProviderInterface, AiGenerationContext, AiGenerationResult } from '../interfaces/ai-provider.interface';
import { AiPatientDataDto } from '../dto/ai-patient-data.dto';
import { AiConfigurationDto } from '../dto/ai-meal-plan-request.dto';
import { AiMealPlanResponseDto } from '../dto/ai-meal-plan-response.dto';

@Injectable()
export class AiProviderService implements AiProviderInterface {
  private readonly logger = new Logger(AiProviderService.name);
  private readonly aiClient: AxiosInstance;
  private readonly provider: string;
  private readonly apiKey: string;
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    this.provider = this.configService.get<string>('AI_SERVICE_PROVIDER', 'openrouter');
    this.apiKey = this.configService.get<string>('OPENROUTER_API_KEY') ?? 
                  this.configService.get<string>('CLAUDE_API_KEY') ?? 
                  this.configService.get<string>('OPENAI_API_KEY') ?? '';
    this.timeout = this.configService.get<number>('AI_SERVICE_TIMEOUT', 30000);
    this.maxRetries = this.configService.get<number>('AI_MAX_RETRIES', 3);
    this.model = this.configService.get<string>('AI_MODEL', 'anthropic/claude-3.5-sonnet');

    // Initialize OpenRouter client
    this.aiClient = axios.create({
      baseURL: 'https://openrouter.ai/api/v1',
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'https://smart-nutri.com',
        'X-Title': 'SmartNutri AI Meal Plans',
      },
    });

    this.logger.log(`AI Provider initialized: ${this.provider} with model: ${this.model}`);
  }

  async generateMealPlan(
    patientData: AiPatientDataDto,
    configuration: AiConfigurationDto,
    foodDatabase: any[],
  ): Promise<AiMealPlanResponseDto> {
    const startTime = Date.now();
    
    try {
      this.logger.log('Starting AI meal plan generation');
      
      if (!this.isAvailable()) {
        throw new BadRequestException('AI service is not properly configured');
      }

      // Create the prompt for AI
      const prompt = this.createAiPrompt(patientData, configuration, foodDatabase);
      
      // Call AI API
      const { response, metadata } = await this.callAiApi(prompt);
      
      // Parse and validate response
      const mealPlan = this.parseAiResponse(response, prompt, metadata, Date.now() - startTime);
      
      const generationTime = Date.now() - startTime;
      this.logger.log(`AI meal plan generated successfully in ${generationTime}ms`);
      
      return mealPlan;
      
    } catch (error) {
      this.logger.error('Failed to generate AI meal plan:', error.message);
      throw error;
    }
  }

  private createAiPrompt(
    patientData: AiPatientDataDto,
    configuration: AiConfigurationDto,
    foodDatabase: any[],
  ): string {
    const patient = patientData.patient;
    const measurement = patientData.latestMeasurement;
    const energyPlan = patientData.energyPlan;
    
    // Calculate basic metrics
    const age = this.calculateAge(patient.birthDate);
    const bmi = measurement ? (measurement.weight / (measurement.height * measurement.height)).toFixed(1) : 'N/A';
    const targetCalories = energyPlan?.tee || this.estimateCalories(patient.gender, age, measurement?.weight, measurement?.height);

    const foodSample = foodDatabase.slice(0, 50).map(food => 
      `${food.name} (${food.calories}kcal/100g, Prot: ${food.protein}g, Carb: ${food.carbohydrates}g, Gord: ${food.fat}g)`
    ).join('\n');

    return `Você é um nutricionista especialista usando o sistema SmartNutri. Crie um plano alimentar personalizado baseado nos dados do paciente e configurações.

DADOS DO PACIENTE:
- Nome: ${patient.name}
- Idade: ${age} anos
- Sexo: ${patient.gender === 'M' ? 'Masculino' : 'Feminino'}
- Peso: ${measurement?.weight || 'N/A'} kg
- Altura: ${measurement?.height || 'N/A'} m
- IMC: ${bmi}
- Calorias alvo: ${Math.round(targetCalories)} kcal/dia
- Telefone: ${patient.phone || 'Não informado'}

CONFIGURAÇÕES DA IA:
- Objetivo: ${configuration.objective}
- Detalhes: ${configuration.objectiveDetails || 'Não especificado'}
- Restrições: ${configuration.restrictions.join(', ') || 'Nenhuma'}
- Restrições customizadas: ${configuration.customRestrictions || 'Nenhuma'}
- Refeições por dia: ${configuration.mealsPerDay}
- Complexidade: ${configuration.complexity}
- Orçamento: ${configuration.budget || 'Não especificado'}
- Exercícios: ${configuration.exerciseRoutine || 'Não informado'}
- Intensidade: ${configuration.exerciseIntensity || 'Não informado'}
- Equipamentos: ${configuration.kitchenEquipment.join(', ') || 'Básicos'}

AMOSTRA DA BASE DE ALIMENTOS TBCA DISPONÍVEL:
${foodSample}

INSTRUÇÕES:
1. Crie um plano alimentar para 7 dias
2. Use APENAS alimentos da base TBCA fornecida
3. Distribua as calorias em ${configuration.mealsPerDay} refeições
4. Respeite todas as restrições alimentares
5. Considere o objetivo nutricional
6. Use quantidades realistas e práticas
7. Varie os alimentos entre os dias

FORMATO DE RESPOSTA (JSON):
{
  "mealPlan": {
    "title": "Plano Alimentar - [Nome do Paciente]",
    "description": "Descrição do plano baseada no objetivo",
    "startDate": "2024-06-06",
    "endDate": "2024-06-13",
    "meals": [
      {
        "name": "Café da Manhã",
        "time": "08:00",
        "foods": [
          {
            "foodId": "food-id-from-database",
            "name": "Nome exato do alimento da base",
            "quantity": 40,
            "unit": "g",
            "calories": 152,
            "protein": 5.4,
            "carbohydrates": 27.6,
            "fat": 2.8
          }
        ]
      }
    ]
  },
  "nutritionalSummary": {
    "totalCalories": 1800,
    "protein": 135,
    "carbohydrates": 202,
    "fat": 60
  },
  "alternatives": [
    {
      "mealName": "Café da Manhã",
      "alternatives": ["Granola sem açúcar", "Quinoa em flocos"]
    }
  ],
  "notes": [
    "Beber 2L de água ao longo do dia",
    "Consumir refeições nos horários indicados"
  ],
  "aiInsights": [
    "Plano balanceado com distribuição adequada de macronutrientes",
    "Alimentos selecionados com base nas preferências do paciente"
  ]
}

Responda APENAS com o JSON válido, sem comentários adicionais.`;
  }

  private async callAiApi(prompt: string): Promise<{ response: string; metadata: any }> {
    try {
      const response = await this.aiClient.post('/chat/completions', {
        model: this.model,
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      });

      const metadata = {
        tokensUsed: response.data.usage?.total_tokens || 0,
        promptTokens: response.data.usage?.prompt_tokens || 0,
        completionTokens: response.data.usage?.completion_tokens || 0,
        model: response.data.model || this.model,
        finishReason: response.data.choices[0]?.finish_reason,
        responseId: response.data.id,
      };

      return {
        response: response.data.choices[0].message.content,
        metadata,
      };
    } catch (error) {
      this.logger.error('AI API call failed:', error.response?.data || error.message);
      
      if (error.response?.status === 429) {
        throw new BadRequestException('AI service rate limit exceeded. Please try again in a few minutes.');
      }
      
      if (error.response?.status === 401) {
        throw new BadRequestException('AI service authentication failed. Please check configuration.');
      }
      
      throw new BadRequestException('AI service is temporarily unavailable. Please try again later.');
    }
  }

  private parseAiResponse(response: string, prompt: string, metadata: any, generationTime: number): AiMealPlanResponseDto {
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!parsed.mealPlan || !parsed.nutritionalSummary) {
        throw new Error('Invalid AI response structure');
      }

      return {
        id: `ai-plan-${Date.now()}`,
        mealPlan: parsed.mealPlan,
        nutritionalSummary: parsed.nutritionalSummary,
        alternatives: parsed.alternatives || [],
        notes: parsed.notes || [],
        aiInsights: parsed.aiInsights || [],
        generatedAt: new Date(),
        reasoning: {
          prompt,
          rawResponse: response,
          tokensUsed: metadata.tokensUsed,
          model: metadata.model || this.model,
          provider: this.provider,
          generationTime,
          metadata,
        },
      };
    } catch (error) {
      this.logger.error('Failed to parse AI response:', error.message);
      this.logger.debug('Raw AI response:', response);
      throw new BadRequestException('AI generated an invalid response. Please try again.');
    }
  }

  private calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  private estimateCalories(gender: string, age: number, weight?: number, height?: number): number {
    // Mifflin-St Jeor equation estimate if no energy plan
    if (!weight || !height) {
      return gender === 'M' ? 2000 : 1600; // Default estimates
    }

    let bmr: number;
    if (gender === 'M') {
      bmr = (10 * weight) + (6.25 * height * 100) - (5 * age) + 5;
    } else {
      bmr = (10 * weight) + (6.25 * height * 100) - (5 * age) - 161;
    }

    // Apply moderate activity factor
    return Math.round(bmr * 1.55);
  }

  getProviderName(): string {
    return this.provider;
  }

  isAvailable(): boolean {
    return !!this.apiKey && (this.provider === 'openrouter' || this.provider === 'claude');
  }

  async generateWithRetry(context: AiGenerationContext): Promise<AiGenerationResult> {
    const startTime = Date.now();
    let lastError: Error = new Error('No attempts made');

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.logger.log(`AI generation attempt ${attempt}/${this.maxRetries}`);
        
        const result = await this.generateMealPlan(
          context.patientData,
          context.configuration,
          context.foodDatabase,
        );

        return {
          success: true,
          data: result,
          provider: this.getProviderName(),
          generationTime: Date.now() - startTime,
        };
      } catch (error) {
        lastError = error;
        this.logger.warn(`AI generation attempt ${attempt} failed:`, error.message);
        
        if (attempt < this.maxRetries) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    return {
      success: false,
      error: lastError.message,
      provider: this.getProviderName(),
      generationTime: Date.now() - startTime,
    };
  }
}