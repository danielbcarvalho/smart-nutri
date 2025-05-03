<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

Backend da aplicação SmartNutri, desenvolvido com NestJS e TypeORM.

---

## Sample Patient Feature

A partir de agora, todo nutricionista recém-cadastrado recebe automaticamente um "paciente exemplo" (flag `isSample: true`) vinculado à sua conta. Este paciente contém dados fictícios realistas, incluindo avaliações, consultas e plano alimentar, permitindo que o nutricionista explore e aprenda a plataforma sem precisar cadastrar um paciente real inicialmente.

- O paciente exemplo é facilmente identificável e não interfere nos dados reais.
- O campo `isSample` pode ser utilizado para filtrar ou ocultar pacientes de demonstração em listagens e relatórios.
- O paciente exemplo é criado automaticamente logo após o cadastro do nutricionista.

---

## Supabase Integration

Este projeto utiliza Supabase como backend para banco de dados e armazenamento de arquivos em todos os ambientes (desenvolvimento, staging e produção).

### Variáveis de ambiente

Adicione as seguintes variáveis ao seu arquivo `.env` (veja `.env.example`):

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Consulte o arquivo [docs/SUPABASE_INTEGRATION_PLAN.md](../docs/SUPABASE_INTEGRATION_PLAN.md) para o plano completo de integração e etapas detalhadas de configuração.

## Documentation

- [API Documentation](./API_DOCUMENTATION.md)
- [Database & Migrations](./DATABASE_DOCUMENTATION.md)

Para detalhes completos sobre os endpoints da API e o esquema do banco de dados, consulte os arquivos acima.

## Project setup

```bash
$ npm install
```

## Configuração do Banco de Dados

O projeto usa PostgreSQL como banco de dados. Agora, você pode configurar a conexão de duas formas:

### 1. Usando DATABASE_URL (recomendado para Railway, Render, Heroku, etc)

Adicione ao seu arquivo `.env`:

```env
DATABASE_URL=postgres://usuario:senha@host:porta/nome_do_banco
```

> Se a variável `DATABASE_URL` estiver presente, ela será usada automaticamente para conectar ao banco.

### 2. Usando variáveis separadas (modo legado)

Se preferir, pode continuar usando as variáveis separadas:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha
DB_DATABASE=smartnutri_db
```

> Se `DATABASE_URL` não estiver definida, o sistema usará as variáveis acima.

2. Crie o banco de dados:

```bash
createdb smartnutri_db
```

3. Execute as migrations:

```bash
npm run migration:run
```

Para mais detalhes sobre como gerenciar o banco de dados e migrations, consulte o [Guia de Migrations](MIGRATION_GUIDE.md).

## Scripts de Limpeza e Reset

O projeto inclui scripts para limpar os dados do banco de dados e o armazenamento Supabase quando necessário:

### Reset Completo (Banco de Dados + Supabase Storage)

```bash
# Reset do ambiente de desenvolvimento
node scripts/reset-all.js

# Reset do ambiente de produção
NODE_ENV=production node scripts/reset-all.js
```

### Apenas Banco de Dados

```bash
# Limpar apenas os dados do banco de desenvolvimento
node scripts/clean-dev-db.js

# Limpar apenas os dados do banco de produção
node scripts/clean-prod-db.js
```

### Apenas Supabase Storage

```bash
# Limpar apenas o armazenamento de desenvolvimento
node scripts/clean-supabase-storage.js

