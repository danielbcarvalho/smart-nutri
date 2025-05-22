import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Photo, PhotoType } from './entities/photo.entity';
import { validate as isUuid } from 'uuid';
import { StorageService } from '../../supabase/storage/storage.service';

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

    const ext = file.originalname.split('.').pop();
    const uniqueId = Date.now();
    const fileName = `${type}_${uniqueId}.${ext}`;
    const folder = assessmentId
      ? `${patientId}/${assessmentId}`
      : `${patientId}/no-assessment`;
    const storagePath = `${folder}/${fileName}`;
    const url = await this.storageService.uploadPatientPhoto(
      patientId,
      file.buffer,
      fileName,
      file.mimetype,
    );
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
