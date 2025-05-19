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

  app.enableCors({
    origin: '*', // Permitir todas as origens em MVP
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
      
      Para autenticar-se:
      1. Utilize o endpoint /auth/login para obter um token
      2. Clique no botão "Authorize" (cadeado) no topo da página
      3. Insira o token no formato: Bearer seu_token_aqui
      4. O token será usado em todas as requisições protegidas
      
      ## Endpoints Principais
      - /patients: Gerenciamento de pacientes
      - /measurements: Medições e avaliações
      - /meal-plans: Planos alimentares
      - /foods: Alimentos e informações nutricionais
      
      ## Funcionalidades Específicas para MVP
      - /nutritionists/{id}/password: Endpoint para recuperar a senha de um nutricionista (apenas para MVP)
    `,
    )
    .setVersion('1.0')
    .addTag('auth', 'Autenticação e autorização')
    .addTag('nutritionists', 'Gerenciamento de nutricionistas')
    .addTag('patients', 'Gerenciamento de pacientes e suas informações')
    .addTag(
      'measurements',
      'Gerenciamento de medições e avaliações nutricionais',
    )
    .addTag('meal-plans', 'Gerenciamento de planos alimentares e refeições')
    .addTag('foods', 'Gerenciamento de alimentos e informações nutricionais')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('https://smart-nutri-flame.vercel.app', 'Servidor de Produção')
    .addServer(`http://localhost:${port}`, 'Servidor de Desenvolvimento')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Configuração do Swagger UI
  SwaggerModule.setup('api', app, document, {
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
      operationSorter: 'alpha',
      tagSorter: 'alpha',
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
    },
  });

  // Alias para api-docs
  SwaggerModule.setup('api-docs', app, document);

  console.log(`🚀 Aplicação iniciada na porta ${port}`);
  console.log(
    `📚 Documentação Swagger disponível em: http://localhost:${port}/api`,
  );

  await app.listen(port);
}
bootstrap();
