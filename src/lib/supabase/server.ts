/**
 * Supabase Server Client
 *
 * For use inside Next.js Route Handlers and Server Components.
 * Creates a fresh client per request (no singleton) to avoid
 * leaking auth state between requests.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

/**
 * Create a server-side Supabase client.
 * Optionally pass an Authorization header to forward the user's session.
 */
export function createServerSupabaseClient(accessToken?: string) {
  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  });
}