# Limpar apenas o armazenamento de produção
NODE_ENV=production node scripts/clean-supabase-storage.js
```

> ⚠️ **ATENÇÃO**: Os scripts mantêm a estrutura do banco de dados, mas eliminam permanentemente todos os dados das tabelas e arquivos do armazenamento. Use com extrema cautela, especialmente em ambiente de produção. Agora, os scripts executam imediatamente, sem confirmação manual.

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

---

## Plano de Melhoria do Fluxo de Upload de Fotos

### Diagnóstico Atual

- O upload de fotos atualmente é feito diretamente do frontend para o Supabase Storage.
- O registro de metadados é feito via Supabase REST API, resultando em erro 404 (endpoint/tabela inexistente ou configuração incorreta).
- Não há endpoints REST no backend para upload, listagem ou remoção de fotos.
- Não há tabela documentada para fotos no banco de dados.
- O frontend está acoplado ao Supabase, dificultando abstração, controle e segurança.

### Problemas Identificados

- Acoplamento do frontend ao provedor de storage (Supabase).
- Falta de controle centralizado de regras de negócio, validação e logging.
- Risco de exposição de chaves sensíveis do Supabase no frontend.
- Dificuldade de manutenção, evolução e implementação de lógica adicional (ex: thumbnails, quotas, logs).

### Proposta de Solução

#### Backend

- Criar endpoints REST para upload, listagem e remoção de fotos:
  - `POST /photos` (upload de foto)
  - `GET /photos?assessmentId=...` (listagem de fotos por avaliação)
  - `DELETE /photos/:id` (remoção de foto)
- O backend será responsável por:
  - Receber o arquivo (multipart/form-data) e metadados.
  - Validar permissões e dados.
  - Fazer upload para o Supabase Storage (ou outro provedor).
  - Gerenciar registros no banco de dados.
  - Retornar URLs seguras para o frontend.

#### Frontend

- Refatorar o serviço de upload de fotos para consumir apenas os endpoints do backend.
- Remover dependência direta do Supabase e chaves sensíveis do frontend.

#### Banco de Dados

- Criar tabela `photos` para armazenar metadados das fotos (id, patient_id, assessment_id, tipo, url, thumbnail, storage_path, timestamps, etc).
- Garantir integridade referencial e possibilidade de soft delete.

#### Segurança

- Chaves do Supabase devem ficar restritas ao backend.
- Implementar autenticação e autorização nos endpoints de fotos.

#### Documentação

- Atualizar documentação da API e banco de dados para refletir os novos fluxos e endpoints.

### Benefícios Esperados

- Centralização de regras de negócio, validação e segurança.
- Facilidade de manutenção e evolução futura.
- Menor exposição de chaves e dados sensíveis.
- Possibilidade de processamento adicional (thumbnails, logs, quotas, etc).

---

## Novidade: Foto de Perfil do Instagram para Pacientes

Agora, ao cadastrar ou editar um paciente e informar o campo `instagram`, o backend tentará buscar automaticamente a foto de perfil do Instagram e salvar em `photo_url` do paciente, utilizando o Supabase Storage. Isso funciona de forma semelhante ao fluxo já existente para nutricionistas.

## Scraping do Instagram com Proxy Residencial (Bright Data)

Para evitar bloqueios do Instagram em ambientes de produção/cloud, é possível utilizar um proxy residencial da Bright Data. O serviço de scraping do Instagram detecta automaticamente as seguintes variáveis de ambiente para ativar o proxy:

Adicione ao seu arquivo `.env`:

```env
BRIGHTDATA_PROXY_HOST=zproxy.lum-superproxy.io
BRIGHTDATA_PROXY_PORT=22225
BRIGHTDATA_PROXY_USER=lum-customer-USER-zone-YOURZONE
BRIGHTDATA_PROXY_PASS=YOUR_PASSWORD
```

- Se essas variáveis não estiverem presentes, o scraping funcionará sem proxy (comportamento padrão).
- Consulte a documentação da Bright Data para obter seu endpoint, usuário e senha.
- O uso de proxy pode gerar custos adicionais conforme o volume de tráfego.

- O log de queries do banco de dados (TypeORM) está desabilitado por padrão para evitar poluição de logs e melhorar a performance. Caso precise ativar para debug, altere a opção 'logging' para true em 'src/app.module.ts' e 'src/config/typeorm.migrations.config.ts'.
