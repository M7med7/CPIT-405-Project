import { useState, useEffect } from 'react';
import { fetchUserPlanCount } from '../services/planService';

export const useUserPlanCount = (userId) => {
  const [count, setCount] = useState(null);

  useEffect(() => {
    if (!userId) { setCount(null); return; }
    fetchUserPlanCount(userId).then(({ count }) => setCount(count ?? 0));
  }, [userId]);

  return count;
};
