Passo 1: Modificações Necessárias

nutritionist.entity.ts: Adicione um campo para a URL da foto de perfil.

TypeScript

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('nutritionists')
export class Nutritionist {
// ... outros campos ...

@Column({ nullable: true }) // Permite que seja nulo
profilePictureUrl?: string;

@Index({ unique: true }) // Manter índice único para email
@Column()
email: string;

// ... resto da entidade ...
}
Lembre-se de gerar e executar uma migration para aplicar essa alteração no banco de dados.

create-nutritionist.dto.ts: Adicione um campo opcional para o nome de usuário do Instagram.

TypeScript

import { IsString, IsEmail, MinLength, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateNutritionistDto {
// ... outros campos (name, email, password, phone, etc.) ...

@IsString()
@IsNotEmpty()
name: string;

@IsEmail()
@IsNotEmpty()
email: string;

@IsString()
@MinLength(6)
@IsNotEmpty()
password: string;

@IsString()
@IsOptional() // Marcar como opcional
instagramUsername?: string;

// ... outros campos (crn, specialties, clinicName etc) ...
}
Passo 2: Instalar Dependências

Bash

npm install axios cheerio @supabase/supabase-js

# ou

yarn add axios cheerio @supabase/supabase-js
Passo 3: Configurar Variáveis de Ambiente (Supabase)

No seu arquivo .env (e configure o ConfigModule do NestJS para lê-lo):

Code snippet

SUPABASE_URL=SUA_URL_SUPABASE
SUPABASE_SERVICE_KEY=SUA_CHAVE_DE_SERVICO_SUPABASE
SUPABASE_BUCKET_NAME=nutritionist-profile-pictures # Ou o nome do seu bucket
Passo 4: Criar Serviço de Scraping (instagram-scraping.service.ts)

TypeScript

import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import \* as cheerio from 'cheerio';

@Injectable()
export class InstagramScrapingService {
private readonly logger = new Logger(InstagramScrapingService.name);
// MUITO IMPORTANTE: Este seletor é apenas um EXEMPLO e PROVAVELMENTE já está DESATUALIZADO.
// Você PRECISA inspecionar a página do Instagram manualmente AGORA e encontrar
// um seletor que funcione. Ele VAI QUEBRAR no futuro.
private readonly instagramImageSelector = 'img.\_aagv'; // <--- ATENÇÃO AQUI! VERIFIQUE E ATUALIZE!

async getProfilePictureUrl(username: string): Promise<string | null> {
const url = `https://www.instagram.com/${username}/`;
const headers = {
// Simular um navegador é crucial para evitar bloqueios rápidos
'User-Agent':
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
'Accept-Language': 'en-US,en;q=0.9',
};

    try {
      this.logger.log(`Attempting to scrape Instagram URL: ${url}`);
      const response = await axios.get(url, { headers });
      const html = response.data;

      const $ = cheerio.load(html);
      // --- Ponto mais frágil ---
      const imageUrl = $(this.instagramImageSelector).attr('src');
      // --- Fim do ponto frágil ---

      if (imageUrl) {
        this.logger.log(`Found potential image URL for ${username}: ${imageUrl}`);
        // Verificação básica se a URL parece válida (pode precisar de mais validações)
        if (imageUrl.startsWith('http')) {
          return imageUrl;
        } else {
             this.logger.warn(`Found src attribute, but it's not a valid URL: ${imageUrl}`);
             return null;
        }
      } else {
        this.logger.warn(`Could not find image element using selector '${this.instagramImageSelector}' for username ${username}. Page structure might have changed.`);
        // Tentar extrair de dados JSON embutidos (estratégia alternativa, mais complexa)
        // Seletor para script JSON (também MUITO instável): 'script[type="application/ld+json"]'
        // Ou procurar por window._sharedData nas tags <script>
        // Esta parte exigiria análise detalhada do HTML atual do Instagram
        // Exemplo conceitual (NÃO FUNCIONAL GARANTIDO):
        // $('script[type="application/ld+json"]').each((_, element) => {
        //    try {
        //      const jsonData = JSON.parse($(element).html());
        //      if (jsonData?.image) {
        //         potentialUrl = jsonData.image; return false; // Sai do loop
        //      }
        //    } catch(e) {/* ignora erros de parse */}
        // });
        return null;
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        this.logger.warn(`Instagram profile not found for username ${username} (404).`);
      } else {
        this.logger.error(
          `Failed to scrape Instagram profile for ${username}: ${error.message}`,
           error.stack // Log completo para depuração
        );
      }
      return null;
    }

}
}
Passo 5: Criar Serviço de Armazenamento (supabase-storage.service.ts)

TypeScript

import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'; // Para gerar nomes de arquivo únicos

@Injectable()
export class SupabaseStorageService {
private readonly logger = new Logger(SupabaseStorageService.name);
private supabase: SupabaseClient;
private bucketName: string;

constructor(private configService: ConfigService) {
const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');
this.bucketName = this.configService.get<string>('SUPABASE_BUCKET_NAME', 'default-bucket'); // Use um nome padrão ou pegue do .env

    if (!supabaseUrl || !supabaseKey) {
      this.logger.error('Supabase URL or Service Key not configured in environment variables!');
      throw new Error('Supabase configuration missing.');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
       auth: {
           // Necessário para usar RLS se configurado, mas para Service Key geralmente não
           persistSession: false
       }
    });
    this.logger.log('Supabase client initialized.');

}

async uploadImageFromUrl(imageUrl: string, username: string): Promise<string | null> {
try {
this.logger.log(`Attempting to download image from: ${imageUrl}`);
// Baixar a imagem da URL encontrada
const imageResponse = await axios.get(imageUrl, {
responseType: 'arraybuffer', // Crucial para obter os dados binários
});

      const imageBuffer = Buffer.from(imageResponse.data);
      const contentType = imageResponse.headers['content-type'] || 'image/jpeg'; // Pega o tipo ou assume jpeg
      const fileExtension = contentType.split('/')[1] || 'jpg';
      const fileName = `profile-pictures/${username}-${uuidv4()}.${fileExtension}`; // Nome único

      this.logger.log(`Uploading image to Supabase bucket '${this.bucketName}' as '${fileName}'`);

      // Fazer upload para o Supabase Storage
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(fileName, imageBuffer, {
          contentType: contentType,
          upsert: false, // Não sobrescrever se já existir (pode mudar para true se necessário)
        });

      if (error) {
        this.logger.error(`Supabase upload failed: ${error.message}`, error);
        return null;
      }

      // Obter a URL pública da imagem carregada
      const { data: publicUrlData } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(fileName);

       if (!publicUrlData?.publicUrl) {
           this.logger.error(`Failed to get public URL for uploaded file: ${fileName}`);
           // Pode ser que o bucket não seja público ou houve um erro inesperado
           return null; // Ou talvez retornar o path `data.path` se URL pública não for garantida/necessária
       }

      this.logger.log(`Image uploaded successfully. Public URL: ${publicUrlData.publicUrl}`);
      return publicUrlData.publicUrl;

    } catch (error) {
      this.logger.error(`Error processing image from URL ${imageUrl}: ${error.message}`, error.stack);
      return null;
    }

}
}
Passo 6: Integrar no NutritionistsService

