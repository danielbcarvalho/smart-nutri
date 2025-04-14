import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbHost = configService.get('DB_HOST');
        console.log('[TypeORM Config] DB_HOST:', dbHost);
        const dbPort = configService.get('DB_PORT');
        console.log('[TypeORM Config] DB_PORT:', dbPort);
        const dbUsername = configService.get('DB_USERNAME');
        console.log('[TypeORM Config] DB_USERNAME:', dbUsername);
        const dbPassword = configService.get('DB_PASSWORD');
        console.log('[TypeORM Config] DB_PASSWORD:', dbPassword);
        const dbDatabase = configService.get('DB_DATABASE');
        console.log('[TypeORM Config] DB_DATABASE:', dbDatabase);
        const supabaseUrl = configService.get('SUPABASE_URL');
        console.log('[TypeORM Config] SUPABASE_URL:', supabaseUrl);
        const supabaseAnonKey = configService.get('SUPABASE_ANON_KEY');
        console.log('[TypeORM Config] SUPABASE_ANON_KEY:', supabaseAnonKey);
        return {
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: +configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_DATABASE'),
          entities: [join(__dirname, '**', '*.entity.{ts,js}')],
          synchronize: false,
          logging: true,
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
