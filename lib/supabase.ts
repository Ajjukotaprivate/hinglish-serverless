import { createBrowserClient } from "@supabase/ssr";

/**
 * Use createBrowserClient (not createClient) so OAuth PKCE code_verifier
 * is stored in cookies - required for server-side auth callback to work.
 */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
