import { supabase } from "../lib/supabase";

export interface UploadPhotoParams {
  file: File;
  type: "front" | "back" | "left" | "right";
  patientId: string;
  assessmentId: string;
}

export interface AssessmentPhoto {
  id: string;
  type: "front" | "back" | "left" | "right";
  url: string;
  thumbnailUrl: string;
  storagePath: string;
  createdAt: Date;
  updatedAt: Date;
}

export class PhotoService {
  private static BUCKET = "patient-photos";

  static async uploadPhoto({
    file,
    type,
    patientId,
    assessmentId,
  }: UploadPhotoParams): Promise<AssessmentPhoto> {
    // Mock de thumbnail (usar o próprio arquivo por enquanto)
    const thumbnail = file;
    const fileName = `${type}.${file.name.split(".").pop()}`;
    const thumbnailName = `thumbnails/${type}.jpg`;
    const storagePath = `${patientId}/${assessmentId}/${fileName}`;
    const thumbnailPath = `${patientId}/${assessmentId}/${thumbnailName}`;

    // Upload original
    const { error: uploadError } = await supabase.storage
      .from(this.BUCKET)
      .upload(storagePath, file, {
        upsert: true,
      });
    if (uploadError) throw uploadError;

    // Upload thumbnail (mock)
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
      .createSignedUrl(storagePath, 3600);
    const { data: thumbnailUrlData } = await supabase.storage
      .from(this.BUCKET)
      .createSignedUrl(thumbnailPath, 3600);

    // Criar registro no banco
    const { data: photo, error: dbError } = await supabase
      .from(this.BUCKET)
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
  }

  static async getAssessmentPhotos(
    assessmentId: string
  ): Promise<AssessmentPhoto[]> {
    const { data, error } = await supabase
      .from(this.BUCKET)
      .select("*")
      .eq("assessment_id", assessmentId)
      .is("deleted_at", null);
    if (error) throw error;
    return data.map(this.transformPhotoData);
  }

  static async deletePhoto(photoId: string): Promise<void> {
    const { data: photo, error: fetchError } = await supabase
      .from(this.BUCKET)
      .select("storage_path")
      .eq("id", photoId)
      .single();
    if (fetchError) throw fetchError;
    const { error: storageError } = await supabase.storage
      .from(this.BUCKET)
      .remove([
        photo.storage_path,
        photo.storage_path.replace(/([^/]+)$/, "thumbnails/$1"),
      ]);
    if (storageError) throw storageError;
    const { error: dbError } = await supabase
      .from(this.BUCKET)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", photoId);
    if (dbError) throw dbError;
  }

  private static transformPhotoData(photo: {
    [key: string]: unknown;
  }): AssessmentPhoto {
    return {
      id: photo.id as string,
      type: photo.type as "front" | "back" | "left" | "right",
      url: photo.url as string,
      thumbnailUrl: photo.thumbnail_url as string,
      storagePath: photo.storage_path as string,
      createdAt: new Date(photo.created_at as string),
      updatedAt: new Date(photo.updated_at as string),
    };
  }
}
