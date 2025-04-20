import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabaseClient: SupabaseClient;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');

    const supabaseKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    this.supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  get client(): SupabaseClient {
    return this.supabaseClient;
  }

  // Database methods
  async query<T>(tableName: string, query: any): Promise<T[]> {
    const { data, error } = await this.supabaseClient
      .from(tableName)
      .select()
      .match(query);

    if (error) {
      throw new Error(`Error querying ${tableName}: ${error.message}`);
    }

    return data as T[];
  }

  // Storage methods
  async uploadFile(
    bucketName: string,
    filePath: string,
    file: Buffer,
    contentType: string,
  ): Promise<string> {
    const { data, error } = await this.supabaseClient.storage
      .from(bucketName)
      .upload(filePath, file, {
        contentType,
        upsert: true,
      });

    if (error) {
      throw new Error(`Error uploading file: ${error.message}`);
    }

    return data.path;
  }

  async getFileUrl(bucketName: string, filePath: string): Promise<string> {
    const { data } = await this.supabaseClient.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async deleteFile(bucketName: string, filePath: string): Promise<void> {
    const { error } = await this.supabaseClient.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      throw new Error(`Error deleting file: ${error.message}`);
    }
  }

  async createBucket(
    bucketName: string,
    isPublic: boolean = false,
  ): Promise<void> {
    const { error } = await this.supabaseClient.storage.createBucket(
      bucketName,
      {
        public: isPublic,
      },
    );

    if (error) {
      throw new Error(`Error creating bucket: ${error.message}`);
    }
  }
}
