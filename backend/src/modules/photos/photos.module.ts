import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Photo } from './entities/photo.entity';
import { PhotosService } from './photos.service';
import { PhotosController } from './photos.controller';
import { StorageService } from '../../supabase/storage/storage.service';
import { SupabaseModule } from '../../supabase/supabase.module';

@Module({
  imports: [TypeOrmModule.forFeature([Photo]), ConfigModule, SupabaseModule],
  providers: [PhotosService, StorageService],
  controllers: [PhotosController],
  exports: [PhotosService],
})
export class PhotosModule {}
