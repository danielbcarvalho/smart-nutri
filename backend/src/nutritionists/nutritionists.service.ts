import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Nutritionist } from './entities/nutritionist.entity';
import { CreateNutritionistDto } from './dto/create-nutritionist.dto';
import { UpdateNutritionistDto } from './dto/update-nutritionist.dto';
import { SamplePatientService } from '../patients/services/sample-patient.service';
import { StorageService } from '../supabase/storage/storage.service';
import { InstagramScrapingService } from '../services/instagram-scraping';
import { EncryptionService } from '../encryption/encryption.service';
import axios from 'axios';

@Injectable()
export class NutritionistsService {
  constructor(
    @InjectRepository(Nutritionist)
    private nutritionistRepository: Repository<Nutritionist>,
    private readonly samplePatientService: SamplePatientService,
    private readonly storageService: StorageService,
    private readonly instagramScrapingService: InstagramScrapingService,
    private readonly encryptionService: EncryptionService,
  ) {}

  private readonly selectFields: (keyof Nutritionist)[] = [
    'id',
    'name',
    'email',
    'phone',
    'crn',
    'specialties',
    'clinicName',
    'createdAt',
    'updatedAt',
    'photoUrl',
    'instagram',
  ];

  async create(
    createNutritionistDto: CreateNutritionistDto,
  ): Promise<Nutritionist> {
    // Verificar se já existe nutricionista com este email
    const existingNutritionist = await this.nutritionistRepository.findOne({
      where: { email: createNutritionistDto.email },
    });

    if (existingNutritionist) {
      throw new ConflictException('Email já cadastrado');
    }

    // Criptografar a senha de forma reversível em vez de usar hash
    const passwordHash = this.encryptionService.encrypt(
      createNutritionistDto.password,
    );

    // Criar novo nutricionista
    const nutritionist = this.nutritionistRepository.create({
      ...createNutritionistDto,
      passwordHash,
    });

    // Salvar no banco
    const savedNutritionist =
      await this.nutritionistRepository.save(nutritionist);

    // Se foi informado instagram, tenta buscar a foto e salvar no Supabase
    if (createNutritionistDto.instagram) {
      try {
        const username = createNutritionistDto.instagram.replace(/^@/, '');
        const imageUrl =
          await this.instagramScrapingService.getProfilePictureUrl(username);
        if (imageUrl) {
          // Baixar imagem
          const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
          });
          const buffer = Buffer.from(response.data);
          const contentType = response.headers['content-type'] || 'image/jpeg';
          const ext = contentType.split('/')[1] || 'jpg';
          const filename = `profile-instagram-${Date.now()}.${ext}`;
          const supabaseUrl = await this.storageService.uploadNutritionistPhoto(
            savedNutritionist.id,
            buffer,
            filename,
            contentType,
          );
          savedNutritionist.photoUrl = supabaseUrl;
          await this.nutritionistRepository.save(savedNutritionist);
        }
      } catch (e) {
        // Loga mas não impede criação
        console.warn('Falha ao buscar/salvar foto do Instagram:', e.message);
      }
    }

    // Retornar sem o passwordHash
    const result = await this.nutritionistRepository.findOne({
      where: { id: savedNutritionist.id },
      select: this.selectFields,
    });

    if (!result) {
      throw new NotFoundException(
        `Nutricionista com ID ${savedNutritionist.id} não encontrado`,
      );
    }

    // Cria paciente exemplo para o novo nutricionista
    this.samplePatientService.createSamplePatient(result.id);

    return result;
  }

  async findAll(): Promise<Nutritionist[]> {
    return this.nutritionistRepository.find({
      select: this.selectFields,
    });
  }

  async findOne(id: string): Promise<Nutritionist> {
    const nutritionist = await this.nutritionistRepository.findOne({
      where: { id },
      select: this.selectFields,
    });

    if (!nutritionist) {
      throw new NotFoundException(`Nutricionista com ID ${id} não encontrado`);
    }

    return nutritionist;
  }

  async update(
    id: string,
    updateNutritionistDto: UpdateNutritionistDto,
  ): Promise<Nutritionist> {
    const nutritionist = await this.nutritionistRepository.findOne({
      where: { id },
    });

    if (!nutritionist) {
      throw new NotFoundException(`Nutricionista com ID ${id} não encontrado`);
    }

    // Se estiver atualizando o email, verificar se já existe
    if (
      updateNutritionistDto.email &&
      updateNutritionistDto.email !== nutritionist.email
    ) {
      const existingNutritionist = await this.nutritionistRepository.findOne({
        where: { email: updateNutritionistDto.email },
      });

      if (existingNutritionist) {
        throw new ConflictException('Email já cadastrado');
      }
    }

    // Se o instagram foi alterado, faz scraping e salva nova foto
    console.log(
      '🚀 ~ nutritionists.service.ts:164 ~ updateNutritionistDto.instagram 🚀🚀🚀:',
      updateNutritionistDto.instagram,
    );
    if (
      updateNutritionistDto.instagram &&
      updateNutritionistDto.instagram !== nutritionist.instagram
    ) {
      try {
        const username = updateNutritionistDto.instagram.replace(/^@/, '');
        console.log(
          '🚀 ~ nutritionists.service.ts:166 ~ username 🚀🚀🚀:',
          username,
        );
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
          const supabaseUrl = await this.storageService.uploadNutritionistPhoto(
            id,
            buffer,
            filename,
            contentType,
          );
          updateNutritionistDto.photoUrl = supabaseUrl;
        }
      } catch (e) {
        // Loga mas não impede atualização
        console.warn('Falha ao buscar/salvar foto do Instagram:', e.message);
      }
    }

    // Atualizar nutricionista
    await this.nutritionistRepository.update(id, updateNutritionistDto);

    // Retornar nutricionista atualizado
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.nutritionistRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Nutricionista com ID ${id} não encontrado`);
    }
  }

  async findByEmail(email: string): Promise<Nutritionist | null> {
    return this.nutritionistRepository.findOne({
      where: { email },
    });
  }

  async validatePassword(
    nutritionist: Nutritionist,
    password: string,
  ): Promise<boolean> {
    try {
      // Descriptografar a senha armazenada e comparar com a fornecida
      const decryptedPassword = this.encryptionService.decrypt(
        nutritionist.passwordHash,
      );
      return decryptedPassword === password;
    } catch (error) {
      // Em caso de erro na descriptografia (pode acontecer se a senha ainda estiver em formato bcrypt)
      // Tenta o método antigo com bcrypt como fallback
      try {
        return await bcrypt.compare(password, nutritionist.passwordHash);
      } catch {
        return false;
      }
    }
  }

  async uploadProfilePhoto(
    id: string,
    file: Express.Multer.File,
  ): Promise<Nutritionist> {
    const nutritionist = await this.nutritionistRepository.findOne({
      where: { id },
    });
    if (!nutritionist) {
      throw new NotFoundException(`Nutricionista com ID ${id} não encontrado`);
    }
    const ext = file.originalname.split('.').pop();
    const filename = `profile-instagram-${Date.now()}.${ext}`;
    const url = await this.storageService.uploadNutritionistPhoto(
      id,
      file.buffer,
      filename,
      file.mimetype,
    );
    nutritionist.photoUrl = url;
    await this.nutritionistRepository.save(nutritionist);
    return nutritionist;
  }

  // Novo método para descriptografar senha (apenas para o MVP)
  async decryptPassword(nutritionistId: string): Promise<string | null> {
    const nutritionist = await this.nutritionistRepository.findOne({
      where: { id: nutritionistId },
    });

    if (!nutritionist) {
      throw new NotFoundException(
        `Nutricionista com ID ${nutritionistId} não encontrado`,
      );
    }

    try {
      return this.encryptionService.decrypt(nutritionist.passwordHash);
    } catch (error) {
      return null; // Retorna null se não conseguir descriptografar (ex: se for bcrypt)
    }
  }
}
