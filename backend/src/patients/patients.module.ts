import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { Patient } from './entities/patient.entity';
import { Measurement } from './entities/measurement.entity';
import { PatientPhoto } from './entities/patient-photo.entity';
import { Consultation } from './entities/consultation.entity';
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
    ]),
  ],
  controllers: [
    PatientsController,
    PatientPhotosController,
    ConsultationsController,
  ],
  providers: [PatientsService, PatientPhotosService, ConsultationsService],
  exports: [PatientsService, PatientPhotosService, ConsultationsService],
})
export class PatientsModule {}
