import { createBrowserClient } from "@supabase/ssr";
import { supabaseEnv } from "@/lib/env";

export function createClient() {
  const { url, key } = supabaseEnv();
  return createBrowserClient(url, key);
}

export function publicAsset(bucket: string, path: string | null | undefined) {
  if (!path || typeof path !== "string" || path.trim() === "") return null;
  const trimmed = path.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
    return trimmed;
  }
  return createClient().storage.from(bucket).getPublicUrl(trimmed).data.publicUrl;
}
