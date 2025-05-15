export interface MetDetail {
  met_id: string;
  duration_minutes: number;
  met_value: number;
}

export interface WeightGoalDetail {
  target_weight_change_kg: number;
  days_to_achieve: number;
  calculated_kcal_adjustment: number;
}

export interface PregnancySpecificInput {
  gestational_age_weeks?: number;
  pre_pregnancy_nutritional_status?: string;
  due_date_or_delivery_date?: string;
}

export interface EnergyPlanBase {
  name: string;
  calculationDate: Date;
  weightAtCalculationKg: number;
  heightAtCalculationCm: number;
  fatFreeMassAtCalculationKg?: number;
  ageAtCalculationYears: number;
  genderAtCalculation: string;
  formulaKey: string;
  activityFactorKey?: string;
  injuryFactorKey?: string;
  additionalMetDetails?: MetDetail[];
  additionalMetTotalKcal?: number;
  weightGoalDetails?: WeightGoalDetail;
  additionalPregnancyKcal?: number;
  pregnancySpecificInputs?: PregnancySpecificInput;
  customTmbKcalInput?: number;
  customGetKcalInput?: number;
  calculatedTmbKcal?: number;
  calculatedGetKcal: number;
}

export interface CreateEnergyPlanDto extends EnergyPlanBase {
  patientId: string;
  nutritionistId: string;
  consultationId?: string;
}

export interface UpdateEnergyPlanDto extends Partial<EnergyPlanBase> {}

export interface EnergyPlanResponse extends EnergyPlanBase {
  id: string;
  patientId: string;
  nutritionistId: string;
  consultationId?: string;
  createdAt: Date;
  updatedAt: Date;
}
