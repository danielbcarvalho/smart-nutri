import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Photo, PhotoType } from './entities/photo.entity';
import { StorageService } from '../supabase/storage/storage.service';
import { validate as isUuid } from 'uuid';

interface ListPhotosParams {
  patientId: string;
  assessmentId?: string;
  type?: PhotoType;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
  order?: 'asc' | 'desc';
}

@Injectable()
export class PhotosService {
  constructor(
    @InjectRepository(Photo)
    private readonly photoRepository: Repository<Photo>,
    private readonly storageService: StorageService,
  ) {}

  async uploadPhoto(params: {
    file: any;
    patientId: string;
    assessmentId?: string;
    type: PhotoType;
  }): Promise<Photo> {
    const { file, patientId, assessmentId, type } = params;

    // Se tiver assessmentId, busca e deleta fotos existentes do mesmo tipo
    if (assessmentId) {
      // Busca fotos existentes do mesmo tipo e avaliação
      const existingPhotos = await this.photoRepository.find({
        where: {
          patientId,
          assessmentId,
          type,
        },
      });

      // Deleta as fotos existentes (caso existam)
      if (existingPhotos.length > 0) {
        for (const existingPhoto of existingPhotos) {
          await this.removePhoto(existingPhoto.id);
        }

        // Aguarda um pequeno intervalo para garantir que a exclusão foi concluída
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    const ext = file.originalname.split('.').pop();
    const fileName = `${type}.${ext}`;
    const folder = assessmentId
      ? `${patientId}/${assessmentId}`
      : `${patientId}/no-assessment`;
    const storagePath = `${folder}/${fileName}`;
    // Upload para o Supabase Storage
    const url = await this.storageService.uploadPatientPhoto(
      patientId,
      file.buffer,
      `${assessmentId ? assessmentId + '_' : ''}${fileName}`,
      file.mimetype,
    );
    // Por enquanto, thumbnail é igual à url
    const thumbnailUrl = url;
    const validAssessmentId =
      assessmentId && isUuid(assessmentId) ? assessmentId : null;
    const photo = this.photoRepository.create({
      patientId,
      assessmentId: validAssessmentId,
      type,
      url,
      thumbnailUrl,
      storagePath,
    });
    return this.photoRepository.save(photo);
  }

  async listPhotos(
    params: ListPhotosParams,
  ): Promise<{ data: Photo[]; total: number; page: number; limit: number }> {
    const {
      patientId,
      assessmentId,
      type,
      from,
      to,
      page = 1,
      limit = 20,
      order = 'desc',
    } = params;
    if (!patientId) {
      return { data: [], total: 0, page, limit };
    }
    let qb: SelectQueryBuilder<Photo> = this.photoRepository
      .createQueryBuilder('photo')
      .where('photo.patientId = :patientId', { patientId })
      .andWhere('photo.deletedAt IS NULL');
    if (assessmentId) {
      qb = qb.andWhere('photo.assessmentId = :assessmentId', { assessmentId });
    }
    if (type) {
      qb = qb.andWhere('photo.type = :type', { type });
    }
    if (from) {
      qb = qb.andWhere('photo.createdAt >= :from', { from });
    }
    if (to) {
      qb = qb.andWhere('photo.createdAt <= :to', { to });
    }
    qb = qb.orderBy('photo.createdAt', order.toUpperCase() as 'ASC' | 'DESC');
    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { data, total, page, limit };
  }

  async removePhoto(id: string): Promise<void> {
    await this.photoRepository.update(id, { deletedAt: new Date() });
  }
}
