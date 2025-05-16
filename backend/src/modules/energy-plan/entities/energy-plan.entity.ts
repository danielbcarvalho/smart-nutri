import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Nutritionist } from '../../nutritionists/entities/nutritionist.entity';
import { Consultation } from '../../patients/entities/consultation.entity';
import { MealPlan } from '../../meal-plan/entities/meal-plan.entity';

@Entity('energy_plans')
export class EnergyPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'patient_id' })
  patientId: string;

  @Column({ name: 'nutritionist_id' })
  nutritionistId: string;

  @Column({ name: 'consultation_id', nullable: true })
  consultationId?: string;

  @Column()
  name: string;

  @Column({
    name: 'calculation_date',
    type: 'date',
    default: () => 'CURRENT_DATE',
  })
  calculationDate: Date;

  // Anthropometrics
  @Column({
    name: 'weight_at_calculation_kg',
    type: 'numeric',
    precision: 6,
    scale: 2,
  })
  weightAtCalculationKg: number;

  @Column({
    name: 'height_at_calculation_cm',
    type: 'numeric',
    precision: 5,
    scale: 1,
  })
  heightAtCalculationCm: number;

  @Column({
    name: 'fat_free_mass_at_calculation_kg',
    type: 'numeric',
    precision: 6,
    scale: 2,
    nullable: true,
  })
  fatFreeMassAtCalculationKg?: number;

  @Column({ name: 'age_at_calculation_years' })
  ageAtCalculationYears: number;

  @Column({ name: 'gender_at_calculation', length: 10 })
  genderAtCalculation: string;

  // Formula & Factors
  @Column({ name: 'formula_key', length: 100 })
  formulaKey: string;

  @Column({ name: 'activity_factor_key', length: 50, nullable: true })
  activityFactorKey?: string;

  @Column({ name: 'injury_factor_key', length: 50, nullable: true })
  injuryFactorKey?: string;

  // Adjustments
  @Column({ name: 'additional_met_details', type: 'jsonb', nullable: true })
  additionalMetDetails?: {
    met_id: string;
    duration_minutes: number;
    met_value: number;
  }[];

  @Column({
    name: 'additional_met_total_kcal',
    type: 'numeric',
    precision: 7,
    scale: 2,
    nullable: true,
  })
  additionalMetTotalKcal?: number;

  @Column({ name: 'weight_goal_details', type: 'jsonb', nullable: true })
  weightGoalDetails?: {
    target_weight_change_kg: number;
    days_to_achieve: number;
    calculated_kcal_adjustment: number;
  };

  @Column({
    name: 'additional_pregnancy_kcal',
    type: 'numeric',
    precision: 7,
    scale: 2,
    nullable: true,
  })
  additionalPregnancyKcal?: number;

  @Column({ name: 'pregnancy_specific_inputs', type: 'jsonb', nullable: true })
  pregnancySpecificInputs?: {
    gestational_age_weeks?: number;
    pre_pregnancy_nutritional_status?: string;
    due_date_or_delivery_date?: string;
  };

  @Column({
    name: 'custom_tmb_kcal_input',
    type: 'numeric',
    precision: 7,
    scale: 2,
    nullable: true,
  })
  customTmbKcalInput?: number;

  @Column({
    name: 'custom_get_kcal_input',
    type: 'numeric',
    precision: 7,
    scale: 2,
    nullable: true,
  })
  customGetKcalInput?: number;

  // Results
  @Column({
    name: 'calculated_tmb_kcal',
    type: 'numeric',
    precision: 7,
    scale: 2,
    nullable: true,
  })
  calculatedTmbKcal?: number;

  @Column({
    name: 'calculated_get_kcal',
    type: 'numeric',
    precision: 7,
    scale: 2,
  })
  calculatedGetKcal: number;

  // Timestamps
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(() => Nutritionist, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nutritionist_id' })
  nutritionist: Nutritionist;

  @OneToMany(() => MealPlan, (mealPlan) => mealPlan.energyPlan)
  mealPlans: MealPlan[];

  @ManyToOne(() => Consultation, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'consultation_id' })
  consultation?: Consultation;
}
