import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Lumen runs in local "demo mode" by default (data in the browser via
 * localStorage). When NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
 * are present, this client provides the real PostgreSQL backend with
 * row-level security (see supabase/migrations/0001_init.sql).
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, { auth: { persistSession: true } })
  : null;

export async function getSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error("Supabase is not configured. Run in demo mode or add env vars.");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(email: string, password: string, name: string) {
  if (!supabase) throw new Error("Supabase is not configured. Run in demo mode or add env vars.");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}