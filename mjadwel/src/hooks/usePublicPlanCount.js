import { useState, useEffect } from 'react';
import { fetchPublicPlanCount } from '../services/planService';

export const usePublicPlanCount = () => {
  const [count, setCount] = useState(null);

  useEffect(() => {
    fetchPublicPlanCount().then(({ count }) => {
      if (count != null) setCount(count);
    });
  }, []);

  return count;
};
