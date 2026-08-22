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

/**
 * The message to actually show a person.
 *
 * Every call site used to write `err instanceof Error ? err.message : "..."`,
 * which reads as a safe fallback but never fires: a failed fetch rejects with a
 * TypeError, that *is* an Error, so the humane sentence was skipped and the
 * browser's own wording reached the screen — "Failed to fetch" in Chrome,
 * "Load failed" in Safari, "NetworkError when attempting to fetch a resource"
 * in Firefox. None of it means anything to a user.
 */
export function friendlyError(reason: unknown, fallback: string): string {
  // Server-authored messages are written for people; keep them.
  if (reason instanceof ApiError) return reason.message;
  if (reason instanceof TypeError) {
    return "We couldn't reach Jnanana. Check your connection and try again.";
  }
  if (reason instanceof Error && reason.message.trim()) return reason.message;
  return fallback;
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
  } catch (err: unknown) {
    if (err instanceof ApiError) throw err;
    const message = err instanceof Error ? err.message : "Network error - Failed to fetch";
    throw new ApiError(message, 500);
  }
}

/**
 * For endpoints the API serves without a session. `apiFetch` throws whenever
 * there is no token, so anything it backs is invisible to logged-out visitors —
 * which is exactly who the landing page is for.
 */
export async function publicFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${apiUrl()}/api/v1${path}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    throw new ApiError("Request failed", response.status);
  }
  return (await response.json()) as T;
}

export interface ProgrammeStats {
  mentors: number;
  mentees: number;
  mentorship_minutes: number;
}

export function getProgrammeStats() {
  return publicFetch<ProgrammeStats>("/stats");
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
}

export interface JoolsWallet {
  user_id: string;
  balance: number;
  updated_at: string;
}
export type JuleWallet = JoolsWallet;

export interface JoolsTransaction {
  id: string;
  user_id: string;
  event_id?: string;
  amount: number;
  transaction_type: string;
  related_mentor_id?: string;
  notes?: string;
  created_at: string;
}
export type JuleTransaction = JoolsTransaction;

export interface MentorshipRequestItem {
  id: string;
  mentee_id: string;
  mentor_id: string;
  event_id?: string;
  tokens_used: number;
  status: string;
  note?: string;
  duration_minutes?: number | null;
  created_at: string;
  updated_at: string;
  mentee_name?: string;
  mentor_name?: string;
  mentor_avatar?: string;
  mentor_headline?: string;
}

// Events API
let cachedEventsData: EventItem[] | null = null;
let cachedEventsPromise: Promise<EventItem[]> | null = null;

export function getCachedEvents(): EventItem[] | null {
  return cachedEventsData;
}

export function getEvents(forceRefresh = false): Promise<EventItem[]> {
  if (!forceRefresh && cachedEventsData !== null) {
    return Promise.resolve(cachedEventsData);
  }
  if (!forceRefresh && cachedEventsPromise !== null) {
    return cachedEventsPromise;
  }
  cachedEventsPromise = publicFetch<EventItem[]>("/events")
    .then((data) => {
      cachedEventsData = data ?? [];
      cachedEventsPromise = null;
      return cachedEventsData;
    })
    .catch((err: unknown) => {
      cachedEventsPromise = null;
      throw err;
    });
  return cachedEventsPromise;
}

export function getEvent(id: string) {
  return publicFetch<EventItem>(`/events/${id}`);
}

export function getMyParticipation(id: string) {
  return apiFetch<{ registered: boolean; checkin_status: string; tokens_allocated: boolean }>(
    `/events/${id}/me`,
  );
}

export function checkinEvent(id: string) {
  return apiFetch<{ message: string; checkin_status: string; tokens_granted: number }>(`/events/${id}/checkin`, {
    method: "POST",
  });
}

// Jools Token API
export function getJoolsWallet() {
  return apiFetch<JoolsWallet>("/jools/wallet");
}
export const getJuleWallet = getJoolsWallet;

export function getJoolsTransactions() {
  return apiFetch<JoolsTransaction[]>("/jools/transactions");
}
export const getJuleTransactions = getJoolsTransactions;

