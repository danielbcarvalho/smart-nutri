import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração do CORS
  const allowedOrigins: string[] = [
    'http://localhost:3001',
    'http://localhost:3000',
    process.env.FRONTEND_URL, // URL do frontend em produção
  ].filter((origin): origin is string => Boolean(origin)); // Ensure only strings are included

  console.log('Allowed CORS origins:', allowedOrigins);

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
  });

  // Configuração da validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 8000;

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('SmartNutri API')
    .setDescription(
      `
      # SmartNutri API Documentation
      
      API para gestão completa de nutrição, incluindo:
      - Gestão de pacientes
      - Avaliações nutricionais
      - Planos alimentares
      - Base de dados de alimentos
      
      ## Autenticação
      Esta API utiliza autenticação JWT (Bearer Token).
      
      ## Endpoints Principais
      - /patients: Gerenciamento de pacientes
      - /measurements: Medições e avaliações
      - /meal-plans: Planos alimentares
      - /foods: Alimentos e informações nutricionais
    `,
    )
    .setVersion('1.0')
    .addTag('patients', 'Gerenciamento de pacientes e suas informações')
    .addTag(
      'measurements',
      'Gerenciamento de medições e avaliações nutricionais',
    )
    .addTag('meal-plans', 'Gerenciamento de planos alimentares e refeições')
    .addTag('foods', 'Gerenciamento de alimentos e informações nutricionais')
    .addBearerAuth()
    .addServer(`http://localhost:${port}`, 'Servidor de Desenvolvimento')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    customSiteTitle: 'SmartNutri API Documentation',
    customfavIcon: 'https://nestjs.com/img/logo_text.svg',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui-themes/3.0.0/themes/3.x/theme-material.css',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui-themes/3.0.0/themes/3.x/theme-material.css',
    ],
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      deepLinking: true,
      displayRequestDuration: true,
      urls: [
        {
          url: `http://localhost:${port}/api-docs-json`,
          name: 'API Documentation',
        },
      ],
    },
  });

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(
    `Swagger documentation is available at: http://localhost:${port}/api-docs`,
  );
}
bootstrap();
