import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "mock-anon-key",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh user session if needed
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Basic route protection
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');
  if (isProtectedRoute && !user) {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      // Only redirect if we have real keys, otherwise let mock UI render
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