// Mentorship Requests API
export function createMentorshipRequest(data: { mentor_id: string; event_id?: string; tokens_used?: number; note?: string }) {
  return apiFetch<MentorshipRequestItem>("/mentorship-requests", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

let cachedRequestsData: MentorshipRequestItem[] | null = null;
let cachedRequestsPromise: Promise<MentorshipRequestItem[]> | null = null;

export function getCachedRequests(): MentorshipRequestItem[] | null {
  return cachedRequestsData;
}

export function getMyMentorshipRequests(forceRefresh = false) {
  if (!forceRefresh && cachedRequestsData !== null) {
    return Promise.resolve(cachedRequestsData);
  }
  if (!forceRefresh && cachedRequestsPromise !== null) {
    return cachedRequestsPromise;
  }
  cachedRequestsPromise = apiFetch<MentorshipRequestItem[]>("/mentorship-requests/my")
    .then((data) => {
      cachedRequestsData = data ?? [];
      cachedRequestsPromise = null;
      return cachedRequestsData;
    })
    .catch((err: unknown) => {
      cachedRequestsPromise = null;
      throw err;
    });
  return cachedRequestsPromise;
}

export function actionMentorshipRequest(
  id: string,
  action: "accept" | "reject" | "complete" | "cancel",
  durationMinutes?: number,
) {
  return apiFetch<{ message: string; status: string }>(`/mentorship-requests/${id}/action`, {
    method: "POST",
    body: JSON.stringify({ action, duration_minutes: durationMinutes }),
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


export interface Participant {
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: string;
  registration_status: string;
  checkin_status: string;
  tokens_allocated: boolean;
  jule_balance: number;
}

export interface AdminRequest {
  id: string;
  mentee_name: string;
  mentor_name: string;
  event_name: string | null;
  tokens_used: number;
  status: string;
  created_at: string;
}

/** Unlike getEvents(), this includes drafts and completed events. */
export function getAdminEvents() {
  return apiFetch<EventItem[]>("/admin/events");
}

export function getEventParticipants(eventId: string) {
  return apiFetch<Participant[]>(`/admin/events/${eventId}/participants`);
}

export function adminCheckinParticipant(eventId: string, userId: string) {
  return apiFetch<{ message: string; checkin_status: string; tokens_granted: number }>(
    `/admin/events/${eventId}/participants/${userId}/checkin`,
    { method: "POST" },
  );
}

export function setEventPublished(eventId: string, published: boolean) {
  return apiFetch<EventItem>(`/admin/events/${eventId}/${published ? "publish" : "unpublish"}`, {
    method: "POST",
  });
}

export function getAdminRequests() {
  return apiFetch<AdminRequest[]>("/admin/mentorship-requests");
}

export function overrideRequestStatus(requestId: string, status: string) {
  return apiFetch<{ status: string; message: string }>(`/admin/mentorship-requests/${requestId}/status`, {
    method: "POST",
    body: JSON.stringify({ status }),
  });
}

export interface AppNotification {
  id: string;
  kind: string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

export function getNotifications() {
  return apiFetch<{ items: AppNotification[]; unread: number }>("/notifications");
}

export function markNotificationRead(id: string) {
  return apiFetch<void>(`/notifications/${id}/read`, { method: "POST" });
}

export function markAllNotificationsRead() {
  return apiFetch<void>("/notifications/read-all", { method: "POST" });
}

// Bug Reporting API
export interface BugReportItem {
  id: string;
  reporter_id: string;
  reporter_name?: string;
  reporter_email?: string;
  reporter_role?: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export function submitBugReport(title: string, description: string) {
  return apiFetch<{ message: string }>("/me/bug-reports", {
    method: "POST",
    body: JSON.stringify({ title, description }),
  });
}

export function getAdminBugReports() {
  return apiFetch<BugReportItem[]>("/admin/bug-reports");
}

export function updateAdminBugReport(id: string, status: string, adminNotes?: string) {
  return apiFetch<{ message: string }>(`/admin/bug-reports/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status, admin_notes: adminNotes }),
  });
}

export function changeUserRole(profileId: string, role: "student" | "mentor", reason?: string) {
  return apiFetch<unknown>(`/admin/users/${profileId}/role`, {
    method: "POST",
    body: JSON.stringify({ role, reason }),
  });
}

export function switchToStudent() {
  return apiFetch<{ message: string }>("/me/switch-to-student", {
    method: "POST",
  });
}


