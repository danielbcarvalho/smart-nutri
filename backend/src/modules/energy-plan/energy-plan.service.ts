import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnergyPlan } from './entities/energy-plan.entity';
import {
  CreateEnergyPlanDto,
  UpdateEnergyPlanDto,
  QueryEnergyPlanDto,
  EnergyPlanResponseDto,
} from './dto';
import { EnergyFormula } from './enums/energy-formulas.enum';
import { ActivityFactor } from './enums/activity-factors.enum';
import { InjuryFactor } from './enums/injury-factors.enum';
import { Gender } from './enums/gender.enum';

@Injectable()
export class EnergyPlanService {
  constructor(
    @InjectRepository(EnergyPlan)
    private readonly energyPlanRepository: Repository<EnergyPlan>,
  ) {}

  private toResponseDto(energyPlan: EnergyPlan): EnergyPlanResponseDto {
    const { patient, nutritionist, mealPlans, ...rest } = energyPlan;
    const weightGoal = energyPlan.weightGoalDetails || {};
    return {
      ...rest,
      calculationDate: new Date(energyPlan.calculationDate)
        .toISOString()
        .split('T')[0],
      genderAtCalculation: energyPlan.genderAtCalculation as Gender,
      formulaKey: energyPlan.formulaKey as EnergyFormula,
      activityFactorKey: energyPlan.activityFactorKey as
        | ActivityFactor
        | undefined,
      injuryFactorKey: energyPlan.injuryFactorKey as InjuryFactor | undefined,
      macronutrientDistribution: energyPlan.macronutrientDistribution,
      goalWeightChangeKg:
        weightGoal.goalWeightChangeKg ?? weightGoal.target_weight_change_kg,
      goalDaysToAchieve:
        weightGoal.goalDaysToAchieve ?? weightGoal.days_to_achieve,
      calculatedGoalKcalAdjustment:
        weightGoal.calculatedGoalKcalAdjustment ??
        weightGoal.calculated_kcal_adjustment,
    };
  }

  async create(
    createEnergyPlanDto: CreateEnergyPlanDto,
  ): Promise<EnergyPlanResponseDto> {
    const {
      goalWeightChangeKg,
      goalDaysToAchieve,
      calculatedGoalKcalAdjustment,
      macronutrientDistribution,
      ...rest
    } = createEnergyPlanDto;

    let weightGoalDetails = rest.weightGoalDetails;
    if (
      goalWeightChangeKg !== undefined ||
      goalDaysToAchieve !== undefined ||
      calculatedGoalKcalAdjustment !== undefined
    ) {
      weightGoalDetails = {
        ...weightGoalDetails,
        target_weight_change_kg: goalWeightChangeKg,
        days_to_achieve: goalDaysToAchieve,
        calculated_kcal_adjustment: calculatedGoalKcalAdjustment,
      };
    }

    const energyPlan = this.energyPlanRepository.create({
      ...rest,
      weightGoalDetails,
      macronutrientDistribution,
      calculationDate: new Date(),
    });
    const saved = await this.energyPlanRepository.save(energyPlan);
    return this.toResponseDto(saved);
  }

  async findAll(query: QueryEnergyPlanDto): Promise<EnergyPlanResponseDto[]> {
    const queryBuilder =
      this.energyPlanRepository.createQueryBuilder('energyPlan');

    if (query.patientId) {
      queryBuilder.andWhere('energyPlan.patientId = :patientId', {
        patientId: query.patientId,
      });
    }

    if (query.nutritionistId) {
      queryBuilder.andWhere('energyPlan.nutritionistId = :nutritionistId', {
        nutritionistId: query.nutritionistId,
      });
    }

    if (query.consultationId) {
      queryBuilder.andWhere('energyPlan.consultationId = :consultationId', {
        consultationId: query.consultationId,
      });
    }

    if (query.name) {
      queryBuilder.andWhere('energyPlan.name ILIKE :name', {
        name: `%${query.name}%`,
      });
    }

    const plans = await queryBuilder.getMany();
    return plans.map((plan) => this.toResponseDto(plan));
  }

  async findOne(id: string): Promise<EnergyPlanResponseDto> {
    const energyPlan = await this.energyPlanRepository.findOne({
      where: { id },
    });

    if (!energyPlan) {
      throw new NotFoundException(
        `Plano energético com ID ${id} não encontrado`,
      );
    }

    return this.toResponseDto(energyPlan);
  }

  async findByPatient(patientId: string): Promise<EnergyPlanResponseDto[]> {
    const plans = await this.energyPlanRepository.find({
      where: { patientId },
      relations: ['patient', 'nutritionist', 'consultation', 'mealPlans'],
      order: { calculationDate: 'DESC' },
    });
    return plans.map((plan) => this.toResponseDto(plan));
  }

  async findByConsultation(
    consultationId: string,
  ): Promise<EnergyPlanResponseDto[]> {
    const plans = await this.energyPlanRepository.find({
      where: { consultationId },
      relations: ['patient', 'nutritionist', 'consultation', 'mealPlans'],
    });
    return plans.map((plan) => this.toResponseDto(plan));
  }

