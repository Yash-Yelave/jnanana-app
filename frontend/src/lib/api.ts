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
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
  const isPublicPage = ["/login", "/", "/mentors", "/events", "/community", "/forgot-password", "/reset-password", "/waiting"].some(
    (p) => currentPath === p || currentPath.startsWith("/events/") || currentPath.startsWith("/mentors/")
  );

  if (!data.session?.access_token) {
    if (!isPublicPage && typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new ApiError("Authentication required", 401);
  }

  try {
    const response = await fetch(`${apiUrl()}/api/v1${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.session.access_token}`,
        ...init.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401 && !isPublicPage && typeof window !== "undefined") {
        window.location.href = "/login";
      }
      const body = (await response.json().catch(() => null)) as { detail?: string } | null;
      throw new ApiError(body?.detail ?? "Request failed", response.status);
    }
    return (response.status === 204 ? undefined : await response.json()) as T;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(err?.message || "Network error - Failed to fetch", 500);
  }
}

export interface EventItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  event_date: string;
  location: string;
  image_path?: string;
  status: string;
  created_at: string;
  participating_mentors?: any[];
}

export interface JuleWallet {
  user_id: string;
  balance: number;
  updated_at: string;
}

export interface JuleTransaction {
  id: string;
  user_id: string;
  event_id?: string;
  amount: number;
  transaction_type: string;
  related_mentor_id?: string;
  notes?: string;
  created_at: string;
}

export interface MentorshipRequestItem {
  id: string;
  mentee_id: string;
  mentor_id: string;
  event_id?: string;
  tokens_used: number;
  status: string;
  note?: string;
  created_at: string;
  updated_at: string;
  mentee_name?: string;
  mentor_name?: string;
  mentor_avatar?: string;
  mentor_headline?: string;
}

// Events API
export function getEvents() {
  return apiFetch<EventItem[]>("/events");
}

export function getEvent(id: string) {
  return apiFetch<EventItem>(`/events/${id}`);
}

export function checkinEvent(id: string) {
  return apiFetch<{ message: string; checkin_status: string; tokens_granted: number }>(`/events/${id}/checkin`, {
    method: "POST",
  });
}

// Jule Token API
export function getJuleWallet() {
  return apiFetch<JuleWallet>("/jule/wallet");
}

export function getJuleTransactions() {
  return apiFetch<JuleTransaction[]>("/jule/transactions");
}

// Mentorship Requests API
export function createMentorshipRequest(data: { mentor_id: string; event_id?: string; tokens_used?: number; note?: string }) {
  return apiFetch<MentorshipRequestItem>("/mentorship-requests", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getMyMentorshipRequests() {
  return apiFetch<MentorshipRequestItem[]>("/mentorship-requests/my");
}

export function actionMentorshipRequest(id: string, action: "accept" | "reject" | "complete" | "cancel") {
  return apiFetch<{ message: string }>(`/mentorship-requests/${id}/action`, {
    method: "POST",
    body: JSON.stringify({ action }),
  });
}

// Admin API
export function getAdminMetrics() {
  return apiFetch<Record<string, number>>("/admin/metrics");
}

export function createAdminEvent(data: { slug: string; name: string; description: string; event_date: string; location?: string }) {
  return apiFetch<EventItem>("/admin/events", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function assignMentorToEvent(eventId: string, mentorId: string) {
  return apiFetch<{ message: string }>(`/admin/events/${eventId}/mentors/${mentorId}`, {
    method: "POST",
  });
}

export function adjustUserTokens(data: { user_id: string; amount: number; notes?: string }) {
  return apiFetch<{ message: string; new_balance: number }>("/admin/tokens/adjust", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function approveMentor(mentorId: string) {
  return apiFetch<{ message: string }>(`/admin/mentors/${mentorId}/approve`, {
    method: "POST",
  });
}

export function rejectMentor(mentorId: string, reason?: string) {
  return apiFetch<{ message: string }>(`/admin/mentors/${mentorId}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

