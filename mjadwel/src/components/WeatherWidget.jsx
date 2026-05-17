import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, Loader2 } from 'lucide-react';
import { useWeather } from '../hooks/useWeather';

const getIcon = (id, size = 32) => {
  if (!id) return <Sun size={size} className="text-amber-400" />;
  if (id >= 200 && id < 300) return <CloudLightning size={size} className="text-purple-400" />;
  if (id >= 300 && id < 600) return <CloudRain size={size} className="text-blue-400" />;
  if (id >= 600 && id < 700) return <CloudSnow size={size} className="text-sky-300" />;
  if (id >= 801) return <Cloud size={size} className="text-gray-400" />;
  return <Sun size={size} className="text-amber-400" />;
};

const WeatherWidget = ({ targetDate }) => {
  const { weather, loading, note } = useWeather(targetDate);

  if (!targetDate) return null;

  if (loading) {
    return (
      <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-100 flex items-center justify-center min-h-[80px]">
        <Loader2 className="animate-spin text-blue-400" size={22} />
      </div>
    );
  }

  if (!weather) {
    return note ? (
      <div className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100 text-xs text-gray-400 text-center">
        {note}
      </div>
    ) : null;
  }

  const temp     = Math.round(weather.main?.temp ?? 0);
  const feels    = Math.round(weather.main?.feels_like ?? 0);
  const humidity = weather.main?.humidity;
  const wind     = Math.round((weather.wind?.speed ?? 0) * 3.6);
  const desc     = weather.weather?.[0]?.description ?? '';
  const iconId   = weather.weather?.[0]?.id;

  return (
    <>
      <div className="sm:hidden flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-3 py-1.5 w-fit">
        {getIcon(iconId, 14)}
        <span className="text-sm font-black text-brand-dark tabular-nums" dir="ltr">{temp}°C</span>
        {note && <span className="text-[10px] text-amber-500">{note}</span>}
      </div>

      <div className="hidden sm:block bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl p-4 border border-blue-100 shadow-sm min-w-[200px]">
        <p className="text-[10px] font-bold tracking-widest text-blue-400 uppercase mb-2">
          WEATHER · جدة
        </p>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-black text-brand-dark" dir="ltr">{temp}°</span>
              <span className="text-sm text-gray-400 mb-1">C</span>
            </div>
            <p className="text-xs text-gray-500 capitalize">{desc}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">يبدو {feels}°</p>
          </div>
          <div className="bg-white p-2.5 rounded-full shadow-sm shrink-0">
            {getIcon(iconId, 28)}
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-blue-100/70">
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <Droplets size={12} className="text-blue-300" />
            <span>{humidity}%</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <Wind size={12} className="text-gray-300" />
            <span dir="ltr">{wind} km/h</span>
          </div>
          {note && <span className="text-[10px] text-amber-500 ms-auto">{note}</span>}
        </div>
      </div>
    </>
  );
};

export default WeatherWidget;
