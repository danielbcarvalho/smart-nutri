export enum EnergyFormula {
  HARRIS_BENEDICT_1984 = 'harris_benedict_1984',
  FAO_WHO_2004 = 'fao_who_2004',
  IOM_EER_2005 = 'iom_eer_2005',
  MANUAL_TMB = 'manual_tmb',
  MANUAL_GET = 'manual_get',
}

export enum EnergyFormulaType {
  TMB_BASED = 'TMB_BASED',
  DIRECT_GET = 'DIRECT_GET',
  PEDIATRIC = 'PEDIATRIC',
  PREGNANCY = 'PREGNANCY',
}

export interface EnergyFormulaConfig {
  key: EnergyFormula;
  name: string;
  description?: string;
  type: EnergyFormulaType;
  hasMlgInput: boolean;
  applicableGenders?: string[];
  minAgeYears?: number;
  maxAgeYears?: number;
}

export const ENERGY_FORMULAS: EnergyFormulaConfig[] = [
  {
    key: EnergyFormula.HARRIS_BENEDICT_1984,
    name: 'Harris-Benedict (1984)',
    description: 'Fórmula clássica para cálculo de TMB',
    type: EnergyFormulaType.TMB_BASED,
    hasMlgInput: false,
    applicableGenders: ['male', 'female'],
    minAgeYears: 18,
  },
  {
    key: EnergyFormula.FAO_WHO_2004,
    name: 'FAO/WHO (2004)',
    description: 'Fórmula da FAO/WHO para cálculo de TMB',
    type: EnergyFormulaType.TMB_BASED,
    hasMlgInput: false,
    applicableGenders: ['male', 'female'],
  },
  {
    key: EnergyFormula.IOM_EER_2005,
    name: 'IOM EER (2005)',
    description: 'Fórmula do Institute of Medicine para cálculo direto de GET',
    type: EnergyFormulaType.DIRECT_GET,
    hasMlgInput: false,
    applicableGenders: ['male', 'female'],
    minAgeYears: 19,
  },
  {
    key: EnergyFormula.MANUAL_TMB,
    name: 'TMB Manual',
    description: 'Inserção manual do valor de TMB',
    type: EnergyFormulaType.TMB_BASED,
    hasMlgInput: false,
    applicableGenders: ['male', 'female', 'other'],
  },
  {
    key: EnergyFormula.MANUAL_GET,
    name: 'GET Manual',
    description: 'Inserção manual do valor de GET',
    type: EnergyFormulaType.DIRECT_GET,
    hasMlgInput: false,
    applicableGenders: ['male', 'female', 'other'],
  },
];
