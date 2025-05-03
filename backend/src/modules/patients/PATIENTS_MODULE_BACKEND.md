# Patients Module (`backend/src/modules/patients`)

## Overview

This module is responsible for managing patient data within the application. It handles operations related to patient profiles, anthropometric measurements, consultations, and patient photos. It interacts with the database via TypeORM and utilizes external services like Supabase for storage and an Instagram scraping service for profile pictures.

## Directory Structure

```
backend/src/modules/patients/
├── controllers/         # Contains controllers for specific sub-domains (e.g., photos, consultations)
│   ├── patient-photos.controller.ts
│   └── consultations.controller.ts
├── dto/                 # Data Transfer Objects for request/response validation and shaping
│   ├── create-consultation.dto.ts
│   ├── create-measurement.dto.ts
│   ├── create-patient-photo.dto.ts
│   ├── create-patient.dto.ts
│   ├── measurement.response.dto.ts
│   ├── patient.response.dto.ts
│   ├── update-consultation.dto.ts
│   ├── update-measurement.dto.ts
│   └── update-patient.dto.ts
├── entities/            # TypeORM entities representing database tables
│   ├── consultation.entity.ts
│   ├── measurement.entity.ts
│   ├── patient-photo.entity.ts
│   └── patient.entity.ts
├── enums/               # Enumerations used within the module
│   ├── consultation-frequency.enum.ts
│   ├── gender.enum.ts
│   ├── measurement-type.enum.ts
│   ├── monitoring-status.enum.ts
│   └── patient-status.enum.ts
├── services/            # Service classes containing business logic for sub-domains
│   ├── consultations.service.ts
│   ├── patient-photos.service.ts
│   └── sample-patient.service.ts # Service for handling sample patient data
├── patients.controller.spec.ts # Unit tests for PatientsController
├── patients.controller.ts      # Main controller handling patient and measurement endpoints
├── patients.module.ts          # NestJS module definition (imports, controllers, providers, exports)
├── patients.service.spec.ts    # Unit tests for PatientsService
├── patients.service.ts         # Main service containing core business logic for patients and measurements
└── patients.test.ts            # End-to-end tests for the patients module API
```

## Key Components

### Entities

- **`Patient`**: Represents a patient record in the database. Includes personal details, contact information, health data (goals, allergies, conditions, medications), anthropometric data (height, weight), consultation details, status, and associations with measurements, photos, consultations, and meal plans.
- **`Measurement`**: Represents a single anthropometric measurement record for a patient at a specific date. Includes weight, height, body composition data (body fat, muscle mass, etc.), detailed circumference measurements, skinfolds, bone diameters, and associations with the patient, nutritionist, and photos.
- **`PatientPhoto`**: Represents a photo associated with a patient, typically used for tracking physical evolution. Includes the photo URL (likely stored in Supabase), date, and association with the patient and potentially a specific measurement or consultation.
- **`Consultation`**: Represents a consultation session between a nutritionist and a patient. Includes date, notes, goals, and association with the patient and nutritionist.

### DTOs (Data Transfer Objects)

- **`CreatePatientDto` / `UpdatePatientDto`**: Used for creating and updating patient records via the API. Define the expected structure and validation rules for patient data.
- **`CreateMeasurementDto` / `UpdateMeasurementDto`**: Used for creating and updating measurement records. Define the structure for measurement data input.
- **`CreateConsultationDto` / `UpdateConsultationDto`**: Used for creating and updating consultation records.
- **`CreatePatientPhotoDto`**: Used for adding new patient photos.
- **`*.response.dto`**: (Potentially used) Define the structure of data returned by the API endpoints, possibly omitting sensitive information or reshaping entities.

### Services

- **`PatientsService`**:
  - Handles the core CRUD (Create, Read, Update, Delete) operations for `Patient` entities.
  - Manages `Measurement` entities associated with patients (create, find, update, delete).
  - Includes logic for searching patients.
  - Handles potential conflicts (e.g., duplicate email/CPF).
  - Integrates with `StorageService` (Supabase) for uploading patient profile photos (manual upload and fetching from Instagram).
  - Integrates with `InstagramScrapingService` to fetch profile pictures based on Instagram usernames.
- **`PatientPhotosService`**: (Located in `services/`)
  - Manages CRUD operations specifically for `PatientPhoto` entities.
  - Likely handles file uploads/deletions via `StorageService`.
- **`ConsultationsService`**: (Located in `services/`)
  - Manages CRUD operations for `Consultation` entities.
