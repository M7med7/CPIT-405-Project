import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { fetchUserPlans, updatePlanVisibility } from '../services/planService';

export const useMyPlans = (userId) => {
  const [plans,      setPlans]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    fetchUserPlans(userId).then(({ data, error }) => {
      if (!error) setPlans(data || []);
      setLoading(false);
    });
  }, [userId]);

  const togglePublic = async (plan) => {
    setTogglingId(plan.id);
    const next = !plan.is_public;
    const { error } = await updatePlanVisibility(plan.id, next);
    if (error) {
      toast.error('تعذر تحديث حالة النشر');
    } else {
      setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, is_public: next } : p));
      toast.success(next ? 'تم نشر الجدول للمجتمع 🌐' : 'تم إخفاء الجدول 🔒');
    }
    setTogglingId(null);
  };

  return { plans, loading, togglingId, togglePublic };
};
