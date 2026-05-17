export const fetchWeatherForDate = async (targetDate) => {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  if (!apiKey || apiKey === 'YOUR_OPENWEATHER_KEY_HERE') {
    return { data: null, note: 'أضف VITE_OPENWEATHER_API_KEY في ملف .env' };
  }

  const targetDay = targetDate.split('T')[0];
  const today     = new Date().toISOString().split('T')[0];
  const daysAhead = Math.round((new Date(targetDay) - new Date(today)) / 86400000);

  if (daysAhead < 0) return { data: null, note: 'التاريخ في الماضي' };

  if (daysAhead <= 5) {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=Jeddah,SA&units=metric&lang=ar&appid=${apiKey}`
    );
    if (!res.ok) throw new Error(res.statusText);
    const json = await res.json();

    const slots = json.list.filter(item => item.dt_txt.startsWith(targetDay));
    if (slots.length === 0) return { data: null, note: 'لا توجد بيانات للتاريخ المحدد' };

    const noon = slots.find(s => s.dt_txt.includes('12:00:00')) ?? slots[0];
    return { data: noon, note: daysAhead === 0 ? 'الطقس الحالي' : '' };
  }

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=Jeddah,SA&units=metric&lang=ar&appid=${apiKey}`
  );
  if (!res.ok) throw new Error(res.statusText);
  const json = await res.json();
  return {
    data: { main: json.main, weather: json.weather, wind: json.wind },
    note: 'الطقس الحالي (التاريخ أبعد من 5 أيام)',
  };
};
