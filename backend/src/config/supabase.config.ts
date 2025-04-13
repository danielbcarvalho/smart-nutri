import { registerAs } from '@nestjs/config';

export const supabaseConfig = registerAs('supabase', () => {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceRoleKey) {
    throw new Error('Missing Supabase configuration');
  }

  return {
    url,
    anonKey,
    serviceRoleKey,
    storage: {
      buckets: {
        patientPhotos: 'patient-photos',
        documents: 'documents',
        tempUploads: 'temp-uploads',
      },
    },
  };
});
