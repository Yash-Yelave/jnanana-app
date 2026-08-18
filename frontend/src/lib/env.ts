const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
};

function required(name: string, value: string | undefined) {
  if (!value) throw new Error(`${name} is not configured`);
  return value.replace(/\/$/, "");
}

export function supabaseEnv() {
  return {
    url: required("NEXT_PUBLIC_SUPABASE_URL", publicEnv.supabaseUrl),
    key: required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", publicEnv.supabaseKey),
  };
}

export function apiUrl() {
  return required("NEXT_PUBLIC_API_URL", publicEnv.apiUrl);
}

export function siteUrl() {
  return required("NEXT_PUBLIC_SITE_URL", publicEnv.siteUrl);
}
