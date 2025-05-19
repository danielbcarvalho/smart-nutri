# Nutritionists Module (`backend/src/modules/nutritionists`)

## Overview

This module is responsible for managing nutritionist data within the application. It handles operations related to nutritionist profiles, including creation, retrieval, updates, and deletion. It also manages profile photo uploads (manual and via Instagram scraping) and interacts with authentication and encryption services for password handling.

## Directory Structure

```
backend/src/modules/nutritionists/
├── dto/                 # Data Transfer Objects for request/response validation
│   ├── create-nutritionist.dto.ts
│   └── update-nutritionist.dto.ts
├── entities/            # TypeORM entities representing database tables
│   └── nutritionist.entity.ts
├── nutritionists.controller.ts # Controller handling API endpoints for nutritionists
├── nutritionists.module.ts     # NestJS module definition
└── nutritionists.service.ts    # Service containing business logic for nutritionists
```

_(Note: Test files like `.spec.ts` or `.test.ts` were not provided in the context but typically reside here as well.)_

## Key Components

### Entities

- **`Nutritionist`**: Represents a nutritionist record in the database. Includes personal details (name, email, phone, CRN), professional information (specialties, clinic name), encrypted password hash (`passwordHash`), profile photo URL (`photoUrl`), Instagram handle (`instagram`), and timestamps (`createdAt`, `updatedAt`).

### DTOs (Data Transfer Objects)

- **`CreateNutritionistDto`**: Used for creating new nutritionist records via the API. Defines the expected structure and validation rules, including password.
- **`UpdateNutritionistDto`**: Used for updating existing nutritionist records. Defines the fields that can be updated.

### Services

- **`NutritionistsService`**:
  - Handles the core CRUD (Create, Read, Update, Delete) operations for `Nutritionist` entities.
  - Manages password handling:
    - Encrypts passwords upon creation using `EncryptionService`.
    - Validates passwords during login attempts, comparing provided passwords with the stored encrypted hash (includes fallback logic for potential legacy bcrypt hashes).
    - Provides a (temporary MVP) method to decrypt passwords (`decryptPassword`).
  - Handles potential conflicts (e.g., duplicate email).
  - Integrates with `StorageService` (Supabase) for uploading nutritionist profile photos (manual upload and fetching from Instagram).
  - Integrates with `InstagramScrapingService` to fetch profile pictures based on Instagram usernames provided during creation or update.
  - Integrates with `SamplePatientService` (from `PatientsModule`) to create a sample patient when a new nutritionist is created.
  - Selects specific fields (`selectFields`) to avoid exposing sensitive data like `passwordHash` in standard responses.

### Controllers

- **`NutritionistsController`**:
  - Exposes RESTful API endpoints for managing nutritionists.
  - Defines routes like `POST /nutritionists`, `GET /nutritionists`, `GET /nutritionists/:id`, `PATCH /nutritionists/:id`, `DELETE /nutritionists/:id`.
  - Includes an endpoint for uploading a nutritionist's profile photo: `POST /nutritionists/:id/photo`.
  - Includes a temporary MVP endpoint (`GET /nutritionists/:id/password`) protected by `JwtAuthGuard` to retrieve a decrypted password.
  - Uses DTOs for request body validation and Swagger documentation (`@ApiBody`, `@ApiResponse`, etc.).
  - Injects `NutritionistsService` to delegate business logic.

### Module Definition (`nutritionists.module.ts`)

- Imports `TypeOrmModule.forFeature([Nutritionist])` to register the `Nutritionist` entity with TypeORM.
- Imports `PatientsModule` to access `SamplePatientService`.
- Imports `SupabaseModule` to enable interaction with Supabase services (like `StorageService`).
- Imports `EncryptionModule` to access `EncryptionService`.
- Declares the `NutritionistsController`.
- Provides the `NutritionistsService` and `InstagramScrapingService`.
- Exports `NutritionistsService` to make it available for injection in other modules (e.g., the `AuthModule`).

## API Endpoints

The `NutritionistsController` exposes the following primary endpoints:

- `POST /nutritionists`: Create a new nutritionist.
- `GET /nutritionists`: List all nutritionists (returns selected fields).
- `GET /nutritionists/:id`: Get details of a specific nutritionist (returns selected fields).
- `PATCH /nutritionists/:id`: Update a specific nutritionist.
- `DELETE /nutritionists/:id`: Delete a specific nutritionist.
- `POST /nutritionists/:id/photo`: Upload a profile photo for a nutritionist.
- `GET /nutritionists/:id/password` (JWT Auth Required): Retrieve the decrypted password for a nutritionist (MVP only).

## Dependencies

- **NestJS**: Core framework (`@nestjs/common`, `@nestjs/core`, etc.).
- **TypeOrm**: Database ORM (`@nestjs/typeorm`, `typeorm`).
- **Swagger**: API documentation (`@nestjs/swagger`).
- **Class Validator/Transformer**: DTO validation.
- **Bcrypt**: Used as a fallback for password comparison.
- **Supabase**: Used for storage (`StorageService`).
- **Axios**: Used by `NutritionistsService` to fetch Instagram profile pictures.
- **Custom Modules/Services**:
  - `PatientsModule` (for `SamplePatientService`)
  - `SupabaseModule` (for `StorageService`)
  - `EncryptionModule` (for `EncryptionService`)
  - `InstagramScrapingService`
- **Authentication**: `JwtAuthGuard` from the `auth` module (used for the password decryption endpoint).

## MVP Password Handling

⚠️ **IMPORTANTE: Esta é uma implementação temporária para a fase de MVP**

Durante a fase de MVP, o sistema está utilizando um bypass temporário no gerenciamento de senhas:

1. As senhas são armazenadas em texto puro no banco de dados (campo `passwordHash`)
2. A validação de senha é feita por comparação direta de strings
3. Não há criptografia ou hash sendo aplicado

**Razão para o bypass:**

- Facilita o desenvolvimento e testes durante a fase de MVP
- Permite recuperação rápida de senhas esquecidas
- Simplifica o processo de debug

**⚠️ AVISOS IMPORTANTES:**

- Esta implementação NÃO é segura para produção
- Deve ser substituída por uma implementação segura antes do lançamento
- Não deve ser usada em ambiente de produção
- Apenas para desenvolvimento e testes

**Plano de migração pós-MVP:**

1. Implementar hash seguro com bcrypt
2. Migrar todas as senhas existentes para o novo formato
3. Remover o bypass e implementar recuperação de senha segura
4. Atualizar a documentação com as novas práticas de segurança
