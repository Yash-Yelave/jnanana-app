const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
};

function required(name: string, value: string | undefined, fallback?: string) {
  const val = value || fallback;
  if (!val) throw new Error(`${name} is not configured`);
  return val.replace(/\/$/, "");
}

export function supabaseEnv() {
  return {
    url: required(
      "NEXT_PUBLIC_SUPABASE_URL",
      publicEnv.supabaseUrl,
      "https://tefvrtrnzmbzlqumyjej.supabase.co"
    ),
    key: required(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      publicEnv.supabaseKey,
      "sb_publishable_pdJTepVoDQWiBWJFsQfplQ_ZsnRTJjU"
    ),
  };
}

export function apiUrl() {
  return required("NEXT_PUBLIC_API_URL", publicEnv.apiUrl, "http://127.0.0.1:8000");
}

export function siteUrl() {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin.replace(/\/$/, "");
  }
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;
  return required("NEXT_PUBLIC_SITE_URL", publicEnv.siteUrl, vercelUrl || "http://localhost:3000");
}

