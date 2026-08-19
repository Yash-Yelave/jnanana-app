import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseEnv } from "@/lib/env";

const studentPrefixes = [
  "/dashboard",
  "/mentors",
  "/lessons",
  "/schedule",
  "/profile",
];
const mentorPrefixes = [
  "/mentor/home",
  "/mentor/bookings",
  "/mentor/profile",
  "/mentor/lessons",
  "/mentor/dashboard",
];
const sharedPrefixes = ["/meeting", "/community", "/chat", "/settings", "/subscription", "/payment", "/referrals"];

function matches(path: string, prefixes: string[]) {
  return prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export async function updateSession(request: NextRequest) {
  const { url, key } = supabaseEnv();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const signedIn = Boolean(claims?.sub);
  const path = request.nextUrl.pathname;
  const isAdmin = claims?.app_metadata && typeof claims.app_metadata === "object" && "role" in claims.app_metadata && claims.app_metadata.role === "admin";
  const protectedRoute = matches(path, [...studentPrefixes, ...mentorPrefixes, ...sharedPrefixes]) || path.startsWith("/admin");
  if (!signedIn && protectedRoute) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", path);
    return NextResponse.redirect(login);
  }
  if (!signedIn) return response;

  const { data: profile } = await supabase.from("profiles").select("role,onboarding_status").eq("id", claims!.sub).maybeSingle();
  const role = profile?.role as "student" | "mentor" | undefined;
  const status = profile?.onboarding_status as string | undefined;
  if (path.startsWith("/admin") && !isAdmin) return NextResponse.redirect(new URL("/dashboard", request.url));
  const pendingAllowed = path === "/waiting" || path === "/profile/edit" || path === "/mentor/profile" || path === "/settings" || path.startsWith("/auth/");
  if (status === "pending" && !pendingAllowed) return NextResponse.redirect(new URL("/waiting", request.url));
  if (matches(path, studentPrefixes) && role === "mentor" && path !== "/profile/edit") return NextResponse.redirect(new URL("/mentor/home", request.url));
  if (matches(path, mentorPrefixes) && role !== "mentor") return NextResponse.redirect(new URL("/dashboard", request.url));
  if (path === "/login") {
    if (request.nextUrl.searchParams.has("force") || request.nextUrl.searchParams.has("logout")) {
      return response;
    }
    const destination = isAdmin ? "/admin" : status === "pending" ? "/waiting" : role === "mentor" ? "/mentor/home" : "/dashboard";
    return NextResponse.redirect(new URL(destination, request.url));
  }
  return response;
}
