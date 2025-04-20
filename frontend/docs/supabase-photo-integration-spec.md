# Supabase Photo Integration Technical Specification

## Overview

This document outlines the technical specifications for integrating Supabase storage and database for handling patient assessment photos in the SmartNutri application.

## Storage Structure

### Bucket Configuration

```typescript
const BUCKET_NAME = "assessment-photos";
const BUCKET_CONFIG = {
  public: false,
  allowedMimeTypes: ["image/jpeg", "image/png"],
  maxFileSize: 5 * 1024 * 1024, // 5MB
};
```

### File Organization

```
assessment-photos/
├── {patientId}/
│   ├── {assessmentId}/
│   │   ├── front.jpg
│   │   ├── back.jpg
│   │   ├── left.jpg
│   │   ├── right.jpg
│   │   └── thumbnails/
│   │       ├── front.jpg
│   │       ├── back.jpg
│   │       ├── left.jpg
│   │       └── right.jpg
│   └── {assessmentId2}/
└── {patientId2}/
```

## Database Schema

```sql
-- Assessment Photos Table
create table public.assessment_photos (
  id uuid default uuid_generate_v4() primary key,
  assessment_id uuid references public.assessments(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete cascade,
  type text check (type in ('front', 'back', 'left', 'right')),
  url text not null,
  thumbnail_url text,
  storage_path text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone,

  -- Ensure unique photo type per assessment
  unique(assessment_id, type, deleted_at)
);

-- RLS Policies
alter table public.assessment_photos enable row level security;
```

## Security Policies

### Storage Policies

```sql
-- Read access
create policy "Users can view their patient photos"
on storage.objects for select
to authenticated
using (
  bucket_id = 'assessment-photos' and
  (auth.uid() in (
    select nutritionist_id
    from public.patients
    where id = (storage.foldername(name))[1]::uuid
  ))
);

-- Write access
create policy "Users can upload patient photos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'assessment-photos' and
  (auth.uid() in (
    select nutritionist_id
    from public.patients
    where id = (storage.foldername(name))[1]::uuid
  ))
);

-- Delete access
create policy "Users can delete their patient photos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'assessment-photos' and
  (auth.uid() in (
    select nutritionist_id
    from public.patients
    where id = (storage.foldername(name))[1]::uuid
  ))
);
```

### Database Policies

```sql
-- Read policy
create policy "Users can view their patient photos"
on public.assessment_photos for select
to authenticated
using (
  patient_id in (
    select id from public.patients
    where nutritionist_id = auth.uid()
  )
);

-- Insert policy
create policy "Users can create photos for their patients"
on public.assessment_photos for insert
to authenticated
with check (
  patient_id in (
    select id from public.patients
    where nutritionist_id = auth.uid()
  )
);

-- Update policy
create policy "Users can update their patient photos"
on public.assessment_photos for update
to authenticated
using (
  patient_id in (
    select id from public.patients
    where nutritionist_id = auth.uid()
  )
);

-- Delete policy
create policy "Users can delete their patient photos"
on public.assessment_photos for delete
to authenticated
using (
  patient_id in (
    select id from public.patients
    where nutritionist_id = auth.uid()
  )
);
```

## Service Layer Implementation

