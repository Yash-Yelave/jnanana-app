import { createBrowserClient } from "@supabase/ssr";
import { supabaseEnv } from "@/lib/env";

export function createClient() {
  const { url, key } = supabaseEnv();
  return createBrowserClient(url, key);
}

export function publicAsset(bucket: string, path: string | null | undefined) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
    return path;
  }
  return createClient().storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
