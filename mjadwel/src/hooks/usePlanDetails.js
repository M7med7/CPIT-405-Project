import { useState, useEffect } from 'react';
import { fetchPlanById, fetchPlanStops } from '../services/planService';

export const usePlanDetails = (planId) => {
  const [plan,    setPlan]    = useState(null);
  const [stops,   setStops]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!planId) return;
    const load = async () => {
      try {
        setLoading(true);
        const { data: planData, error: pErr } = await fetchPlanById(planId);
        if (pErr) throw pErr;
        setPlan(planData);

        const { data: stopsData, error: sErr } = await fetchPlanStops(planId);
        if (sErr) throw sErr;
        setStops(stopsData || []);
      } catch {
        setError('تعذر تحميل الجدول. قد يكون خاصًا أو محذوفًا.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [planId]);

  return { plan, stops, loading, error };
};
