import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PatientsModule } from './patients/patients.module';
import { MealPlansModule } from './meal-plans/meal-plans.module';
import { FoodsModule } from './foods/foods.module';
import { StatsModule } from './stats/stats.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST') || 'localhost',
        port: configService.get('DATABASE_PORT')
          ? +configService.get('DATABASE_PORT')
          : 5432,
        username: configService.get('DATABASE_USERNAME') || 'postgres',
        password: configService.get('DATABASE_PASSWORD') || 'postgres',
        database: configService.get('DATABASE_NAME') || 'smartnutri_db',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') !== 'production',
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    PatientsModule,
    MealPlansModule,
    FoodsModule,
    StatsModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
