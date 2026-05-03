import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Loader2 } from 'lucide-react';

const WeatherWidget = ({ targetDate }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
        
        if (!apiKey) {
          throw new Error('Weather API key is missing');
        }

        // Fetch 5-day forecast for Jeddah
        const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=Jeddah,SA&units=metric&appid=${apiKey}`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch weather data');
        }

        const data = await res.json();
        
        // Try to find a forecast for the target date
        const targetObj = new Date(targetDate);
        const targetDateString = targetObj.toISOString().split('T')[0];
        
        // Find the forecast closest to noon on the target date
        const dayForecasts = data.list.filter(item => item.dt_txt.startsWith(targetDateString));
        
        if (dayForecasts.length > 0) {
          // Get the forecast closest to 12:00:00 (midday)
          const noonForecast = dayForecasts.find(item => item.dt_txt.includes('12:00:00')) || dayForecasts[0];
          setWeather(noonForecast);
        } else {
          // If date is not within 5 days or past, fallback to current weather
          const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Jeddah,SA&units=metric&appid=${apiKey}`);
          const currentData = await currentRes.json();
          setWeather(currentData);
          setError("Showing current weather (date out of forecast range)");
        }
        
      } catch (err) {
        console.error(err);
        setError("Weather unavailable");
      } finally {
        setLoading(false);
      }
    };

    if (targetDate) {
      fetchWeather();
    }
  }, [targetDate]);

  if (loading) {
    return (
      <div className="bg-blue-50/50 rounded-2xl p-4 flex items-center justify-center border border-blue-100 min-h-[80px]">
        <Loader2 className="animate-spin text-blue-500" size={24} />
      </div>
    );
  }

  if (!weather && error) {
    return (
      <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-center border border-gray-100 text-sm text-gray-500">
        {error}
      </div>
    );
  }

  // Determine icon based on weather condition code
  const getWeatherIcon = (id) => {
    if (id >= 200 && id < 600) return <CloudRain className="text-blue-500" size={32} />; // Rain/Drizzle/Thunderstorm
    if (id >= 801 && id <= 804) return <Cloud className="text-gray-400" size={32} />; // Clouds
    return <Sun className="text-amber-500" size={32} />; // Clear or others (Jeddah mostly clear)
  };

  const temp = Math.round(weather.main?.temp || 0);
  const description = weather.weather?.[0]?.description || '';
  const iconId = weather.weather?.[0]?.id;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100 shadow-sm flex items-center justify-between">
      <div>
        <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          Jeddah Weather
        </div>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-black text-brand-dark" dir="ltr">{temp}°C</span>
          <span className="text-sm text-gray-600 mb-1 capitalize">{description}</span>
        </div>
        {error && <div className="text-xs text-amber-600 mt-1">{error}</div>}
      </div>
      <div className="bg-white p-3 rounded-full shadow-sm">
        {getWeatherIcon(iconId)}
      </div>
    </div>
  );
};

export default WeatherWidget;
