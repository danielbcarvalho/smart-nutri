# SmartNutri

Sistema de gestão para nutricionistas, permitindo o acompanhamento de pacientes, avaliações nutricionais e planos alimentares.

## Estrutura do Projeto

```
smartnutri/
├── backend/     # API em NestJS
└── frontend/    # Interface em React + Material UI
```

## Requisitos

- Node.js 20.x
- PostgreSQL 15+
- npm ou yarn

## Configuração do Ambiente

### Backend (NestJS)

1. Entre no diretório do backend:

```bash
cd backend
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Execute o script de configuração do banco de dados:

```bash
./setup-db.sh
```

5. Inicie o servidor de desenvolvimento:

```bash
npm run start:dev
```

O backend estará disponível em `http://localhost:8000`

### Frontend (React + Material UI)

1. Entre no diretório do frontend:

```bash
cd frontend
```

2. Instale as dependências:

```bash
npm install
```

3. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O frontend estará disponível em `http://localhost:3000`

## Documentação

- Backend API: `http://localhost:8000/api`
- Swagger UI: `http://localhost:8000/api-docs`

## Scripts Disponíveis

### Backend

- `npm run start:dev` - Inicia o servidor em modo de desenvolvimento
- `npm run test` - Executa os testes
- `npm run build` - Compila o projeto
- `npm run start:prod` - Inicia o servidor em modo de produção

### Frontend

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Compila o projeto para produção
- `npm run preview` - Visualiza a build de produção localmente
