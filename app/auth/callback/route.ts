import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  console.log("[auth/callback] === Auth Callback Started ===");
  console.log("[auth/callback] Code:", code ? "present" : "MISSING");

  if (!code) {
    console.error("[auth/callback] ❌ No code in URL");
    return NextResponse.redirect(`${origin}/login?error=auth&reason=no_code`);
  }

  const cookieStore = await cookies();

  // Debug: Log cookies
  const allCookies = cookieStore.getAll();
  console.log("[auth/callback] Available cookies:", allCookies.map(c => c.name).join(", "));

  // Create response for setting cookies
  const response = NextResponse.redirect(new URL(next, origin));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Set on BOTH the response (for browser) and cookieStore
            response.cookies.set(name, value, options as Partial<ResponseCookie>);
            cookieStore.set(name, value, options as Partial<ResponseCookie>);
          });
        },
      },
    }
  );

  try {
    console.log("[auth/callback] Exchanging code for session...");
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[auth/callback] ❌ Failed:", error.message);
      return NextResponse.redirect(
        `${origin}/login?error=auth&reason=${encodeURIComponent(error.message)}`
      );
    }

    console.log("[auth/callback] ✅ Session created for:", data.user?.email);
    return response;
  } catch (err) {
    console.error("[auth/callback] ❌ Error:", err);
    return NextResponse.redirect(
      `${origin}/login?error=auth&reason=${encodeURIComponent(String(err))}`
    );
  }
}
