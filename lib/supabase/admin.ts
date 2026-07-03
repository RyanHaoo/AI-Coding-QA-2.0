import { createClient } from "@supabase/supabase-js";

import { supabaseEnv } from "@/lib/supabase/env";

type AdminClient = ReturnType<typeof createClient>;

let adminClient: AdminClient | null = null;

export function createAdminClient() {
  if (!adminClient) {
    const secretKey = process.env.SECRET_KEY ?? "";

    if (!secretKey) {
      throw new Error("Missing SECRET_KEY");
    }

    adminClient = createClient(supabaseEnv.url, secretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
}
