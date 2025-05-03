# Auth Module (`backend/src/modules/auth`)

## Overview

This module handles authentication for nutritionists within the application. It provides the login functionality, validates credentials against the `NutritionistsModule`, and generates JSON Web Tokens (JWT) for securing subsequent API requests.

## Directory Structure

```
backend/src/modules/auth/
├── auth.controller.ts  # Controller handling the login endpoint
├── auth.module.ts      # NestJS module definition
├── auth.service.ts     # Service containing authentication logic
├── decorators/         # Custom decorators (if any, content not provided)
├── dto/                # Data Transfer Objects for authentication requests
│   └── login.dto.ts    # DTO for the login request body
├── enums/              # Enumerations related to auth (if any, content not provided)
├── guards/             # Authentication guards (e.g., JwtAuthGuard)
│   └── jwt-auth.guard.ts # Guard to protect routes using JWT strategy
├── interfaces/         # TypeScript interfaces for data structures
│   └── jwt-payload.interface.ts # Interface defining the JWT payload structure
└── strategies/         # Passport.js strategies for authentication
    └── jwt.strategy.ts # Strategy for validating JWTs
```

## Key Components

### Entities

- This module does not define its own entities but relies on the `Nutritionist` entity from the `NutritionistsModule`.

### DTOs (Data Transfer Objects)

- **`LoginDto`**: Defines the expected request body for the login endpoint, containing `email` and `password`.

### Interfaces

- **`JwtPayload`**: Defines the structure of the data encoded within the JWT. It includes the nutritionist's ID (`sub`), email (`email`), and role (`role`).

### Services

- **`AuthService`**:
  - Contains the core logic for the login process.
  - Injects `NutritionistsService` to find the nutritionist by email and validate the provided password.
  - Injects `JwtService` to generate the JWT (`access_token`) upon successful authentication.
  - Returns the `access_token` and selected nutritionist details upon successful login.
  - Throws `UnauthorizedException` if credentials are invalid.

### Controllers

- **`AuthController`**:
  - Exposes the RESTful API endpoint for nutritionist login (`POST /auth/login`).
  - Uses `LoginDto` for request body validation.
  - Injects `AuthService` to handle the login logic.
  - Uses Swagger decorators (`@ApiTags`, `@ApiOperation`, `@ApiResponse`) for API documentation.

### Strategies

- **`JwtStrategy`**: (Located in `strategies/`)
  - Implements the Passport.js strategy for validating JWTs.
  - Configured to extract the JWT from the Authorization header (Bearer token).
  - Uses the `JWT_SECRET` (from environment variables via `ConfigService`) to verify the token's signature.
  - Validates the payload structure against `JwtPayload`.
  - If the token is valid, it typically returns the payload, which NestJS attaches to the `request.user` object for use in protected routes.

### Guards

- **`JwtAuthGuard`**: (Located in `guards/`)
  - A NestJS guard that utilizes the `JwtStrategy`.
  - Applied to controllers or specific routes (like in `PatientsController` or `NutritionistsController`) using `@UseGuards(JwtAuthGuard)` to protect them.
  - Ensures that only requests with a valid JWT can access the protected resource.

### Module Definition (`auth.module.ts`)

- Imports `NutritionistsModule` to access `NutritionistsService`.
- Imports `PassportModule` for authentication support.
- Imports and configures `JwtModule.registerAsync` to:
  - Set up JWT generation and validation.
  - Asynchronously load the `JWT_SECRET` from `ConfigService` (environment variables).
  - Configure token options like expiration time (`expiresIn`).
- Declares the `AuthController`.
- Provides `AuthService` and `JwtStrategy`.
- Exports `AuthService` (potentially for use in other modules, although direct use might be limited).

## API Endpoints

- `POST /auth/login`: Authenticates a nutritionist based on email and password. Returns an `access_token` and nutritionist details on success.

## Authentication Flow (Login)

1.  A client sends a `POST` request to `/auth/login` with `email` and `password` in the request body (`LoginDto`).
2.  `AuthController` receives the request and calls `authService.login()`.
3.  `AuthService` uses `nutritionistsService.findByEmail()` to find the user.
4.  If the user exists, `AuthService` calls `nutritionistsService.validatePassword()` to compare the provided password with the stored encrypted hash.
5.  If the password is valid, `AuthService` creates a `JwtPayload` containing user ID, email, and role.
6.  `AuthService` uses `jwtService.sign()` to generate an `access_token` based on the payload and the configured `JWT_SECRET`.
7.  `AuthService` returns an object containing the `access_token` and basic nutritionist information.
8.  The client receives the `access_token` and should include it in the `Authorization: Bearer <token>` header for subsequent requests to protected endpoints.

## Dependencies

- **NestJS**: Core framework, Passport integration (`@nestjs/passport`), JWT module (`@nestjs/jwt`), Config module (`@nestjs/config`).
- **Passport**: Core authentication library (`passport`).
- **Passport-JWT**: Strategy for JWT authentication (`passport-jwt`, `@types/passport-jwt`).
- **Custom Modules**: `NutritionistsModule`.
