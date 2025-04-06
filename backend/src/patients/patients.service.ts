import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial, ILike } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { Measurement } from './entities/measurement.entity';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CreatePatientDto } from './dto/create-patient.dto';
import { CreateMeasurementDto } from './dto/create-measurement.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(Measurement)
    private measurementRepository: Repository<Measurement>,
  ) {}

  async create(createPatientDto: DeepPartial<Patient>): Promise<Patient> {
    const patient = this.patientRepository.create(createPatientDto);
    return await this.patientRepository.save(patient);
  }

  async findAll(): Promise<Patient[]> {
    return this.patientRepository.find();
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { id },
    });
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    return patient;
  }

  async update(
    id: string,
    updatePatientDto: UpdatePatientDto,
  ): Promise<Patient> {
    const patient = await this.findOne(id);
    Object.assign(patient, updatePatientDto);
    return this.patientRepository.save(patient);
  }

  async remove(id: string): Promise<void> {
    const patient = await this.findOne(id);
    await this.patientRepository.remove(patient);
  }

  async createMeasurement(
    patientId: string,
    createMeasurementDto: DeepPartial<Measurement>,
  ): Promise<Measurement> {
    const patient = await this.findOne(patientId);
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${patientId} not found`);
    }

    const measurement = this.measurementRepository.create({
      ...createMeasurementDto,
      patient,
    });

    return this.measurementRepository.save(measurement);
  }

  async findMeasurements(patientId: string): Promise<Measurement[]> {
    const patient = await this.findOne(patientId);
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${patientId} not found`);
    }

    return this.measurementRepository.find({
      where: { patient: { id: patientId } },
      order: { date: 'DESC' },
    });
  }

  async search(query: string): Promise<Patient[]> {
    return this.patientRepository.find({
      where: [{ name: ILike(`%${query}%`) }, { email: ILike(`%${query}%`) }],
      take: 5, // Limita a 5 resultados
    });
  }
}
