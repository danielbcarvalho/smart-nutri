import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { Patient } from './entities/patient.entity';
import { Measurement } from './entities/measurement.entity';
import { PatientPhoto } from './entities/patient-photo.entity';
import { Consultation } from './entities/consultation.entity';
import { MealPlan } from '../meal-plans/entities/meal-plan.entity';
import { Meal } from '../meal-plans/entities/meal.entity';
import { MealFood } from '../meal-plans/entities/meal-food.entity';
import { Food } from '../foods/entities/food.entity';
import { PatientPhotosService } from './services/patient-photos.service';
import { PatientPhotosController } from './controllers/patient-photos.controller';
import { ConsultationsService } from './services/consultations.service';
import { ConsultationsController } from './controllers/consultations.controller';

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
  ],
  exports: [
    PatientsService,
    PatientPhotosService,
    ConsultationsService,
    require('./services/sample-patient.service').SamplePatientService,
  ],
})
export class PatientsModule {}
