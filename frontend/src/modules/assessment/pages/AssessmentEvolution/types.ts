export interface MeasurementPhoto {
  id: string;
  type: string;
  url: string;
  thumbnailUrl?: string;
  assessmentId?: string;
  createdAt?: string;
  updatedAt?: string;
  storagePath?: string;
}

export interface MeasurementData {
  weight?: number;
  bodyFat?: number;
}

export interface PhotoWithData {
  photo: MeasurementPhoto;
  date: string;
  measurementId: string;
  measurementData: MeasurementData;
}

export interface SelectedPhotos {
  reference?: {
    id: string;
    type: string;
    url: string;
    date: string;
    measurementData?: MeasurementData;
  };
  compare?: {
    id: string;
    type: string;
    url: string;
    date: string;
    measurementData?: MeasurementData;
  };
}
