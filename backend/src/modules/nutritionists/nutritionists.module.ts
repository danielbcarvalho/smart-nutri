import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NutritionistsService } from './nutritionists.service';
import { NutritionistsController } from './nutritionists.controller';
import { Nutritionist } from './entities/nutritionist.entity';
import { SupabaseModule } from '../../supabase/supabase.module';
import { EncryptionModule } from '../../encryption/encryption.module';
import { InstagramScrapingService } from '../../services/instagram-scraping';
import { PatientsModule } from '../patients/patients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Nutritionist]),
    PatientsModule,
    SupabaseModule,
    EncryptionModule,
  ],
  controllers: [NutritionistsController],
  providers: [NutritionistsService, InstagramScrapingService],
  exports: [NutritionistsService],
})
export class NutritionistsModule {}
