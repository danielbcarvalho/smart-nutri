import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientPhoto, PhotoType } from '../entities/patient-photo.entity';
import { CreatePatientPhotoDto } from '../dto/create-patient-photo.dto';
import { UpdatePatientPhotoDto } from '../dto/update-patient-photo.dto';

@Injectable()
export class PatientPhotosService {
  constructor(
    @InjectRepository(PatientPhoto)
    private patientPhotoRepository: Repository<PatientPhoto>,
  ) {}

  async create(
    createPatientPhotoDto: CreatePatientPhotoDto,
    nutritionistId: string,
  ): Promise<PatientPhoto> {
    const photo = this.patientPhotoRepository.create({
      ...createPatientPhotoDto,
      nutritionistId,
    });
    return this.patientPhotoRepository.save(photo);
  }

  async findAll(patientId: string): Promise<PatientPhoto[]> {
    return this.patientPhotoRepository.find({
      where: { patientId },
      order: { photoDate: 'DESC' },
    });
  }

  async findByType(
    patientId: string,
    photoType: PhotoType,
  ): Promise<PatientPhoto[]> {
    return this.patientPhotoRepository.find({
      where: { patientId, photoType },
      order: { photoDate: 'DESC' },
    });
  }

  async findOne(id: string): Promise<PatientPhoto> {
    const photo = await this.patientPhotoRepository.findOne({
      where: { id },
    });

    if (!photo) {
      throw new NotFoundException(`Photo with ID ${id} not found`);
    }

    return photo;
  }

  async update(
    id: string,
    updatePatientPhotoDto: UpdatePatientPhotoDto,
  ): Promise<PatientPhoto> {
    const photo = await this.findOne(id);

    const updatedPhoto = this.patientPhotoRepository.merge(
      photo,
      updatePatientPhotoDto,
    );

    return this.patientPhotoRepository.save(updatedPhoto);
  }

  async remove(id: string): Promise<void> {
    const photo = await this.findOne(id);
    await this.patientPhotoRepository.remove(photo);
  }

  async findPhotosByDateRange(
    patientId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<PatientPhoto[]> {
    return this.patientPhotoRepository
      .createQueryBuilder('photo')
      .where('photo.patientId = :patientId', { patientId })
      .andWhere('photo.photoDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('photo.photoDate', 'DESC')
      .getMany();
  }

  async countPhotosByPatient(patientId: string): Promise<number> {
    return this.patientPhotoRepository.count({
      where: { patientId },
    });
  }
}
