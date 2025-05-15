export enum ActivityFactor {
  SEDENTARY = '1.200',
  LIGHT = '1.375',
  MODERATE = '1.550',
  VERY_ACTIVE = '1.725',
  EXTRA_ACTIVE = '1.900',
}

export interface ActivityFactorConfig {
  key: ActivityFactor;
  name: string;
  description: string;
}

export const ACTIVITY_FACTORS: ActivityFactorConfig[] = [
  {
    key: ActivityFactor.SEDENTARY,
    name: 'Sedentário',
    description: 'Pouca ou nenhuma atividade física',
  },
  {
    key: ActivityFactor.LIGHT,
    name: 'Levemente Ativo',
    description: 'Atividade física leve 1-3 dias/semana',
  },
  {
    key: ActivityFactor.MODERATE,
    name: 'Moderadamente Ativo',
    description: 'Atividade física moderada 3-5 dias/semana',
  },
  {
    key: ActivityFactor.VERY_ACTIVE,
    name: 'Muito Ativo',
    description: 'Atividade física intensa 6-7 dias/semana',
  },
  {
    key: ActivityFactor.EXTRA_ACTIVE,
    name: 'Extremamente Ativo',
    description:
      'Atividade física muito intensa diária ou trabalho físico pesado',
  },
];
