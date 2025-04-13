import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { StorageService } from './storage/storage.service';

/**
 * Service to initialize Supabase resources on application startup
 */
@Injectable()
export class SupabaseInitService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseInitService.name);

  constructor(private readonly storageService: StorageService) {}

  /**
   * Initialize Supabase resources when the module is initialized
   */
  async onModuleInit() {
    this.logger.log('Initializing Supabase resources...');

    try {
      // Initialize storage buckets
      await this.storageService.initializeBuckets();
      this.logger.log('Supabase storage buckets initialized successfully');
    } catch (error) {
      this.logger.error(
        `Failed to initialize Supabase resources: ${error.message}`,
      );
      // Don't throw the error to prevent application startup failure
      // Just log it and continue
    }
  }
}
