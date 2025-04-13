import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseService } from './supabase.service';
import { StorageService } from './storage/storage.service';
import { SupabaseInitService } from './supabase.init';
import { DatabaseService } from './database/database.service';

@Module({
  imports: [ConfigModule],
  providers: [
    SupabaseService,
    StorageService,
    SupabaseInitService,
    DatabaseService,
  ],
  exports: [SupabaseService, StorageService, DatabaseService],
})
export class SupabaseModule {}
