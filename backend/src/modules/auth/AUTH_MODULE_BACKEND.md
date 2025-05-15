# Auth Module (`backend/src/modules/auth`)

## Overview

This module handles authentication and authorization for the application. It provides login functionality, validates credentials, generates JSON Web Tokens (JWT), and implements role-based access control (RBAC) for securing API endpoints.

## Directory Structure

```
backend/src/modules/auth/
├── auth.controller.ts     # Controller handling the login endpoint
├── auth.module.ts         # NestJS module definition
├── auth.service.ts        # Service containing authentication logic
├── decorators/           # Custom decorators
│   └── roles.decorator.ts # Decorator for role-based access control
├── dto/                  # Data Transfer Objects
│   └── login.dto.ts      # DTO for the login request body
├── enums/                # Enumerations
│   └── user-role.enum.ts # User roles enumeration
├── guards/               # Authentication and authorization guards
│   ├── jwt-auth.guard.ts # Guard for JWT authentication
│   └── roles.guard.ts    # Guard for role-based access control
├── interfaces/           # TypeScript interfaces
│   └── jwt-payload.interface.ts # JWT payload structure
└── strategies/           # Passport.js strategies
    └── jwt.strategy.ts   # JWT validation strategy
```

## Key Components

### Enums

- **`UserRole`**: Defines the available user roles in the system:
  ```typescript
  export enum UserRole {
    ADMIN = 'admin',
    NUTRITIONIST = 'nutritionist',
    PATIENT = 'patient',
  }
  ```

### Decorators

- **`Roles`**: Custom decorator for role-based access control:
  ```typescript
  export const ROLES_KEY = 'roles';
  export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
  ```

### Guards

- **`JwtAuthGuard`**: Protects routes using JWT authentication:

  ```typescript
  @Injectable()
  export class JwtAuthGuard extends AuthGuard('jwt') {}
  ```

- **`RolesGuard`**: Implements role-based access control:

  ```typescript
  @Injectable()
  export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
      const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );

      if (!requiredRoles) {
        return true;
      }

      const { user } = context.switchToHttp().getRequest();
      return requiredRoles.some((role) => user.role === role);
    }
  }
  ```

### Services

- **`AuthService`**:
  - Handles user authentication
  - Validates credentials
  - Generates JWT tokens
  - Returns user information and access token

### Controllers

- **`AuthController`**:
  - Exposes the login endpoint (`POST /auth/login`)
  - Uses `LoginDto` for request validation
  - Returns JWT token and user information

## API Endpoints

### POST /auth/login

Authenticates a user and returns a JWT token.

**Request Body**:

```typescript
{
  email: string;
  password: string;
}
```

**Response**:

```typescript
{
  access_token: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
  }
}
```

## Authentication Flow

1. User sends login request with credentials
2. `AuthController` receives request and calls `authService.login()`
3. `AuthService` validates credentials
4. If valid, generates JWT token with user information
5. Returns token and user details
6. Client includes token in subsequent requests

## Authorization Flow

1. Protected route receives request with JWT token
2. `JwtAuthGuard` validates token and attaches user to request
3. `RolesGuard` checks user's role against required roles
4. If authorized, request proceeds to handler
5. If unauthorized, returns 403 Forbidden

## Security Considerations

1. JWT tokens are signed with a secure secret key
2. Tokens have expiration time
3. Role-based access control for all protected routes
4. Password hashing for secure storage
5. Input validation using DTOs

## Usage Example

```typescript
// Protecting a route with authentication and role-based access
@Controller('energy-plans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnergyPlanController {
  @Post()
  @Roles(UserRole.NUTRITIONIST)
  create(@Body() createDto: CreateEnergyPlanDto) {
    // Only authenticated nutritionists can access this endpoint
  }

  @Get()
  @Roles(UserRole.NUTRITIONIST, UserRole.PATIENT)
  findAll() {
    // Both nutritionists and patients can access this endpoint
  }
}
```

## Dependencies

- **NestJS**: Core framework
- **Passport**: Authentication middleware
- **JWT**: Token generation and validation
- **Class Validator**: Input validation
- **Class Transformer**: Object transformation

## Best Practices

1. Always use guards for protected routes
2. Implement role-based access control
3. Validate all input data
4. Use secure password hashing
5. Implement token expiration
6. Handle authentication errors gracefully
7. Log authentication attempts
8. Implement rate limiting for login attempts