TypeScript

import {
Injectable,
NotFoundException,
ConflictException,
Inject,
Logger, // Adicionar Logger
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import \* as bcrypt from 'bcrypt';
import { Nutritionist } from './entities/nutritionist.entity';
import { CreateNutritionistDto } from './dto/create-nutritionist.dto';
import { UpdateNutritionistDto } from './dto/update-nutritionist.dto';
import { SamplePatientService } from '../patients/services/sample-patient.service';
import { InstagramScrapingService } from '../instagram-scraping/instagram-scraping.service'; // Importar
import { SupabaseStorageService } from '../supabase-storage/supabase-storage.service'; // Importar

@Injectable()
export class NutritionistsService {
private readonly logger = new Logger(NutritionistsService.name); // Adicionar Logger

constructor(
@InjectRepository(Nutritionist)
private nutritionistRepository: Repository<Nutritionist>,
private readonly samplePatientService: SamplePatientService,
// Injetar os novos serviços
private readonly instagramScrapingService: InstagramScrapingService,
private readonly supabaseStorageService: SupabaseStorageService,
) {}

// ... selectFields e outros métodos ...

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

    // --- Início da Lógica de Scraping e Upload ---
    let profilePicSupabaseUrl: string | null = null;
    if (createNutritionistDto.instagramUsername) {
      const username = createNutritionistDto.instagramUsername;
      this.logger.log(`Instagram username provided: ${username}. Attempting scraping.`);
      try {
        // 1. Tentar buscar a URL da imagem no Instagram
        const instagramImageUrl =
          await this.instagramScrapingService.getProfilePictureUrl(username);

        if (instagramImageUrl) {
          this.logger.log(`Scraping successful, found image URL: ${instagramImageUrl}`);
          // 2. Se encontrou, tentar baixar e fazer upload para o Supabase
          profilePicSupabaseUrl =
            await this.supabaseStorageService.uploadImageFromUrl(
              instagramImageUrl,
              username, // Usar o username para compor o nome do arquivo
            );

          if (profilePicSupabaseUrl) {
            this.logger.log(`Supabase upload successful: ${profilePicSupabaseUrl}`);
          } else {
            this.logger.warn(`Failed to upload image from ${instagramImageUrl} to Supabase for user ${username}.`);
          }
        } else {
          this.logger.warn(`Could not find or scrape Instagram profile picture for ${username}.`);
        }
      } catch (error) {
        // Captura erros gerais no processo para não impedir o cadastro
        this.logger.error(
          `Error during scraping/upload process for Instagram user ${username}: ${error.message}`,
          error.stack,
        );
        // Garantir que profilePicSupabaseUrl permaneça null
        profilePicSupabaseUrl = null;
      }
    }
    // --- Fim da Lógica de Scraping e Upload ---

    // Hash da senha
    const passwordHash = await bcrypt.hash(createNutritionistDto.password, 10);

    // Criar novo nutricionista, incluindo a URL da foto (ou null)
    const nutritionist = this.nutritionistRepository.create({
      ...createNutritionistDto,
      passwordHash,
      profilePictureUrl: profilePicSupabaseUrl, // Adicionar a URL aqui
    });

    // Salvar no banco
    const savedNutritionist =
      await this.nutritionistRepository.save(nutritionist);

    // IMPORTANTE: Retornar sem o passwordHash
    // Ajuste o selectFields se quiser incluir profilePictureUrl por padrão
    const selectFieldsWithPic = [...this.selectFields, 'profilePictureUrl'] as (keyof Nutritionist)[];
    const result = await this.nutritionistRepository.findOne({
      where: { id: savedNutritionist.id },
      select: selectFieldsWithPic, // Usar os campos com a URL da foto
    });

    if (!result) {
      // Este erro é improvável aqui, mas mantém a consistência
      throw new NotFoundException(
        `Nutricionista com ID ${savedNutritionist.id} não encontrado após salvar.`,
      );
    }

    // Cria paciente exemplo para o novo nutricionista
    // Passar o objeto completo pode ser mais útil se o serviço precisar de mais dados
    this.samplePatientService.createSamplePatient(result.id);

    return result;

}

// ... findAll, findOne, update, remove, findByEmail, validatePassword ...
async findOne(id: string): Promise<Nutritionist> {
// Ajustar selectFields aqui também se necessário
const selectFieldsWithPic = [...this.selectFields, 'profilePictureUrl'] as (keyof Nutritionist)[];
const nutritionist = await this.nutritionistRepository.findOne({
where: { id },
select: selectFieldsWithPic,
});

    if (!nutritionist) {
      throw new NotFoundException(`Nutricionista com ID ${id} não encontrado`);
    }

    return nutritionist;

}

}
Passo 7: Registrar os Serviços no Módulo

