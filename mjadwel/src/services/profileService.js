import { supabase } from '../lib/supabaseClient';

export const createProfile = (userId, fullName) =>
  supabase.from('profiles').insert([{
    id: userId,
    full_name: fullName,
    username: fullName.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000),
  }]);
