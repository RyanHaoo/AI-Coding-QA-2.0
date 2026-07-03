import { createClient } from "@supabase/supabase-js";

import { supabaseEnv } from "@/lib/supabase/env";

const secretKey = process.env.SECRET_KEY ?? "";

if (!secretKey) {
  throw new Error("Missing SECRET_KEY");
}

export function createAdminClient() {
  return createClient(supabaseEnv.url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
