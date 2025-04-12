import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consultation } from '../entities/consultation.entity';
import { CreateConsultationDto } from '../dto/create-consultation.dto';
import { Patient } from '../entities/patient.entity';

@Injectable()
export class ConsultationsService {
  constructor(
    @InjectRepository(Consultation)
    private consultationsRepository: Repository<Consultation>,
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
  ) {}

  async create(
    createConsultationDto: CreateConsultationDto,
    nutritionistId: string,
  ): Promise<Consultation> {
    // Check if patient exists and belongs to the nutritionist
    const patient = await this.patientsRepository.findOne({
      where: {
        id: createConsultationDto.patientId,
        nutritionistId,
      },
    });

    if (!patient) {
      throw new NotFoundException(
        `Patient with ID ${createConsultationDto.patientId} not found or does not belong to this nutritionist`,
      );
    }

    // Create and save the consultation
    const consultation = this.consultationsRepository.create({
      ...createConsultationDto,
      nutritionistId,
    });

    const savedConsultation =
      await this.consultationsRepository.save(consultation);

    // Update patient's last consultation date and next consultation date
    await this.updatePatientConsultationDates(patient, savedConsultation.date);

    return savedConsultation;
  }

  async findAll(nutritionistId: string): Promise<Consultation[]> {
    return this.consultationsRepository.find({
      where: { nutritionistId },
      relations: ['patient'],
      order: { date: 'DESC' },
    });
  }

  async findByPatient(
    patientId: string,
    nutritionistId: string,
  ): Promise<Consultation[]> {
    return this.consultationsRepository.find({
      where: { patientId, nutritionistId },
      order: { date: 'DESC' },
    });
  }

  async findOne(id: string, nutritionistId: string): Promise<Consultation> {
    const consultation = await this.consultationsRepository.findOne({
      where: { id, nutritionistId },
      relations: ['patient', 'measurements'],
    });

    if (!consultation) {
      throw new NotFoundException(`Consultation with ID ${id} not found`);
    }

    return consultation;
  }

  async update(
    id: string,
    updateConsultationDto: Partial<CreateConsultationDto>,
    nutritionistId: string,
  ): Promise<Consultation> {
    const consultation = await this.findOne(id, nutritionistId);

    // Update the consultation
    Object.assign(consultation, updateConsultationDto);

    // If the date was updated, update the patient's consultation dates
    if (updateConsultationDto.date) {
      const patient = await this.patientsRepository.findOne({
        where: { id: consultation.patientId },
      });

      if (patient) {
        await this.updatePatientConsultationDates(
          patient,
          updateConsultationDto.date,
        );
      }
    }

    return this.consultationsRepository.save(consultation);
  }

  async remove(id: string, nutritionistId: string): Promise<void> {
    const consultation = await this.findOne(id, nutritionistId);
    await this.consultationsRepository.remove(consultation);
  }

  private async updatePatientConsultationDates(
    patient: Patient,
    consultationDate: Date,
  ): Promise<void> {
    // Update last consultation date if this is a new consultation in the past or present
    const now = new Date();
    if (consultationDate <= now) {
      patient.lastConsultationAt = consultationDate;
    }

    // Calculate next consultation date based on frequency
    let nextConsultationDate: Date | null = null;

    if (consultationDate > now) {
      // If the consultation is in the future, it becomes the next consultation
      nextConsultationDate = consultationDate;
    } else {
      // Calculate based on frequency
      nextConsultationDate = new Date(consultationDate);

      switch (patient.consultationFrequency) {
        case 'weekly':
          nextConsultationDate.setDate(nextConsultationDate.getDate() + 7);
          break;
        case 'biweekly':
          nextConsultationDate.setDate(nextConsultationDate.getDate() + 14);
          break;
        case 'monthly':
          nextConsultationDate.setMonth(nextConsultationDate.getMonth() + 1);
          break;
        case 'custom':
          if (patient.customConsultationDays) {
            nextConsultationDate.setDate(
              nextConsultationDate.getDate() + patient.customConsultationDays,
            );
          } else {
            nextConsultationDate.setMonth(nextConsultationDate.getMonth() + 1);
          }
          break;
      }
    }

    if (nextConsultationDate) {
      patient.nextConsultationAt = nextConsultationDate;
    }

    await this.patientsRepository.save(patient);
  }
}
