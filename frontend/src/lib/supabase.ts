import { createClient } from "@supabase/supabase-js";

if (!import.meta.env.VITE_SUPABASE_URL) {
  throw new Error("Missing environment variable: VITE_SUPABASE_URL");
}

if (!import.meta.env.VITE_SUPABASE_SERVICE_ROLE) {
  throw new Error("Missing environment variable: VITE_SUPABASE_ANON_KEY");
}

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
