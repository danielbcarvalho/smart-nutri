import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NutritionistsModule } from './modules/nutritionists/nutritionists.module';
import { MealPlansModule } from './modules/meal-plan/meal-plans.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { join } from 'path';
import { SearchModule } from './modules/search/search.module';
import { SupabaseModule } from './supabase/supabase.module';
import { EncryptionModule } from './encryption/encryption.module';
import { FoodsModule } from './modules/foods/foods.module';
import { AuthModule } from './modules/auth/auth.module';
import { PatientsModule } from './modules/patients/patients.module';
import { StatsModule } from './modules/stats/stats.module';
import { PhotosModule } from './modules/photos/photos.module';
import { EnergyPlanModule } from './modules/energy-plan/energy-plan.module';
import { AiMealPlansModule } from './modules/ai-meal-plans/ai-meal-plans.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        if (databaseUrl) {
          console.log(
            '🚀 ~ app.module.ts:29 ~ databaseUrl 🚀🚀🚀:',
            databaseUrl,
          );
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [join(__dirname, '**', '*.entity.{ts,js}')],
            synchronize: false,
            logging: false,
          };
        }
        console.log(
          '🚀 ~ app.module.ts:41 ~ DB_HOST 🚀🚀🚀:',
          configService.get('DB_HOST'),
        );
        return {
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: +configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_DATABASE'),
          entities: [join(__dirname, '**', '*.entity.{ts,js}')],
          synchronize: false,
          logging: false,
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    NutritionistsModule,
    PatientsModule,
    MealPlansModule,
    StatsModule,
    SearchModule,
    SupabaseModule,
    PhotosModule,
    EncryptionModule,
    FoodsModule,
    EnergyPlanModule,
    AiMealPlansModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
