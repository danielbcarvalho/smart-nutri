# Patient Photos Implementation

This document provides information about the implementation of the PatientPhoto feature, which allows storing and managing patient progress photos.

## Background

The PatientPhoto feature was added to support visual progress tracking for patients. This allows nutritionists to:

1. Upload and store photos of patients at different stages of their nutrition plans
2. Categorize photos by type (front, back, left side, right side)
3. Track visual progress over time
4. Associate photos with specific dates for chronological tracking

## Implementation Details

### Database Schema

The feature adds a new `patient_photos` table with the following structure:

- `id` (PK) - UUID, unique identifier
- `patient_id` (FK) - Reference to the patient
- `nutritionist_id` (FK) - Reference to the nutritionist who uploaded the photo
- `photo_url` - URL to the stored photo
- `photo_type` - Type of photo (front, back, left_side, right_side, other)
- `photo_date` - Date when the photo was taken
- `notes` - Optional notes about the photo
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Entity and DTOs

1. **PatientPhoto Entity**

   - Defines the database schema and relationships
   - Includes an enum for photo types

2. **CreatePatientPhotoDto**

   - Validates input for creating new photos
   - Includes required fields: patientId, photoUrl, photoType, photoDate

3. **UpdatePatientPhotoDto**
   - Validates input for updating existing photos
   - All fields are optional for partial updates

### Service Layer

The `PatientPhotosService` provides methods for:

- Creating new patient photos
- Retrieving photos (all, by ID, by type, by date range)
- Updating photo information
- Deleting photos
- Counting photos by patient

### API Endpoints

The API endpoints are defined in the `PatientPhotosController` and follow RESTful conventions:

- `POST /patients/:patientId/photos` - Create a new photo
- `GET /patients/:patientId/photos` - Get all photos for a patient
- `GET /patients/:patientId/photos/type/:type` - Get photos by type
- `GET /patients/:patientId/photos/date-range` - Get photos within a date range
- `GET /patients/:patientId/photos/:id` - Get a specific photo
- `PATCH /patients/:patientId/photos/:id` - Update a photo
- `DELETE /patients/:patientId/photos/:id` - Delete a photo

## Usage

### Creating a Photo

```typescript
// Example of creating a new patient photo
const createPhotoDto = {
  patientId: '123e4567-e89b-12d3-a456-426614174000',
  photoUrl: 'https://storage.example.com/photos/patient123-front.jpg',
  photoType: PhotoType.FRONT,
  photoDate: new Date(),
  notes: 'Initial assessment photo',
};

// In a service or controller with PatientPhotosService injected
const newPhoto = await this.patientPhotosService.create(
  createPhotoDto,
  nutritionistId,
);
```

### Retrieving Photos

```typescript
// Get all photos for a patient
const photos = await this.patientPhotosService.findAll(patientId);

// Get photos by type
const frontPhotos = await this.patientPhotosService.findByType(
  patientId,
  PhotoType.FRONT,
);

// Get photos within a date range
const dateRangePhotos = await this.patientPhotosService.findPhotosByDateRange(
  patientId,
  startDate,
  endDate,
);
```

## Security Considerations

- Photos are associated with both a patient and the nutritionist who uploaded them
- Access control should be implemented to ensure only authorized nutritionists can access patient photos
- The actual photo storage is handled externally, with only the URL stored in the database

## Future Enhancements

Potential future enhancements for the PatientPhoto feature:

1. Add support for photo comparison tools
2. Implement automatic body measurements from photos
3. Add support for video uploads
4. Implement photo galleries and timeline views
5. Add support for patient comments on photos

## Related Files

- `backend/src/migrations/1712500100000-CreatePatientPhotosTable.ts`
- `backend/src/patients/entities/patient-photo.entity.ts`
- `backend/src/patients/dto/create-patient-photo.dto.ts`
- `backend/src/patients/dto/update-patient-photo.dto.ts`
- `backend/src/patients/services/patient-photos.service.ts`
- `backend/src/patients/controllers/patient-photos.controller.ts`
