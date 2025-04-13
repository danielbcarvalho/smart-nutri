import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Patient,
  PatientStatus,
  MonitoringStatus,
  ConsultationFrequency,
} from '../entities/patient.entity';
import { Measurement } from '../entities/measurement.entity';
import {
  Consultation,
  ConsultationStatus,
  ConsultationType,
} from '../entities/consultation.entity';
import { MealPlan } from '../../meal-plans/entities/meal-plan.entity';
import { Meal } from '../../meal-plans/entities/meal.entity';
import { MealFood } from '../../meal-plans/entities/meal-food.entity';
import { Food } from '../../foods/entities/food.entity';
import { Gender } from '../enums/gender.enum';

@Injectable()
export class SamplePatientService {
  private readonly logger = new Logger(SamplePatientService.name);

  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Measurement)
    private readonly measurementRepository: Repository<Measurement>,
    @InjectRepository(Consultation)
    private readonly consultationRepository: Repository<Consultation>,
    @InjectRepository(MealPlan)
    private readonly mealPlanRepository: Repository<MealPlan>,
    @InjectRepository(Meal)
    private readonly mealRepository: Repository<Meal>,
    @InjectRepository(MealFood)
    private readonly mealFoodRepository: Repository<MealFood>,
    @InjectRepository(Food)
    private readonly foodRepository: Repository<Food>,
  ) {}

  /**
   * Creates a sample patient for a nutritionist
   * @param nutritionistId The ID of the nutritionist
   * @returns The created sample patient
   */
  async createSamplePatient(nutritionistId: string): Promise<Patient> {
    this.logger.log(
      `Creating sample patient for nutritionist ${nutritionistId}`,
    );

    try {
      // Create sample patient
      const patient = await this.createPatient(nutritionistId);

      // Create sample measurements
      await this.createMeasurements(patient);

      // Create sample consultations
      await this.createConsultations(patient);

      // Create sample meal plan
      await this.createMealPlan(patient);

      this.logger.log(
        `Sample patient created successfully for nutritionist ${nutritionistId}`,
      );

      return patient;
    } catch (error) {
      this.logger.error(
        `Error creating sample patient: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Creates a sample patient with realistic data
   * @param nutritionistId The ID of the nutritionist
   * @returns The created patient
   */
  private async createPatient(nutritionistId: string): Promise<Patient> {
    const patient = this.patientRepository.create({
      name: 'Maria Silva (Exemplo)',
      email: `${Date.now()}@exemplo.com`,
      cpf: undefined, // Not setting a CPF to avoid conflicts
      phone: '(11) 98765-4321',
      address: 'Av. Paulista, 1000, São Paulo - SP',
      birthDate: '1990-05-15',
      gender: Gender.FEMALE,
      instagram: '@maria.exemplo',
      status: PatientStatus.ACTIVE,
      height: 165,
      weight: 68.5,
      goals: ['Perda de peso', 'Alimentação saudável', 'Mais energia'],
      allergies: ['Amendoim'],
      healthConditions: ['Hipotireoidismo'],
      medications: ['Levotiroxina 50mcg'],
      observations:
        'Paciente exemplo criado automaticamente para demonstração do sistema.',
      nutritionistId,
      monitoringStatus: MonitoringStatus.IN_PROGRESS,
      consultationFrequency: ConsultationFrequency.MONTHLY,
      isSample: true, // Mark as sample patient
    });

    return this.patientRepository.save(patient);
  }

  /**
   * Creates sample measurements for a patient
   * @param patient The patient to create measurements for
   */
  private async createMeasurements(patient: Patient): Promise<void> {
    // Create initial measurement (3 months ago)
    const initialDate = new Date();
    initialDate.setMonth(initialDate.getMonth() - 3);

    const initialMeasurement = this.measurementRepository.create({
      date: initialDate,
      weight: 72.5,
      height: 165,
      bodyFat: 32.5,
      fatMass: 23.6,
      muscleMassPercentage: 28.4,
      muscleMass: 20.6,
      visceralFat: 8,
      measurements: {
        waist: 82,
        hip: 105,
        arm: 32,
        thigh: 58,
      },
      patient,
      patientId: patient.id,
      nutritionistId: patient.nutritionistId,
    });

    await this.measurementRepository.save(initialMeasurement);

    // Create follow-up measurement (2 months ago)
    const followUpDate = new Date();
    followUpDate.setMonth(followUpDate.getMonth() - 2);

    const followUpMeasurement = this.measurementRepository.create({
      date: followUpDate,
      weight: 70.8,
      height: 165,
      bodyFat: 31.2,
      fatMass: 22.1,
      muscleMassPercentage: 29.1,
      muscleMass: 20.6,
      visceralFat: 7.5,
      measurements: {
        waist: 80,
        hip: 103,
        arm: 31.5,
        thigh: 57,
      },
      patient,
      patientId: patient.id,
      nutritionistId: patient.nutritionistId,
    });

    await this.measurementRepository.save(followUpMeasurement);

    // Create recent measurement (1 month ago)
    const recentDate = new Date();
    recentDate.setMonth(recentDate.getMonth() - 1);

    const recentMeasurement = this.measurementRepository.create({
      date: recentDate,
      weight: 68.5,
      height: 165,
      bodyFat: 29.8,
      fatMass: 20.4,
      muscleMassPercentage: 30.2,
      muscleMass: 20.7,
      visceralFat: 7,
      measurements: {
        waist: 78,
        hip: 101,
        arm: 31,
        thigh: 56,
      },
      patient,
      patientId: patient.id,
      nutritionistId: patient.nutritionistId,
    });

    await this.measurementRepository.save(recentMeasurement);
  }

  /**
   * Creates sample consultations for a patient
   * @param patient The patient to create consultations for
   */
  private async createConsultations(patient: Patient): Promise<void> {
    // Create initial consultation (3 months ago)
    const initialDate = new Date();
    initialDate.setMonth(initialDate.getMonth() - 3);

    const initialConsultation = this.consultationRepository.create({
      date: initialDate,
      patientId: patient.id,
      nutritionistId: patient.nutritionistId,
      notes:
        'Primeira consulta. Paciente relata dificuldade para perder peso e baixa energia. Solicitados exames de sangue e iniciado plano alimentar com foco em alimentos integrais e redução de açúcares.',
      status: ConsultationStatus.COMPLETED,
      type: ConsultationType.INITIAL,
    });

    await this.consultationRepository.save(initialConsultation);

    // Create follow-up consultation (2 months ago)
    const followUpDate = new Date();
    followUpDate.setMonth(followUpDate.getMonth() - 2);

    const followUpConsultation = this.consultationRepository.create({
      date: followUpDate,
      patientId: patient.id,
      nutritionistId: patient.nutritionistId,
      notes:
        'Paciente relata melhora na energia e perda de 1.7kg. Exames mostram TSH elevado, encaminhada para endocrinologista. Ajustado plano alimentar com foco em alimentos ricos em iodo e selênio.',
      status: ConsultationStatus.COMPLETED,
      type: ConsultationType.FOLLOW_UP,
    });

    await this.consultationRepository.save(followUpConsultation);

    // Create recent consultation (1 month ago)
    const recentDate = new Date();
    recentDate.setMonth(recentDate.getMonth() - 1);

    const recentConsultation = this.consultationRepository.create({
      date: recentDate,
      patientId: patient.id,
      nutritionistId: patient.nutritionistId,
      notes:
        'Paciente iniciou tratamento para hipotireoidismo. Perda de mais 2.3kg. Relata melhora significativa na disposição e qualidade do sono. Plano alimentar ajustado para incluir mais proteínas magras.',
      status: ConsultationStatus.COMPLETED,
      type: ConsultationType.FOLLOW_UP,
    });

    await this.consultationRepository.save(recentConsultation);

    // Create next consultation (scheduled for next month)
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 1);

    const nextConsultation = this.consultationRepository.create({
      date: nextDate,
      patientId: patient.id,
      nutritionistId: patient.nutritionistId,
      notes: 'Consulta de acompanhamento mensal.',
      status: ConsultationStatus.SCHEDULED,
      type: ConsultationType.FOLLOW_UP,
    });

    await this.consultationRepository.save(nextConsultation);

    // Update patient with last and next consultation dates
    await this.patientRepository.update(patient.id, {
      lastConsultationAt: recentDate,
      nextConsultationAt: nextDate,
    });
  }

  /**
   * Creates a sample meal plan for a patient
   * @param patient The patient to create a meal plan for
   */
  private async createMealPlan(patient: Patient): Promise<void> {
    // Create basic foods if they don't exist
    const foods = await this.ensureSampleFoodsExist();

    // Create meal plan
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    const mealPlan = this.mealPlanRepository.create({
      name: 'Plano Alimentar Inicial',
      description:
        'Plano alimentar com foco em perda de peso e controle do hipotireoidismo.',
      patientId: patient.id,
      nutritionistId: patient.nutritionistId,
      startDate,
      endDate,
    });

    const savedMealPlan = await this.mealPlanRepository.save(mealPlan);

    // Create breakfast
    const breakfast = this.mealRepository.create({
      name: 'Café da Manhã',
      time: '07:30',
      notes: 'Optar por frutas da estação.',
      mealPlan: savedMealPlan,
    });

    const savedBreakfast = await this.mealRepository.save(breakfast);

    // Add foods to breakfast
    await this.addFoodToMeal(savedBreakfast, foods[0], 200, 'g');
    await this.addFoodToMeal(savedBreakfast, foods[1], 30, 'g');
    await this.addFoodToMeal(savedBreakfast, foods[2], 1, 'unidade');

    // Create lunch
    const lunch = this.mealRepository.create({
      name: 'Almoço',
      time: '12:30',
      notes: 'Priorizar vegetais coloridos no prato.',
      mealPlan: savedMealPlan,
    });

    const savedLunch = await this.mealRepository.save(lunch);

    // Add foods to lunch
    await this.addFoodToMeal(savedLunch, foods[3], 120, 'g');
    await this.addFoodToMeal(savedLunch, foods[4], 150, 'g');
    await this.addFoodToMeal(savedLunch, foods[5], 2, 'colher');

    // Create afternoon snack
    const snack = this.mealRepository.create({
      name: 'Lanche da Tarde',
      time: '16:00',
      notes: 'Evitar alimentos processados.',
      mealPlan: savedMealPlan,
    });

    const savedSnack = await this.mealRepository.save(snack);

    // Add foods to snack
    await this.addFoodToMeal(savedSnack, foods[6], 1, 'unidade');
    await this.addFoodToMeal(savedSnack, foods[7], 20, 'g');

    // Create dinner
    const dinner = this.mealRepository.create({
      name: 'Jantar',
      time: '19:30',
      notes: 'Refeição mais leve que o almoço.',
      mealPlan: savedMealPlan,
    });

    const savedDinner = await this.mealRepository.save(dinner);

    // Add foods to dinner
    await this.addFoodToMeal(savedDinner, foods[8], 100, 'g');
    await this.addFoodToMeal(savedDinner, foods[9], 50, 'g');
    await this.addFoodToMeal(savedDinner, foods[5], 1, 'colher');

    // Update meal plan totals
    await this.updateMealPlanTotals(savedMealPlan.id);
  }

  /**
   * Ensures that sample foods exist in the database
   * @returns Array of foods
   */
  private async ensureSampleFoodsExist(): Promise<Food[]> {
    const sampleFoods = [
      {
        name: 'Iogurte Natural Desnatado',
        servingSize: 100,
        servingUnit: 'g',
        calories: 50,
        protein: 5.3,
        carbohydrates: 7.2,
        fat: 0.4,
        categories: ['Laticínios'],
        isVerified: true,
        source: 'TACO',
      },
      {
        name: 'Granola Tradicional',
        servingSize: 30,
        servingUnit: 'g',
        calories: 120,
        protein: 3.5,
        carbohydrates: 20.5,
        fat: 4.2,
        categories: ['Cereais'],
        isVerified: true,
        source: 'TACO',
      },
      {
        name: 'Banana',
        servingSize: 100,
        servingUnit: 'g',
        calories: 89,
        protein: 1.1,
        carbohydrates: 22.8,
        fat: 0.3,
        categories: ['Frutas'],
        isVerified: true,
        source: 'TACO',
      },
      {
        name: 'Peito de Frango Grelhado',
        servingSize: 100,
        servingUnit: 'g',
        calories: 165,
        protein: 31,
        carbohydrates: 0,
        fat: 3.6,
        categories: ['Carnes', 'Aves'],
        isVerified: true,
        source: 'TACO',
      },
      {
        name: 'Arroz Integral Cozido',
        servingSize: 100,
        servingUnit: 'g',
        calories: 124,
        protein: 2.6,
        carbohydrates: 25.8,
        fat: 1,
        categories: ['Cereais'],
        isVerified: true,
        source: 'TACO',
      },
      {
        name: 'Azeite de Oliva Extra Virgem',
        servingSize: 10,
        servingUnit: 'ml',
        calories: 90,
        protein: 0,
        carbohydrates: 0,
        fat: 10,
        categories: ['Óleos e Gorduras'],
        isVerified: true,
        source: 'TACO',
      },
      {
        name: 'Maçã',
        servingSize: 100,
        servingUnit: 'g',
        calories: 52,
        protein: 0.3,
        carbohydrates: 13.8,
        fat: 0.2,
        categories: ['Frutas'],
        isVerified: true,
        source: 'TACO',
      },
      {
        name: 'Castanha do Pará',
        servingSize: 20,
        servingUnit: 'g',
        calories: 132,
        protein: 2.8,
        carbohydrates: 2.6,
        fat: 13.2,
        categories: ['Oleaginosas'],
        isVerified: true,
        source: 'TACO',
      },
      {
        name: 'Salmão Grelhado',
        servingSize: 100,
        servingUnit: 'g',
        calories: 208,
        protein: 22.1,
        carbohydrates: 0,
        fat: 13.4,
        categories: ['Peixes'],
        isVerified: true,
        source: 'TACO',
      },
      {
        name: 'Brócolis Cozido',
        servingSize: 100,
        servingUnit: 'g',
        calories: 35,
        protein: 3.6,
        carbohydrates: 4.3,
        fat: 0.3,
        categories: ['Vegetais'],
        isVerified: true,
        source: 'TACO',
      },
    ];

    const foods: Food[] = [];

    for (const foodData of sampleFoods) {
      // Check if food already exists
      let food = await this.foodRepository.findOne({
        where: { name: foodData.name },
      });

      if (!food) {
        // Create food if it doesn't exist
        food = this.foodRepository.create(foodData);
        food = await this.foodRepository.save(food);
      }

      foods.push(food);
    }

    return foods;
  }

  /**
   * Adds a food to a meal
   * @param meal The meal to add the food to
   * @param food The food to add
   * @param amount The amount of food
   * @param unit The unit of measurement
   */
  private async addFoodToMeal(
    meal: Meal,
    food: Food,
    amount: number,
    unit: string,
  ): Promise<void> {
    const mealFood = this.mealFoodRepository.create({
      meal,
      food,
      amount,
      unit,
    });

    await this.mealFoodRepository.save(mealFood);
  }

  /**
   * Updates the nutritional totals for a meal plan
   * @param mealPlanId The ID of the meal plan to update
   */
  private async updateMealPlanTotals(mealPlanId: string): Promise<void> {
    const mealPlan = await this.mealPlanRepository.findOne({
      where: { id: mealPlanId },
      relations: ['meals', 'meals.mealFoods', 'meals.mealFoods.food'],
    });

    if (!mealPlan) {
      return;
    }

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    for (const meal of mealPlan.meals) {
      let mealCalories = 0;
      let mealProtein = 0;
      let mealCarbs = 0;
      let mealFat = 0;

      for (const mealFood of meal.mealFoods) {
        const food = mealFood.food;
        const amount = mealFood.amount;
        const servingSize = food.servingSize || 1; // Avoid division by zero

        mealCalories += (food.calories * amount) / servingSize;
        mealProtein += (food.protein * amount) / servingSize;
        mealCarbs += (food.carbohydrates * amount) / servingSize;
        mealFat += (food.fat * amount) / servingSize;
      }

      // Update meal totals
      await this.mealRepository.update(meal.id, {
        totalCalories: mealCalories,
        totalProtein: mealProtein,
        totalCarbs: mealCarbs,
        totalFat: mealFat,
      });

      totalCalories += mealCalories;
      totalProtein += mealProtein;
      totalCarbs += mealCarbs;
      totalFat += mealFat;
    }

    // Calculate daily averages
    const days = Math.max(
      1,
      Math.ceil(
        (mealPlan.endDate.getTime() - mealPlan.startDate.getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    );

    // Update meal plan totals
    await this.mealPlanRepository.update(mealPlanId, {
      dailyCalories: totalCalories / days,
      dailyProtein: totalProtein / days,
      dailyCarbs: totalCarbs / days,
      dailyFat: totalFat / days,
    });
  }
}