```typescript
// src/services/photoService.ts

import { supabase } from "../lib/supabase";
import { generateThumbnail } from "../utils/imageUtils";

interface UploadPhotoParams {
  file: File;
  type: "front" | "back" | "left" | "right";
  patientId: string;
  assessmentId: string;
  onProgress?: (progress: number) => void;
}

interface AssessmentPhoto {
  id: string;
  type: "front" | "back" | "left" | "right";
  url: string;
  thumbnailUrl: string;
  storagePath: string;
  createdAt: Date;
  updatedAt: Date;
}

export class PhotoService {
  private static BUCKET = "assessment-photos";

  static async uploadPhoto({
    file,
    type,
    patientId,
    assessmentId,
    onProgress,
  }: UploadPhotoParams): Promise<AssessmentPhoto> {
    try {
      // Generate thumbnail
      const thumbnail = await generateThumbnail(file);

      // Construct storage paths
      const fileName = `${type}.${file.name.split(".").pop()}`;
      const thumbnailName = `thumbnails/${type}.jpg`;
      const storagePath = `${patientId}/${assessmentId}/${fileName}`;
      const thumbnailPath = `${patientId}/${assessmentId}/${thumbnailName}`;

      // Upload original photo
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from(this.BUCKET)
        .upload(storagePath, file, {
          upsert: true,
          onUploadProgress: (progress) => {
            onProgress?.(progress);
          },
        });

      if (uploadError) throw uploadError;

      // Upload thumbnail
      const { error: thumbnailError } = await supabase.storage
        .from(this.BUCKET)
        .upload(thumbnailPath, thumbnail, {
          upsert: true,
          contentType: "image/jpeg",
        });

      if (thumbnailError) throw thumbnailError;

      // Get URLs
      const { data: urlData } = await supabase.storage
        .from(this.BUCKET)
        .createSignedUrl(storagePath, 3600); // 1 hour expiry

      const { data: thumbnailUrlData } = await supabase.storage
        .from(this.BUCKET)
        .createSignedUrl(thumbnailPath, 3600);

      // Create database record
      const { data: photo, error: dbError } = await supabase
        .from("assessment_photos")
        .insert({
          assessment_id: assessmentId,
          patient_id: patientId,
          type,
          url: urlData?.signedUrl,
          thumbnail_url: thumbnailUrlData?.signedUrl,
          storage_path: storagePath,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      return this.transformPhotoData(photo);
    } catch (error) {
      console.error("Error uploading photo:", error);
      throw error;
    }
  }

  static async getAssessmentPhotos(
    assessmentId: string
  ): Promise<AssessmentPhoto[]> {
    const { data, error } = await supabase
      .from("assessment_photos")
      .select("*")
      .eq("assessment_id", assessmentId)
      .is("deleted_at", null);

    if (error) throw error;

    return data.map(this.transformPhotoData);
  }

  static async deletePhoto(photoId: string): Promise<void> {
    const { data: photo, error: fetchError } = await supabase
      .from("assessment_photos")
      .select("storage_path")
      .eq("id", photoId)
      .single();

    if (fetchError) throw fetchError;

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(this.BUCKET)
      .remove([
        photo.storage_path,
        photo.storage_path.replace(/([^/]+)$/, "thumbnails/$1"),
      ]);

    if (storageError) throw storageError;

    // Soft delete database record
    const { error: dbError } = await supabase
      .from("assessment_photos")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", photoId);

    if (dbError) throw dbError;
  }

  private static transformPhotoData(photo: any): AssessmentPhoto {
    return {
      id: photo.id,
      type: photo.type,
      url: photo.url,
      thumbnailUrl: photo.thumbnail_url,
      storagePath: photo.storage_path,
      createdAt: new Date(photo.created_at),
      updatedAt: new Date(photo.updated_at),
    };
  }
}
```

## Error Handling

### Storage Errors

1. Upload Failures

   - File size exceeded
   - Invalid file type
   - Storage quota exceeded
   - Network timeout

2. Access Errors

   - Unauthorized access
   - Invalid credentials
   - Expired URLs

3. Delete Errors
   - File not found
   - Permission denied
   - Concurrent deletion

### Database Errors

1. Constraint Violations

   - Unique constraint
   - Foreign key constraint
   - Check constraint

2. Transaction Errors
   - Deadlock
   - Timeout
   - Connection lost

## Performance Optimization

1. Image Processing

   - Client-side compression
   - Thumbnail generation
   - Format optimization

2. Caching Strategy

   - URL caching
   - Thumbnail caching
   - Database query caching

3. Batch Operations
   - Bulk uploads
   - Parallel processing
   - Connection pooling

## Testing Strategy

1. Unit Tests

   - Service methods
   - Error handling
   - Data transformation

2. Integration Tests

   - Storage operations
   - Database operations
   - Security policies

3. E2E Tests
   - Complete upload flow
   - Access control
   - Error scenarios

## Monitoring and Logging

1. Storage Metrics

   - Upload success rate
   - Storage usage
   - Response times

2. Database Metrics

   - Query performance
   - Error rates
   - Connection pool status

3. Application Logs
   - Error tracking
   - Usage patterns
   - Security events

## Future Considerations

1. CDN Integration

   - Global content delivery
   - Cache management
   - URL optimization

2. Advanced Features

   - Image processing pipeline
   - Batch operations
   - Version control

3. Scalability
   - Sharding strategy
   - Load balancing
   - Backup solutions
