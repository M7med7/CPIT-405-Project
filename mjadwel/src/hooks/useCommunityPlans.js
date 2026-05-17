import { useState, useEffect } from 'react';
import { Coffee, Waves, Landmark, Utensils } from 'lucide-react';
import { fetchPublicPlans } from '../services/planService';
import { transformCommunityPlan } from '../utils/planTransform';

const FALLBACK_PLANS = [
  {
    id: 3, title: 'يوم هادئ في البلد',
    tags: ['تاريخية', 'مقاهي'], description: '"الصبح الباكر في البلد قبل الزحام — ولا تفوّت فطاير أبو زيد."',
    days: 1, stops: 5, creator: 'ليلى الشمري', initials: 'لـ',
    featured: false, stopIcons: [Landmark, Coffee], extra: 2,
  },
  {
    id: 2, title: 'نهاية أسبوع على البحر',
    tags: ['شواطئ', 'مطاعم'], description: '"ابدأ في أبحر للسباحة، واختم اليوم عند نافورة الملك فهد."',
    days: 2, stops: 8, creator: 'فهد العمودي', initials: 'فـ',
    featured: true, stopIcons: [Waves, Utensils, Waves], extra: 5,
  },
  {
    id: 1, title: 'ثقافة وذواقة',
    tags: ['تاريخية', 'متاحف'], description: '"ثلاث أيام كاملة لاكتشاف عمق جدة — ثقافة، طعام، وناس."',
    days: 3, stops: 11, creator: 'مى يانيد', initials: 'مى',
    featured: false, stopIcons: [Landmark, Landmark, Landmark], extra: 8,
  },
];

export const useCommunityPlans = (limit = 3) => {
  const [plans, setPlans] = useState(FALLBACK_PLANS);

  useEffect(() => {
    fetchPublicPlans(limit).then(({ data }) => {
      if (data && data.length > 0) setPlans(data.map(transformCommunityPlan));
    });
  }, [limit]);

  return plans;
};
