import { useState, useEffect } from 'react';
import { fetchExplorerPlans } from '../services/planService';

export const useExplorerPlans = (limit = 6) => {
  const [plans,   setPlans]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExplorerPlans(limit).then(({ data }) => {
      if (data) setPlans(data);
      setLoading(false);
    });
  }, [limit]);

  return { plans, loading };
};
