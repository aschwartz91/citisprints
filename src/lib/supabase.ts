import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True when Supabase env vars are present. When false, the app falls back
 *  to a seeds-only board so it never crashes in a misconfigured environment. */
export const isSupabaseConfigured = Boolean(url && anonKey);

/** A single browser client. The anon key is public by design (RLS guards the
 *  table), so it's safe to ship to the client. */
export const supabase = isSupabaseConfigured
  ? createClient(url!, anonKey!)
  : null;

/** Shape of a row in the `rides` table. */
export type RideRow = {
  id: string;
  handle: string;
  distance_mi: number;
  duration_sec: number;
  created_at: string;
};
