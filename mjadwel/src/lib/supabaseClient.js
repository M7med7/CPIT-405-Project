import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Chainable no-op query builder that always resolves to empty data.
// Covers .select().order(), .select().eq(), .insert(), etc.
const emptyQuery = () => {
  const q = { data: [], error: null };
  const chain = new Proxy(Promise.resolve(q), {
    get(target, prop) {
      if (prop === 'then' || prop === 'catch' || prop === 'finally') return target[prop].bind(target);
      return () => chain;
    },
  });
  return chain;
};

const mockClient = {
  from: () => ({ select: emptyQuery, insert: emptyQuery, update: emptyQuery, delete: emptyQuery, upsert: emptyQuery }),
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: (_event, _cb) => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => Promise.resolve({ data: {}, error: { message: 'Supabase not configured' } }),
    signUp: () => Promise.resolve({ data: {}, error: { message: 'Supabase not configured' } }),
    signOut: () => Promise.resolve({ error: null }),
  },
};

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : mockClient;
