import { useState, useEffect } from 'react';
import { fetchAllPublicPlans } from '../services/planService';

export const usePublicPlans = () => {
  const [plans,   setPlans]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllPublicPlans().then(({ data }) => {
      setPlans(data || []);
      setLoading(false);
    });
  }, []);

  return { plans, loading };
};