- **`SamplePatientService`**: (Located in `services/`)
  - Provides functionality related to creating or managing sample/demo patient data, potentially for new nutritionist sign-ups.

### Controllers

- **`PatientsController`**:
  - Exposes RESTful API endpoints for managing patients and their measurements.
  - Uses `JwtAuthGuard` to ensure endpoints are protected and require authentication.
  - Defines routes like `POST /patients`, `GET /patients`, `GET /patients/:id`, `PATCH /patients/:id`, `DELETE /patients/:id`.
  - Defines routes for measurements associated with a patient: `POST /patients/:id/measurements`, `GET /patients/:id/measurements`, `GET /patients/:id/measurements/evolution`, `PATCH /patients/:id/measurements/:measurementId`, `DELETE /patients/:id/measurements/:measurementId`.
  - Includes an endpoint for searching patients: `GET /patients/search`.
  - Includes an endpoint for uploading a patient's profile photo: `POST /patients/:id/photo`.
  - Uses DTOs for request body validation and Swagger documentation (`@ApiBody`, `@ApiResponse`, etc.).
  - Injects `PatientsService` to delegate business logic.
- **`PatientPhotosController`**: (Located in `controllers/`)
  - Exposes API endpoints specifically for managing patient photos (likely CRUD operations under a route like `/patients/:id/photos`).
  - Injects `PatientPhotosService`.
- **`ConsultationsController`**: (Located in `controllers/`)
  - Exposes API endpoints for managing consultations (likely CRUD operations under `/patients/:id/consultations`).
  - Injects `ConsultationsService`.

### Module Definition (`patients.module.ts`)

- Imports `TypeOrmModule.forFeature([...])` to register the necessary entities (`Patient`, `Measurement`, `PatientPhoto`, `Consultation`, etc.) with TypeORM.
- Imports `SupabaseModule` to enable interaction with Supabase services (like `StorageService`).
- Declares the controllers (`PatientsController`, `PatientPhotosController`, `ConsultationsController`).
- Provides the services (`PatientsService`, `PatientPhotosService`, `ConsultationsService`, `SamplePatientService`, `StorageService`, `InstagramScrapingService`).
- Exports the services to make them available for injection in other modules if needed.

## API Endpoints (Main Controller)

The `PatientsController` exposes the following primary endpoints (protected by JWT Auth):

- `POST /patients`: Create a new patient.
- `GET /patients`: List all patients for the authenticated nutritionist.
- `GET /patients/search?query={term}`: Search for patients by name or email.
- `GET /patients/:id`: Get details of a specific patient.
- `PATCH /patients/:id`: Update a specific patient.
- `DELETE /patients/:id`: Delete a specific patient.
- `POST /patients/:id/photo`: Upload a profile photo for a patient.
- `POST /patients/:id/measurements`: Add a new measurement for a patient.
- `GET /patients/:id/measurements`: List all measurements for a patient.
- `GET /patients/:id/measurements/evolution`: List measurements for evolution analysis (filtered by date, limited).
- `PATCH /patients/:id/measurements/:measurementId`: Update a specific measurement.
- `DELETE /patients/:id/measurements/:measurementId`: Delete a specific measurement.

_(Note: Endpoints for photos and consultations are likely defined in their respective controllers: `PatientPhotosController` and `ConsultationsController`)_

## Testing

- **Unit Tests**: Files ending in `.spec.ts` (e.g., `patients.controller.spec.ts`, `patients.service.spec.ts`) contain unit tests using Jest. They mock dependencies (like repositories and other services) to test the logic of controllers and services in isolation.
- **End-to-End (E2E) Tests**: `patients.test.ts` contains E2E tests using `supertest`. These tests run against a real instance of the application (or a test instance) to verify the behavior of the API endpoints from request to response, including database interactions.

## Dependencies

- **NestJS**: Core framework (`@nestjs/common`, `@nestjs/core`, etc.).
- **TypeORM**: Database ORM (`@nestjs/typeorm`, `typeorm`).
- **Swagger**: API documentation (`@nestjs/swagger`).
- **Class Validator/Transformer**: DTO validation.
- **Supabase**: Used for storage (`StorageService` likely interacts with `@supabase/supabase-js`).
- **Axios**: Used by `PatientsService` to fetch Instagram profile pictures.
- **Custom Services**: `InstagramScrapingService`.
- **Authentication**: `JwtAuthGuard` from the `auth` module.
