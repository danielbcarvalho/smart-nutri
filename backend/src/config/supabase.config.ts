import { registerAs } from '@nestjs/config';

export const supabaseConfig = registerAs('supabase', () => {
  const url = process.env.SUPABASE_URL;
  console.log('🚀 ~ supabase.config.ts:5 ~ url 🚀🚀🚀:', url);
  const anonKey = process.env.SUPABASE_ANON_KEY;
  console.log('🚀 ~ supabase.config.ts:7 ~ anonKey 🚀🚀🚀:', anonKey);
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  console.log(
    '🚀 ~ supabase.config.ts:9 ~ serviceRoleKey 🚀🚀🚀:',
    serviceRoleKey,
  );

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
