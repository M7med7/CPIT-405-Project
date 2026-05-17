import { useState, useEffect } from 'react';
import { fetchRecentPlaces } from '../services/placeService';

const FALLBACK = [
  { id: 'f1', name: 'كافية Mooma',    location_area: 'الزهراء', category: 'category_cafe',    image_url: null, duration_mins: 60  },
  { id: 'f2', name: 'نادي البخوت',    location_area: 'الشاطئ',  category: 'category_sea',     image_url: null, duration_mins: 120 },
  { id: 'f3', name: 'البلد التاريخي', location_area: 'البلد',   category: 'category_culture', image_url: null, duration_mins: 90  },
];

export const useRecentPlaces = (limit = 3) => {
  const [places, setPlaces] = useState(FALLBACK);

  useEffect(() => {
    fetchRecentPlaces(limit).then(({ data }) => {
      if (data && data.length > 0) setPlaces(data);
    });
  }, [limit]);

  return places;
};
