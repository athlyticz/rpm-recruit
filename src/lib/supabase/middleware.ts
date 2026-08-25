import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const APP_ROUTES = [
  "/dashboard",
  "/profile",
  "/athletic",
  "/academics",
  "/scores",
  "/college-match",
  "/letter-builder",
  "/bio-generator",
  "/cost-tracker",
  "/checklist",
  "/pitch-log",
  "/settings",
];

function isAppRoute(pathname: string) {
  return APP_ROUTES.some((route) => pathname.startsWith(route));
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Fail closed in production, but only for authenticated routes. A missing
    // or misnamed env var must never silently open the app; public marketing
    // pages do not need Supabase and keep serving.
    if (
      process.env.NODE_ENV === "production" &&
      isAppRoute(request.nextUrl.pathname)
    ) {
      throw new Error(
        "Supabase is not configured. NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required to serve authenticated routes."
      );
    }
    // Local development, or a public route: allow through.
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect unauthenticated users away from app routes
  if (!user && isAppRoute(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
