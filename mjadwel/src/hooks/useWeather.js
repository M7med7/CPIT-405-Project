import { useState, useEffect } from 'react';
import { fetchWeatherForDate } from '../services/weatherService';

export const useWeather = (targetDate) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [note,    setNote]    = useState('');

  useEffect(() => {
    if (!targetDate) return;
    setLoading(true);
    setWeather(null);
    setNote('');

    fetchWeatherForDate(targetDate)
      .then(({ data, note }) => {
        setWeather(data);
        setNote(note ?? '');
      })
      .catch(() => setNote('تعذر تحميل الطقس'))
      .finally(() => setLoading(false));
  }, [targetDate]);

  return { weather, loading, note };
};
