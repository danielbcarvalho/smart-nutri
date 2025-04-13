# Supabase Environment Setup

Este documento descreve como configurar os ambientes de desenvolvimento e produção para a integração com o Supabase.

## Visão Geral

O projeto utiliza o Supabase para:

- Banco de dados PostgreSQL
- Armazenamento de arquivos (imagens de pacientes)

## Configuração de Ambiente

### Arquivos de Ambiente

O projeto utiliza arquivos `.env` específicos para cada ambiente:

**Frontend:**

- `.env.development` - Configurações para desenvolvimento
- `.env.production` - Configurações para produção

**Backend:**

- `.env.development` - Configurações para desenvolvimento
- `.env.production` - Configurações para produção

### Scripts de Configuração

Incluímos scripts para facilitar a troca entre ambientes:

**Frontend:**

```bash
# Configurar ambiente de desenvolvimento
npm run setup:env:dev

# Configurar ambiente de produção
npm run setup:env:prod
```

**Backend:**

```bash
# Configurar ambiente de desenvolvimento
npm run setup:env:dev

# Configurar ambiente de produção
npm run setup:env:prod
```

## Scripts de Execução

### Frontend

```bash
# Executar em modo desenvolvimento
npm run dev

# Executar em modo produção
npm run dev:prod

# Build para produção
npm run build
```

### Backend

```bash
# Executar em modo desenvolvimento
npm run dev

# Executar em modo produção
npm run dev:prod

# Build para produção
npm run build:prod
```

## Buckets de Armazenamento

O sistema utiliza os seguintes buckets no Supabase:

- `patient-photos` - Fotos de pacientes
- `documents` - Documentos médicos
- `temp-uploads` - Uploads temporários

## Recomendações

1. Crie projetos separados no Supabase para desenvolvimento e produção
2. Configure as políticas de segurança adequadas para cada ambiente
3. Realize backups regulares do banco de dados de produção
4. Mantenha as chaves de acesso seguras e não as compartilhe
