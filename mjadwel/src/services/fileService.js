import { supabase } from '../lib/supabaseClient';

export const uploadPlaceImage = async (file) => {
  const ext      = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from('place-images')
    .upload(fileName, file, { cacheControl: '3600', upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from('place-images').getPublicUrl(fileName);
  return data.publicUrl;
};
