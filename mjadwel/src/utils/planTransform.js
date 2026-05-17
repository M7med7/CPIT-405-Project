import { Globe } from 'lucide-react';
import { CAT_LABEL, CAT_ICON } from './categoryUtils';

export const transformCommunityPlan = (plan, idx) => {
  const cats = [...new Set(
    (plan.plan_stops ?? []).map(s => s.places?.category).filter(Boolean)
  )];
  return {
    id: plan.id,
    title: plan.title,
    tags: cats.slice(0, 2).map(c => CAT_LABEL[c] ?? c).length
      ? cats.slice(0, 2).map(c => CAT_LABEL[c] ?? c)
      : ['عام'],
    description: plan.description ?? '',
    days: 1,
    stops: plan.plan_stops?.length ?? 0,
    creator: plan.profiles?.username ?? 'مجهول',
    initials: (plan.profiles?.username ?? 'م').slice(0, 2),
    featured: idx === 1,
    stopIcons: cats.slice(0, 3).map(c => CAT_ICON[c] ?? Globe),
    extra: Math.max(0, (plan.plan_stops?.length ?? 0) - 3),
  };
};
