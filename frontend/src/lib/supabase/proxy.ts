import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedPrefixes = [
  "/dashboard",
  "/mentors",
  "/lessons",
  "/schedule",
  "/subscription",
  "/profile",
  "/meeting",
  "/community",
  "/chat",
  "/settings",
  "/payment",
  "/referrals",
  "/mentor/home",
  "/mentor/bookings",
  "/mentor/profile",
  "/mentor/lessons",
  "/mentor/dashboard",
];

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.next({ request });

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
  const signedIn = Boolean(data?.claims?.sub);
  const path = request.nextUrl.pathname;
  if (!signedIn && protectedPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", path);
    return NextResponse.redirect(login);
  }
  if (signedIn && path === "/login") return NextResponse.redirect(new URL("/dashboard/home", request.url));
  return response;
}
