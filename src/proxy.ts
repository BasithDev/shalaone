import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
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

  let user = null;
  let retryCount = 0;
  while (retryCount < 3) {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data) {
        user = data.user;
      }
      break;
    } catch (e) {
      retryCount++;
      if (retryCount >= 3) {
        console.error("Supabase getUser failed after 3 retries due to network/SSL error:", e);
      } else {
        await new Promise((res) => setTimeout(res, 150));
      }
    }
  }

  // API routes enforce their own auth (returning 401/403 JSON). The page-level
  // role redirects below must never apply to them, otherwise an authenticated
  // request like POST /api/admin/books/upload gets 307-redirected to a page and
  // the client's res.json() fails. Just refresh the session and let it through.
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");

  const isPublicRoute =
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup") ||
    request.nextUrl.pathname.startsWith("/api/auth") ||
    request.nextUrl.pathname.startsWith("/auth");

  if (!user && !isPublicRoute && !isApiRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && !isApiRoute) {
    // Fetch profile using Supabase client directly since Drizzle uses postgres which might not work on edge
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, board_id")
      .eq("id", user.id)
      .single();

    if (profile) {
      const { role, board_id } = profile;
      const path = request.nextUrl.pathname;

      if (role === "admin") {
        if (!path.startsWith("/admin")) {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
      } else if (role === "student") {
        if (path.startsWith("/admin")) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }

        if (!board_id && !path.startsWith("/onboarding") && !path.startsWith("/settings")) {
          return NextResponse.redirect(new URL("/onboarding", request.url));
        }

        if (board_id && path.startsWith("/onboarding")) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        
        // If student visits public auth routes, send to dashboard or onboarding
        if (path === "/login" || path === "/signup") {
           return NextResponse.redirect(new URL(board_id ? "/dashboard" : "/onboarding", request.url));
        }
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