  async update(
    id: string,
    updateEnergyPlanDto: UpdateEnergyPlanDto,
  ): Promise<EnergyPlanResponseDto> {
    const energyPlan = await this.energyPlanRepository.findOne({
      where: { id },
    });

    if (!energyPlan) {
      throw new NotFoundException(
        `Plano energético com ID ${id} não encontrado`,
      );
    }

    const {
      goalWeightChangeKg,
      goalDaysToAchieve,
      calculatedGoalKcalAdjustment,
      macronutrientDistribution,
      ...rest
    } = updateEnergyPlanDto;

    let weightGoalDetails =
      rest.weightGoalDetails || energyPlan.weightGoalDetails;
    if (
      goalWeightChangeKg !== undefined ||
      goalDaysToAchieve !== undefined ||
      calculatedGoalKcalAdjustment !== undefined
    ) {
      weightGoalDetails = {
        ...weightGoalDetails,
        target_weight_change_kg: goalWeightChangeKg,
        days_to_achieve: goalDaysToAchieve,
        calculated_kcal_adjustment: calculatedGoalKcalAdjustment,
      };
    }

    Object.assign(energyPlan, rest, {
      weightGoalDetails,
      macronutrientDistribution,
    });
    const updated = await this.energyPlanRepository.save(energyPlan);
    return this.toResponseDto(updated);
  }

  async remove(id: string): Promise<void> {
    const energyPlan = await this.energyPlanRepository.findOne({
      where: { id },
    });

    if (!energyPlan) {
      throw new NotFoundException(
        `Plano energético com ID ${id} não encontrado`,
      );
    }

    await this.energyPlanRepository.remove(energyPlan);
  }

  // Métodos auxiliares para cálculos energéticos

  private calculateTMB(
    weight: number,
    height: number,
    age: number,
    gender: string,
    formula: EnergyFormula,
    fatFreeMass?: number,
  ): number {
    switch (formula) {
      case EnergyFormula.HARRIS_BENEDICT_1984:
        return this.calculateHarrisBenedict1984(weight, height, age, gender);
      case EnergyFormula.FAO_WHO_2004:
        return this.calculateFaoWho2004(weight, height, age, gender);
      case EnergyFormula.IOM_EER_2005:
        return this.calculateIomEer2005(weight, height, age, gender);
      default:
        throw new Error(`Fórmula ${formula} não implementada`);
    }
  }

  private calculateHarrisBenedict1984(
    weight: number,
    height: number,
    age: number,
    gender: string,
  ): number {
    if (gender === 'male') {
      return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
    } else {
      return 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
    }
  }

  private calculateFaoWho2004(
    weight: number,
    height: number,
    age: number,
    gender: string,
  ): number {
    if (gender === 'male') {
      if (age < 3) {
        return 60.9 * weight - 54;
      } else if (age < 10) {
        return 22.7 * weight + 495;
      } else if (age < 18) {
        return 17.5 * weight + 651;
      } else if (age < 30) {
        return 15.3 * weight + 679;
      } else if (age < 60) {
        return 11.6 * weight + 879;
      } else {
        return 13.5 * weight + 487;
      }
    } else {
      if (age < 3) {
        return 61 * weight - 51;
      } else if (age < 10) {
        return 22.5 * weight + 499;
      } else if (age < 18) {
        return 12.2 * weight + 746;
      } else if (age < 30) {
        return 14.7 * weight + 496;
      } else if (age < 60) {
        return 8.7 * weight + 829;
      } else {
        return 10.5 * weight + 596;
      }
    }
  }

  private calculateIomEer2005(
    weight: number,
    height: number,
    age: number,
    gender: string,
  ): number {
    if (gender === 'male') {
      return 662 - 9.53 * age + 15.91 * weight + 539.6 * (height / 100);
    } else {
      return 354 - 6.91 * age + 9.36 * weight + 726 * (height / 100);
    }
  }

  private calculateGET(
    tmb: number,
    activityFactor?: ActivityFactor,
    injuryFactor?: InjuryFactor,
    additionalMetKcal?: number,
    additionalPregnancyKcal?: number,
    weightGoalAdjustment?: number,
  ): number {
    let get = tmb;

    if (activityFactor) {
      get *= parseFloat(activityFactor);
    }

    if (injuryFactor) {
      get *= parseFloat(injuryFactor);
    }

    if (additionalMetKcal) {
      get += additionalMetKcal;
    }

    if (additionalPregnancyKcal) {
      get += additionalPregnancyKcal;
    }

    if (weightGoalAdjustment) {
      get += weightGoalAdjustment;
    }

    return Math.round(get);
  }

  async calculateEnergyPlan(
    createEnergyPlanDto: CreateEnergyPlanDto,
  ): Promise<EnergyPlan> {
    const {
      weightAtCalculationKg,
      heightAtCalculationCm,
      ageAtCalculationYears,
      genderAtCalculation,
      formulaKey,
      activityFactorKey,
      injuryFactorKey,
      additionalMetTotalKcal,
      additionalPregnancyKcal,
      weightGoalDetails,
      fatFreeMassAtCalculationKg,
    } = createEnergyPlanDto;

    // Calcula TMB
    const tmb = this.calculateTMB(
      weightAtCalculationKg,
      heightAtCalculationCm,
      ageAtCalculationYears,
      genderAtCalculation,
      formulaKey,
      fatFreeMassAtCalculationKg,
    );

    // Calcula ajuste de peso se houver
    const weightGoalAdjustment =
      weightGoalDetails?.calculated_kcal_adjustment || 0;

    // Calcula GET final
    const get = this.calculateGET(
      tmb,
      activityFactorKey,
      injuryFactorKey,
      additionalMetTotalKcal,
      additionalPregnancyKcal,
      weightGoalAdjustment,
    );

    // Cria o plano energético com os valores calculados
    const energyPlan = this.energyPlanRepository.create({
      ...createEnergyPlanDto,
      calculatedTmbKcal: tmb,
      calculatedGetKcal: get,
    });

    return this.energyPlanRepository.save(energyPlan);
  }
}
