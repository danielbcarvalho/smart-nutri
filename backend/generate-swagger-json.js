const { NestFactory } = require('@nestjs/core');
const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');
const { writeFileSync } = require('fs');
const { join } = require('path');
const { AppModule } = require('./dist/app.module');

async function generateSwaggerJson() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('SmartNutri API')
    .setDescription('API para gestão completa de nutrição')
    .setVersion('1.0')
    .addTag('patients', 'Gerenciamento de pacientes e suas informações')
    .addTag('meal-plans', 'Gerenciamento de planos alimentares e refeições')
    .addTag('foods', 'Gerenciamento de alimentos e informações nutricionais')
    .addBearerAuth()
    .addServer('http://localhost:8000', 'Servidor de Desenvolvimento')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Salva o documento em um arquivo JSON
  const outputPath = join(__dirname, 'swagger.json');
  writeFileSync(outputPath, JSON.stringify(document, null, 2));

  console.log(`Documentação Swagger salva em: ${outputPath}`);

  await app.close();
}

generateSwaggerJson();
