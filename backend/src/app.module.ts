import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PatientsModule } from './patients/patients.module';
import { FoodsModule } from './foods/foods.module';
import { MealPlansModule } from './meal-plans/meal-plans.module';
import { SearchModule } from './search/search.module';
import { StatsModule } from './stats/stats.module';
import { NutritionistsModule } from './nutritionists/nutritionists.module';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<TypeOrmModuleOptions> => {
        const config = configService.get<TypeOrmModuleOptions>('database');
        if (!config) {
          throw new Error('Database configuration not found');
        }
        return config;
      },
    }),
    PatientsModule,
    FoodsModule,
    MealPlansModule,
    SearchModule,
    StatsModule,
    NutritionistsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
