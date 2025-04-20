import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase.service';

@Injectable()
export class StorageService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Upload a patient photo
   * @param patientId The ID of the patient
   * @param file The file buffer
   * @param filename The name of the file
   * @param contentType The content type of the file
   * @returns The URL of the uploaded file
   */
  async uploadPatientPhoto(
    patientId: string,
    file: Buffer,
    filename: string,
    contentType: string,
  ): Promise<string> {
    const bucketName =
      this.configService.get<string>(
        'supabase.storage.buckets.patientPhotos',
      ) || 'patient-photos';
    const filePath = `${patientId}/${filename}`;

    await this.supabaseService.uploadFile(
      bucketName,
      filePath,
      file,
      contentType,
    );
    return this.supabaseService.getFileUrl(bucketName, filePath);
  }

  /**
   * Upload a nutritionist profile photo
   * @param nutritionistId The ID of the nutritionist
   * @param file The file buffer
   * @param filename The name of the file
   * @param contentType The content type of the file
   * @returns The URL of the uploaded file
   */
  async uploadNutritionistPhoto(
    nutritionistId: string,
    file: Buffer,
    filename: string,
    contentType: string,
  ): Promise<string> {
    const bucketName =
      this.configService.get<string>(
        'supabase.storage.buckets.nutritionistPhotos',
      ) || 'nutritionist-photos';
    const filePath = `${nutritionistId}/${filename}`;

    console.log('🚀 ~ storage.service.ts:57 ~ bucketName 🚀🚀🚀:', bucketName);
    await this.supabaseService.uploadFile(
      bucketName,
      filePath,
      file,
      contentType,
    );
    return this.supabaseService.getFileUrl(bucketName, filePath);
  }

  /**
   * Upload a document
   * @param folder The folder to upload to
   * @param file The file buffer
   * @param filename The name of the file
   * @param contentType The content type of the file
   * @returns The URL of the uploaded file
   */
  async uploadDocument(
    folder: string,
    file: Buffer,
    filename: string,
    contentType: string,
  ): Promise<string> {
    const bucketName =
      this.configService.get<string>('supabase.storage.buckets.documents') ||
      'documents';
    const filePath = `${folder}/${filename}`;

    await this.supabaseService.uploadFile(
      bucketName,
      filePath,
      file,
      contentType,
    );
    return this.supabaseService.getFileUrl(bucketName, filePath);
  }

  /**
   * Delete a file
   * @param bucketName The name of the bucket
   * @param filePath The path to the file
   */
  async deleteFile(bucketName: string, filePath: string): Promise<void> {
    await this.supabaseService.deleteFile(bucketName, filePath);
  }

  /**
   * Get the URL of a file
   * @param bucketName The name of the bucket
   * @param filePath The path to the file
   * @returns The URL of the file
   */
  async getFileUrl(bucketName: string, filePath: string): Promise<string> {
    return this.supabaseService.getFileUrl(bucketName, filePath);
  }

  /**
   * Initialize storage buckets
   * This should be called during application bootstrap
   */
  async initializeBuckets(): Promise<void> {
    const buckets = this.configService.get('supabase.storage.buckets') || {
      patientPhotos: 'patient-photos',
      documents: 'documents',
      tempUploads: 'temp-uploads',
    };

    // Create patient photos bucket (private)
    await this.createBucketIfNotExists(buckets.patientPhotos, false);

    // Create documents bucket (private)
    await this.createBucketIfNotExists(buckets.documents, false);

    // Create temp uploads bucket (private)
    await this.createBucketIfNotExists(buckets.tempUploads, false);
  }

  /**
   * Create a bucket if it doesn't exist
   * @param bucketName The name of the bucket
   * @param isPublic Whether the bucket is public
   */
  private async createBucketIfNotExists(
    bucketName: string,
    isPublic: boolean,
  ): Promise<void> {
    try {
      await this.supabaseService.createBucket(bucketName, isPublic);
    } catch (error) {
      // Bucket might already exist, which is fine
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
  }
}
