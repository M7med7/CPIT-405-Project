import { supabase } from '../lib/supabaseClient';

export const fetchRecentPlaces = (limit = 3) =>
  supabase
    .from('places')
    .select('id, name, location_area, category, image_url, duration_mins')
    .order('created_at', { ascending: false })
    .limit(limit);

export const submitPlace = (formData, userId) =>
  supabase
    .from('places')
    .insert([{
      ...formData,
      duration_mins: parseInt(formData.duration_mins, 10),
      created_by: userId,
    }]);
