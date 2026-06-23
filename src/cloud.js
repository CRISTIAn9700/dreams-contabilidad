import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const cloudReady = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = cloudReady
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export async function getCloudSession() {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function signInCloud(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signUpCloud({ name, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });
  if (error) throw error;
  return data;
}

export async function signOutCloud() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function loadCloudState(userId) {
  if (!supabase || !userId) return null;
  const { data, error } = await supabase
    .from('app_states')
    .select('payload')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data?.payload || null;
}

export async function saveCloudState(userId, payload) {
  if (!supabase || !userId) return;
  const { error } = await supabase
    .from('app_states')
    .upsert({
      user_id: userId,
      payload,
      updated_at: new Date().toISOString(),
    });
  if (error) throw error;
}
