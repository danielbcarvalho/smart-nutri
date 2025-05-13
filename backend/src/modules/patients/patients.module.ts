import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { Patient } from './entities/patient.entity';
import { Measurement } from './entities/measurement.entity';
import { PatientPhoto } from './entities/patient-photo.entity';
import { Consultation } from './entities/consultation.entity';
import { MealPlan } from '../meal-plan/entities/meal-plan.entity';
import { Meal } from '../meal-plan/entities/meal.entity';
import { MealFood } from '../meal-plan/entities/meal-food.entity';
import { PatientPhotosService } from './services/patient-photos.service';
import { PatientPhotosController } from './controllers/patient-photos.controller';
import { ConsultationsService } from './services/consultations.service';
import { ConsultationsController } from './controllers/consultations.controller';
import { Food } from '../foods/entities/food.entity';
import { StorageService } from '../../supabase/storage/storage.service';
import { InstagramScrapingService } from '../../services/instagram-scraping';
import { SupabaseModule } from '../../supabase/supabase.module';
import { PhotosModule } from '../photos/photos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Patient,
      Measurement,
      PatientPhoto,
      Consultation,
      MealPlan,
      Meal,
      MealFood,
      Food,
    ]),
    ConfigModule,
    SupabaseModule,
    PhotosModule,
  ],
  controllers: [
    PatientsController,
    PatientPhotosController,
    ConsultationsController,
  ],
  providers: [
    PatientsService,
    PatientPhotosService,
    ConsultationsService,
    require('./services/sample-patient.service').SamplePatientService,
    StorageService,
    InstagramScrapingService,
  ],
  exports: [
    PatientsService,
    PatientPhotosService,
    ConsultationsService,
    require('./services/sample-patient.service').SamplePatientService,
  ],
})
export class PatientsModule {}
