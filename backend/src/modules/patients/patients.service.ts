import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, FindOptionsWhere, DeepPartial } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { Measurement } from './entities/measurement.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { StorageService } from '../../supabase/storage/storage.service';
import { InstagramScrapingService } from '../../services/instagram-scraping';
import axios from 'axios';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Measurement)
    private readonly measurementRepository: Repository<Measurement>,
    private readonly storageService: StorageService,
    private readonly instagramScrapingService: InstagramScrapingService,
  ) {}

  async create(
    createPatientDto: CreatePatientDto,
    nutritionistId: string,
  ): Promise<Patient> {
    // Tratar strings vazias como undefined
    const processedDto: DeepPartial<Patient> = {
      ...createPatientDto,
      email: createPatientDto.email || undefined,
      cpf: createPatientDto.cpf || undefined,
      phone: createPatientDto.phone || undefined,
      birthDate: createPatientDto.birthDate || undefined,
      observations: createPatientDto.observations || undefined,
      nutritionistId,
    };

    const patient = this.patientRepository.create(processedDto);
    const savedPatient = await this.patientRepository.save(patient);
    return savedPatient;
  }

  async findAll(nutritionistId: string): Promise<Patient[]> {
    return this.patientRepository.find({
      where: { nutritionistId },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, nutritionistId: string): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { id, nutritionistId },
    });

    if (!patient) {
      throw new NotFoundException(`Paciente com ID ${id} não encontrado`);
    }

    return patient;
  }

  async update(
    id: string,
    updatePatientDto: UpdatePatientDto,
    nutritionistId: string,
  ): Promise<Patient> {
    const patient = await this.findOne(id, nutritionistId);

    // Se o instagram foi alterado, faz scraping e salva nova foto
    if (
      updatePatientDto.instagram &&
      updatePatientDto.instagram !== patient.instagram
    ) {
      try {
        const username = updatePatientDto.instagram.replace(/^@/, '');
        const imageUrl =
          await this.instagramScrapingService.getProfilePictureUrl(username);
        if (imageUrl) {
          const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
          });
          const buffer = Buffer.from(response.data);
          const contentType = response.headers['content-type'] || 'image/jpeg';
          const ext = contentType.split('/')[1] || 'jpg';
          const filename = `profile-instagram-${Date.now()}.${ext}`;
          const supabaseUrl = await this.storageService.uploadPatientPhoto(
            id,
            buffer,
            filename,
            contentType,
          );
          updatePatientDto.photoUrl = supabaseUrl;
        }
      } catch (e) {
        // Loga mas não impede atualização
        console.warn(
          'Falha ao buscar/salvar foto do Instagram do paciente:',
          e.message,
        );
      }
    }

    // Processa campos específicos
    const processedDto = {
      ...updatePatientDto,
      instagram: updatePatientDto.instagram || undefined,
    };

    Object.assign(patient, processedDto);
    return this.patientRepository.save(patient);
  }

  async remove(id: string, nutritionistId: string): Promise<void> {
    const patient = await this.findOne(id, nutritionistId);
    await this.patientRepository.remove(patient);
  }

  async createMeasurement(
    patientId: string,
    createMeasurementDto: CreateMeasurementDto,
    nutritionistId: string,
  ): Promise<Measurement> {
    const patient = await this.findOne(patientId, nutritionistId);

    const measurement = this.measurementRepository.create({
      ...createMeasurementDto,
      patient,
      nutritionistId,
    });

    return this.measurementRepository.save(measurement);
  }

  async findMeasurements(
    patientId: string,
    nutritionistId: string,
  ): Promise<Measurement[]> {
    const patient = await this.findOne(patientId, nutritionistId);

    return this.measurementRepository.find({
      where: { patient: { id: patient.id }, nutritionistId },
      order: { date: 'DESC' },
      relations: ['photos'],
    });
  }

  async findMeasurementsByDateRange(
    patientId: string,
    nutritionistId: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 5,
  ): Promise<Measurement[]> {
    const patient = await this.findOne(patientId, nutritionistId);

    const queryBuilder = this.measurementRepository
      .createQueryBuilder('measurement')
      .where('measurement.patient_id = :patientId', { patientId: patient.id })
      .andWhere('measurement.nutritionist_id = :nutritionistId', {
        nutritionistId,
      })
      .orderBy('measurement.date', 'DESC')
      .take(limit);

    if (startDate) {
      queryBuilder.andWhere('measurement.date >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('measurement.date <= :endDate', { endDate });
    }

    return queryBuilder.getMany();
  }

  async removeMeasurement(
    patientId: string,
    measurementId: string,
    nutritionistId: string,
  ): Promise<void> {
    // Primeiro verificamos se o paciente existe
    const patient = await this.findOne(patientId, nutritionistId);

    // Agora verificamos se a medição existe e pertence a este paciente
    const measurement = await this.measurementRepository.findOne({
      where: {
        id: measurementId,
        patient: { id: patient.id },
        nutritionistId,
      },
    });

    if (!measurement) {
      throw new NotFoundException(
        `Medição com ID ${measurementId} não encontrada para o paciente ${patientId}`,
      );
    }

    // Remove a medição
    await this.measurementRepository.remove(measurement);
  }

  async updateMeasurement(
    patientId: string,
    measurementId: string,
    updateMeasurementDto: CreateMeasurementDto,
    nutritionistId: string,
  ): Promise<Measurement> {
    // Primeiro verificamos se o paciente existe
    const patient = await this.findOne(patientId, nutritionistId);

    // Agora verificamos se a medição existe e pertence a este paciente
    const measurement = await this.measurementRepository.findOne({
      where: {
        id: measurementId,
        patient: { id: patient.id },
        nutritionistId,
      },
    });

    if (!measurement) {
      throw new NotFoundException(
        `Medição com ID ${measurementId} não encontrada para o paciente ${patientId}`,
      );
    }

    // Atualiza a medição com os novos dados
    Object.assign(measurement, updateMeasurementDto);

    // Preserva a relação com o paciente
    measurement.patient = patient;

    // Salva as alterações
    return this.measurementRepository.save(measurement);
  }

  async search(query: string, nutritionistId: string): Promise<Patient[]> {
    return this.patientRepository
      .createQueryBuilder('patient')
      .where('patient.nutritionistId = :nutritionistId', { nutritionistId })
      .andWhere(
        '(LOWER(patient.name) LIKE LOWER(:query) OR LOWER(patient.email) LIKE LOWER(:query))',
        { query: `%${query}%` },
      )
      .orderBy('patient.name', 'ASC')
      .take(5)
      .getMany();
  }

  async uploadProfilePhoto(
    id: string,
    file: Express.Multer.File,
  ): Promise<Patient> {
    const patient = await this.patientRepository.findOne({ where: { id } });
    if (!patient) {
      throw new NotFoundException(`Paciente com ID ${id} não encontrado`);
    }
    const ext = file.originalname.split('.').pop();
    const filename = `profile-${Date.now()}.${ext}`;
    const url = await this.storageService.uploadPatientPhoto(
      id,
      file.buffer,
      filename,
      file.mimetype,
    );
    patient.photoUrl = url;
    await this.patientRepository.save(patient);
    return patient;
  }
}
