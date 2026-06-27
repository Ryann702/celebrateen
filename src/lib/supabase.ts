import { createClient } from "@supabase/supabase-js";

function getJwtRole(key: string) {
  const [, payload] = key.split(".");

  if (!payload) {
    return null;
  }

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = Buffer.from(normalized, "base64").toString("utf8");
    const claims = JSON.parse(decoded) as { role?: string };

    return claims.role ?? null;
  } catch {
    return null;
  }
}

export function createSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !key) {
    throw new Error(
      "Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no servidor.",
    );
  }

  if (
    key.startsWith("sb_publishable_") ||
    key.startsWith("sb_anon_") ||
    key.toLowerCase().includes("anon")
  ) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY está usando uma chave anon/publishable. Use a service_role/secret key do Supabase.",
    );
  }

  const role = getJwtRole(key);

  if (role !== null && role !== "service_role") {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY precisa ser a chave service_role, não a anon/publishable key.",
    );
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
