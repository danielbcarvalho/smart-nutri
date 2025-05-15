export enum InjuryFactor {
  NONE = '1.000',
  MILD = '1.200',
  MODERATE = '1.350',
  SEVERE = '1.500',
}

export interface InjuryFactorConfig {
  key: InjuryFactor;
  name: string;
  description: string;
}

export const INJURY_FACTORS: InjuryFactorConfig[] = [
  {
    key: InjuryFactor.NONE,
    name: 'Sem Lesão/Estresse',
    description: 'Sem lesão ou estresse metabólico significativo',
  },
  {
    key: InjuryFactor.MILD,
    name: 'Lesão/Estresse Leve',
    description: 'Lesão menor ou estresse metabólico leve',
  },
  {
    key: InjuryFactor.MODERATE,
    name: 'Lesão/Estresse Moderado',
    description: 'Lesão moderada ou estresse metabólico moderado',
  },
  {
    key: InjuryFactor.SEVERE,
    name: 'Lesão/Estresse Grave',
    description: 'Lesão grave ou estresse metabólico severo',
  },
];
