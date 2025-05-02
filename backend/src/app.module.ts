import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { NutritionistsModule } from './nutritionists/nutritionists.module';
import { PatientsModule } from './patients/patients.module';
import { MealPlansModule } from './meal-plans/meal-plans.module';
import { StatsModule } from './stats/stats.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { join } from 'path';
import { SearchModule } from './search/search.module';
import { SupabaseModule } from './supabase/supabase.module';
import { PhotosModule } from './photos/photos.module';
import { EncryptionModule } from './encryption/encryption.module';
import { FoodsModule } from './foods/foods.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbHost = configService.get('DB_HOST');
        const dbPort = configService.get('DB_PORT');
        const dbUsername = configService.get('DB_USERNAME');
        const dbPassword = configService.get('DB_PASSWORD');
        const dbDatabase = configService.get('DB_DATABASE');
        const supabaseUrl = configService.get('SUPABASE_URL');
        const supabaseAnonKey = configService.get('SUPABASE_ANON_KEY');
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
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const mongoUri = configService.get('MONGODB_URI');

        const defaultUri = 'mongodb://localhost:27017/tbca_database';

        console.log(
          'Conectando ao MongoDB usando URI: ' + (mongoUri || defaultUri),
        );

        return {
          uri: mongoUri || defaultUri,
          // Forçar o uso do banco de dados tbca_database
          dbName: 'tbca_database',
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
