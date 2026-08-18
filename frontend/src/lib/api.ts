import { createClient } from "@/lib/supabase/client";
import { apiUrl } from "@/lib/env";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  if (!data.session?.access_token) throw new ApiError("Authentication required", 401);

  const response = await fetch(`${apiUrl()}/api/v1${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${data.session.access_token}`,
      ...init.headers,
    },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new ApiError(body?.detail ?? "Request failed", response.status);
  }
  return (response.status === 204 ? undefined : await response.json()) as T;
}
