# SmartNutri API

## Descrição

API do SmartNutri, um sistema para gerenciamento de pacientes e planos alimentares para nutricionistas.

## Funcionalidades

- Autenticação de nutricionistas
- Gerenciamento de pacientes
- Gerenciamento de planos alimentares
- Templates de planos alimentares
- Busca avançada de alimentos
- Acompanhamento de medidas e progresso
- Geração de relatórios

## Tecnologias

- Node.js
- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- JWT
- Swagger

## Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Executar migrations
npm run migration:run

# Iniciar em modo desenvolvimento
npm run start:dev
```

## Documentação da API

A documentação da API está disponível através do Swagger UI em `/api/docs` quando a aplicação está em execução.

### Endpoints Principais

#### Autenticação

- POST /auth/login - Login de nutricionista
- POST /auth/register - Registro de nutricionista

#### Pacientes

- GET /patients - Listar pacientes
- POST /patients - Criar paciente
- GET /patients/:id - Buscar paciente
- PATCH /patients/:id - Atualizar paciente
- DELETE /patients/:id - Remover paciente

#### Planos Alimentares

- GET /meal-plans - Listar planos alimentares
- POST /meal-plans - Criar plano alimentar
- GET /meal-plans/:id - Buscar plano alimentar
- PATCH /meal-plans/:id - Atualizar plano alimentar
- DELETE /meal-plans/:id - Remover plano alimentar

#### Templates de Planos Alimentares

- GET /meal-plan-templates - Listar templates
- POST /meal-plan-templates - Criar template
- GET /meal-plan-templates/:id - Buscar template
- PATCH /meal-plan-templates/:id - Atualizar template
- DELETE /meal-plan-templates/:id - Remover template
- GET /meal-plan-templates/search/foods - Buscar alimentos
- POST /meal-plan-templates/:id/create-plan/:patientId - Criar plano a partir de template

## Contribuição

1. Faça o fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
