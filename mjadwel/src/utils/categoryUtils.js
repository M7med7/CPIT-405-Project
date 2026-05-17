import { Coffee, Waves, Landmark, Utensils, Globe } from 'lucide-react';

export const CATEGORIES = {
  category_cafe:          { Icon: Coffee,   bg: '#ede3d6', fg: '#9b6a46', label: 'مقاهي'   },
  category_sea:           { Icon: Waves,    bg: '#ccdde6', fg: '#4a8ba0', label: 'شواطئ'   },
  category_culture:       { Icon: Landmark, bg: '#e4c8b8', fg: '#a0604a', label: 'تاريخية' },
  category_restaurant:    { Icon: Utensils, bg: '#cdd8b8', fg: '#6a8a4a', label: 'مطاعم'   },
  category_entertainment: { Icon: Globe,    bg: '#d0d0e0', fg: '#5a5a8a', label: 'ترفيه'   },
};

export const catOf = (cat) =>
  CATEGORIES[cat] ?? { Icon: Globe, bg: '#e6dfd7', fg: '#9b6a46', label: '' };

export const CAT_LABEL = Object.fromEntries(Object.entries(CATEGORIES).map(([k, v]) => [k, v.label]));
export const CAT_ICON  = Object.fromEntries(Object.entries(CATEGORIES).map(([k, v]) => [k, v.Icon]));
export const CAT_BG    = Object.fromEntries(Object.entries(CATEGORIES).map(([k, v]) => [k, v.bg]));
export const CAT_FG    = Object.fromEntries(Object.entries(CATEGORIES).map(([k, v]) => [k, v.fg]));
