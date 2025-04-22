// Tipos para dados antropométricos
export interface BasicData {
  weight: string;
  height: string;
  sittingHeight: string;
  kneeHeight: string;
}

export interface Circumferences {
  neck: string;
  shoulder: string;
  chest: string;
  waist: string;
  abdomen: string;
  hip: string;
  relaxedArm: string;
  contractedArm: string;
  forearm: string;
  proximalThigh: string;
  medialThigh: string;
  distalThigh: string;
  calf: string;
}

export interface Skinfolds {
  tricipital: string;
  bicipital: string;
  abdominal: string;
  subscapular: string;
  axillaryMedian: string;
  thigh: string;
  thoracic: string;
  suprailiac: string;
  calf: string;
  supraspinal: string;
}

export interface BoneDiameters {
  humerus: string;
  wrist: string;
  femur: string;
}

export interface AnthropometricResults {
  // Análises de pesos e medidas
  currentWeight: string;
  currentHeight: string;
  bmi: string;
  bmiClassification: string;
  idealWeightRange: string;
  waistHipRatio: string;
  waistHipRiskClassification: string;

  // Análises por dobras e diâmetro ósseo
  bodyFatPercentage: string;
  idealFatPercentage: string;
  bodyFatClassification: string;
  fatMass: string;
  boneMass: string;
  muscleMass: string;
  residualWeight: string;
  fatFreeMass: string;
  skinfoldsSum: string;
  bodyDensity: string;
  referenceUsed: string;
}
