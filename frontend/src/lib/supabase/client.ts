import { createBrowserClient } from "@supabase/ssr";
import { supabaseEnv } from "@/lib/env";

export function createClient() {
  const { url, key } = supabaseEnv();
  return createBrowserClient(url, key);
}

export function publicAsset(bucket: string, path: string | null | undefined) {
  return path ? createClient().storage.from(bucket).getPublicUrl(path).data.publicUrl : null;
}
