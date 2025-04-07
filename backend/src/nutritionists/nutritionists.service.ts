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

@Injectable()
export class NutritionistsService {
  constructor(
    @InjectRepository(Nutritionist)
    private nutritionistRepository: Repository<Nutritionist>,
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

    // Hash da senha
    const passwordHash = await bcrypt.hash(createNutritionistDto.password, 10);

    // Criar novo nutricionista
    const nutritionist = this.nutritionistRepository.create({
      ...createNutritionistDto,
      passwordHash,
    });

    // Salvar no banco
    const savedNutritionist =
      await this.nutritionistRepository.save(nutritionist);

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
    return bcrypt.compare(password, nutritionist.passwordHash);
  }
}