Certifique-se de que InstagramScrapingService e SupabaseStorageService sejam registrados como providers no módulo apropriado (provavelmente NutritionistsModule ou um módulo compartilhado CoreModule/SharedModule) e que o ConfigModule esteja configurado globalmente ou importado onde for necessário.

Considerações Finais:

Seletor Instável: O ponto mais crítico é o instagramImageSelector. Você precisará monitorar e atualizar isso constantemente. Considere usar Puppeteer ou Playwright se o Cheerio não funcionar devido ao carregamento dinâmico do Instagram.
Tratamento de Erros: A lógica atual tenta fazer o scraping/upload, mas se falhar, apenas loga o erro e continua o cadastro sem a foto. Isso evita que o cadastro falhe por causa do scraping.
Performance: O processo de scraping e upload adiciona latência ao endpoint de cadastro. Para muitos cadastros simultâneos, isso pode ser um problema. Uma alternativa seria fazer isso de forma assíncrona (usando Filas/Queues, como BullMQ), mas isso aumenta a complexidade.
Alternativa de Path no Supabase: Usar o username no path do Supabase pode causar colisões se nomes de usuário forem reutilizados ou se houver caracteres especiais. Usar o ID do nutricionista seria ideal, mas ele só está disponível após o primeiro save. Uma solução seria salvar, obter o ID, e então fazer o scraping/upload em uma segunda atualização (mais complexo) ou usar um UUID como feito no exemplo do SupabaseStorageService.
Teste exaustivamente!
