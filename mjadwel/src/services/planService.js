import { supabase } from '../lib/supabaseClient';
import { timeToMins, minsToTime, pad } from '../utils/plannerUtils';

export const fetchPublicPlans = (limit = 3) =>
  supabase
    .from('plans')
    .select('id, title, description, profiles(username), plan_stops(places(category))')
    .eq('is_public', true)
    .limit(limit);

export const fetchPublicPlanCount = () =>
  supabase
    .from('plans')
    .select('id', { count: 'exact', head: true })
    .eq('is_public', true);

export const fetchAllPublicPlans = () =>
  supabase
    .from('plans')
    .select('id, title, description, date, start_time, created_at, profiles(username), plan_stops(places(category, location_area))')
    .eq('is_public', true)
    .order('created_at', { ascending: false });

export const fetchExplorerPlans = (limit = 6) =>
  supabase
    .from('plans')
    .select('id, title, profiles(username), plan_stops(places(category))')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limit);

export const fetchUserPlans = (userId) =>
  supabase
    .from('plans')
    .select('id, title, description, date, is_public, start_time, plan_stops(count)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

export const fetchUserPlanCount = (userId) =>
  supabase
    .from('plans')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

export const fetchPlanById = (planId) =>
  supabase
    .from('plans')
    .select('*, profiles(username)')
    .eq('id', planId)
    .single();

export const fetchPlanStops = (planId) =>
  supabase
    .from('plan_stops')
    .select('id, place_id, arrival_time, duration_mins, notes, order_index, places(name, location_area, category, image_url, maps_url)')
    .eq('plan_id', planId)
    .order('order_index', { ascending: true });

export const fetchPlanStopsForCopy = (planId) =>
  supabase
    .from('plan_stops')
    .select('place_id, duration_mins, notes, order_index, places(name, location_area, category)')
    .eq('plan_id', planId)
    .order('order_index', { ascending: true });

export const updatePlanVisibility = (planId, isPublic) =>
  supabase.from('plans').update({ is_public: isPublic }).eq('id', planId);

export const copyPlan = async (originalPlan, stops, userId) => {
  const { data: newPlan, error: pErr } = await supabase
    .from('plans')
    .insert([{
      user_id: userId,
      title: `${originalPlan.title} (نسخة)`,
      description: originalPlan.description ?? '',
      date: originalPlan.date,
      start_time: originalPlan.start_time,
      is_public: false,
    }])
    .select()
    .single();
  if (pErr) throw pErr;

  if (stops.length > 0) {
    const { error: sErr } = await supabase.from('plan_stops').insert(
      stops.map((s, i) => ({
        plan_id: newPlan.id, place_id: s.place_id,
        arrival_time: s.arrival_time, notes: s.notes ?? '',
        order_index: i, duration_mins: s.duration_mins,
      }))
    );
    if (sErr) throw sErr;
  }

  return newPlan;
};

export const savePlanWithStops = async ({ userId, title, description, date, startTime, isPublic, days }) => {
  const { data: plan, error: pErr } = await supabase
    .from('plans')
    .insert([{ user_id: userId, title, description, date: date || null, start_time: startTime || null, is_public: isPublic }])
    .select()
    .single();
  if (pErr) throw pErr;

  const stopsToInsert = [];
  let orderIndex = 0;
  for (const day of days) {
    let total = timeToMins(startTime);
    for (const stop of day.stops) {
      stopsToInsert.push({
        plan_id: plan.id, place_id: stop.place_id,
        arrival_time: minsToTime(total),
        notes: stop.notes, order_index: orderIndex++, duration_mins: stop.duration_mins,
      });
      total += stop.duration_mins + 15;
    }
  }

  if (stopsToInsert.length > 0) {
    const { error: sErr } = await supabase.from('plan_stops').insert(stopsToInsert);
    if (sErr) throw sErr;
  }

  return plan;
};
