import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { setGlobalDispatcher, Agent } from "undici";

// Configure undici dispatcher to force HTTP/1.1 on server-side requests
// to prevent decryption / bad record mac SSL errors with Cloudflare.
if (typeof window === "undefined") {
  try {
    setGlobalDispatcher(new Agent({ allowH2: false }));
  } catch (err) {
    console.error("Failed to set global dispatcher:", err);
  }
}

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have proxy refreshing user sessions.
          }
        },
      },
    }
  );
}
