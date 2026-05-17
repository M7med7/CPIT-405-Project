import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { usePlanDetails } from '../../hooks/usePlanDetails';
import { copyPlan } from '../../services/planService';
import { catOf } from '../../utils/categoryUtils';
import { detectDayBreaks, computeTotalMinutes } from '../../utils/planCalculations';
import { getDayLabel } from '../../utils/plannerUtils';
import {
  Calendar, Clock, ArrowRight, MapPin, Copy, Share2, Loader2,
} from 'lucide-react';
import WeatherWidget from '../../components/WeatherWidget';

const StopCard = ({ stop, index, align = 'end' }) => {
  const { Icon, bg, fg, label } = catOf(stop.places?.category);
  const mapsUrl = stop.places?.maps_url ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      (stop.places?.name ?? '') + ' ' + (stop.places?.location_area ?? '') + ' جدة'
    )}`;

  return (
    <div className="bg-white rounded-2xl border border-brand-secondary/40 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {stop.places?.image_url && (
        <img src={stop.places.image_url} alt={stop.places?.name}
          className="w-full h-32 object-cover" />
      )}
      <div className={`p-4 flex flex-col gap-2 ${align === 'start' ? 'items-start text-start' : 'items-end text-end'}`}>
        <div className={`flex items-center gap-2 w-full ${align === 'start' ? 'flex-row' : 'flex-row-reverse'}`}>
          <span className="text-2xl font-black text-brand-dark tabular-nums" dir="ltr">
            {stop.arrival_time?.slice(0, 5) ?? '—'}
          </span>
          <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {stop.duration_mins} د
          </span>
        </div>

        <h3 className="font-black text-brand-dark text-base leading-snug">{stop.places?.name}</h3>

        <div className={`flex items-center gap-1.5 ${align === 'start' ? '' : 'flex-row-reverse'}`}>
          <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
            <Icon size={10} style={{ color: fg }} />
          </div>
          {label && <span className="text-[10px] text-gray-400">{label}</span>}
          <span className="text-xs text-gray-400">· {stop.places?.location_area}</span>
        </div>

        {stop.notes && (
          <div className="w-full bg-brand-secondary/20 rounded-xl px-3 py-2 text-xs text-gray-600">
            {stop.notes}
          </div>
        )}

        <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
          className={`flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 font-medium ${align === 'start' ? '' : 'flex-row-reverse'}`}>
          <MapPin size={11} />
          عرض على الخريطة
        </a>
      </div>
    </div>
  );
};

const PlanDetails = () => {
  const { id }   = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { plan, stops, loading, error } = usePlanDetails(id);
  const [copying, setCopying] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/plans/${id}`;
    try { await navigator.clipboard.writeText(url); } catch {}
    try { if (navigator.share) await navigator.share({ title: plan?.title, url }); } catch {}
    toast.success('تم نسخ الرابط ✓');
  };

  const handleCopyPlan = async () => {
    if (!user) { navigate('/login'); return; }
    setCopying(true);
    try {
      await copyPlan(plan, stops, user.id);
      toast.success('تم نسخ الجدول إلى جداولك ✓');
      navigate('/my-plans');
    } catch (e) {
      toast.error(e.message ?? 'حدث خطأ. حاول مجددًا.');
      setCopying(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Loader2 className="animate-spin text-brand-primary" size={40} />
    </div>
  );

  if (error || !plan) return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <p className="text-4xl mb-4">😕</p>
      <h2 className="text-xl font-bold text-brand-dark mb-2">تعذر تحميل الجدول</h2>
      <p className="text-gray-400 text-sm mb-8">{error}</p>
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 mx-auto text-brand-primary font-semibold hover:underline">
        <ArrowRight size={16} /> العودة
      </button>
    </div>
  );

  const isOwner     = user?.id === plan.user_id;
  const totalMins   = computeTotalMinutes(stops);
  const stopDays    = detectDayBreaks(stops);
  const hasMultiDay = (stopDays[stopDays.length - 1] ?? 1) > 1;
  const dateLabel   = plan.date
    ? new Date(plan.date).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <div className="min-h-screen bg-brand-light pb-24 lg:pb-12">

      <div className="bg-white border-b border-brand-secondary/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-5 pb-6">

          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-dark mb-5 transition-colors">
            <ArrowRight size={16} /> رجوع
          </button>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-brand-dark leading-snug mb-1">
                {plan.title}
              </h1>
              {plan.description && (
                <p className="text-sm text-gray-500 mt-1 mb-4 max-w-xl">{plan.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {dateLabel && (
                  <span className="flex items-center gap-1.5 bg-brand-secondary/50 text-brand-dark px-3 py-1.5 rounded-full font-medium">
                    <Calendar size={11} className="text-brand-primary" />
                    {dateLabel}
                  </span>
                )}
                {plan.start_time && (
                  <span className="flex items-center gap-1.5 bg-brand-secondary/50 text-brand-dark px-3 py-1.5 rounded-full font-medium" dir="ltr">
                    <Clock size={11} className="text-brand-primary" />
                    {plan.start_time.slice(0, 5)}
                  </span>
                )}
                {totalMins > 0 && (
                  <span className="flex items-center gap-1.5 bg-brand-secondary/50 text-brand-dark px-3 py-1.5 rounded-full font-medium">
                    <Clock size={11} className="text-gray-400" />
                    {totalMins} دقيقة
                  </span>
                )}
                <span className="flex items-center gap-1.5 bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full">
                  @{plan.profiles?.username || 'مجهول'}
                </span>
              </div>
            </div>

            {plan.date && (
              <div className="shrink-0 hidden sm:block">
                <WeatherWidget targetDate={plan.date} />
              </div>
            )}
          </div>

          {plan.date && (
            <div className="sm:hidden mt-3">
              <WeatherWidget targetDate={plan.date} />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {stops.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm bg-white rounded-2xl border border-brand-secondary/40">
            لا توجد محطات في هذا الجدول
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 lg:hidden">
              {stops.flatMap((stop, i) => {
                const isNewDay = i > 0 && stopDays[i] > stopDays[i - 1];
                const items = [];

                if (hasMultiDay && isNewDay) {
                  items.push(
                    <div key={`day-${i}`} className="flex items-center gap-3 py-1 my-1">
                      <div className="flex-1 h-px bg-brand-secondary" />
                      <span className="text-[11px] font-black text-brand-dark bg-brand-secondary px-3 py-1.5 rounded-full shrink-0">
                        {getDayLabel(stopDays[i])}
                      </span>
                      <div className="flex-1 h-px bg-brand-secondary" />
                    </div>
                  );
                }

                const lineToNext = i < stops.length - 1 && stopDays[i + 1] === stopDays[i];
                items.push(
                  <div key={stop.id} className="flex gap-3">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-8 h-8 rounded-full bg-brand-dark text-white flex items-center justify-center text-xs font-black">
                        {i + 1}
                      </div>
                      {lineToNext && (
                        <div className="w-px flex-1 bg-brand-secondary/60 mt-1 min-h-[1.5rem]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 mb-3">
                      <StopCard stop={stop} index={i} align="end" />
                    </div>
                  </div>
                );

                return items;
              })}
            </div>

            <div className="hidden lg:block relative">
              <div className="absolute inset-y-0 left-1/2 -translate-x-px w-0.5 bg-gradient-to-b from-transparent via-brand-secondary to-transparent" />

              <div className="flex flex-col gap-10">
                {stops.flatMap((stop, i) => {
                  const isNewDay = i > 0 && stopDays[i] > stopDays[i - 1];
                  const isRight  = i % 2 === 0;
                  const items    = [];

                  if (hasMultiDay && isNewDay) {
                    items.push(
                      <div key={`day-${i}`} className="relative flex items-center justify-center py-1 z-10">
                        <div className="flex items-center gap-4 w-full">
                          <div className="flex-1 h-px bg-brand-secondary" />
                          <span className="text-xs font-black text-white bg-brand-dark px-5 py-2 rounded-full shadow-md shrink-0">
                            {getDayLabel(stopDays[i])}
                          </span>
                          <div className="flex-1 h-px bg-brand-secondary" />
                        </div>
                      </div>
                    );
                  }

                  items.push(
                    <div key={stop.id} className="relative flex items-center gap-0">
                      <div className={`w-[calc(50%-2rem)] ${isRight ? 'order-1' : 'order-3'}`}>
                        {!isRight && <StopCard stop={stop} index={i} align="end" />}
                      </div>
                      <div className="order-2 w-16 flex flex-col items-center shrink-0 z-10">
                        <div className="w-10 h-10 rounded-full bg-brand-dark text-white flex items-center justify-center text-sm font-black shadow-md border-4 border-brand-light">
                          {i + 1}
                        </div>
                      </div>
                      <div className={`w-[calc(50%-2rem)] ${isRight ? 'order-3' : 'order-1'}`}>
                        {isRight && <StopCard stop={stop} index={i} align="start" />}
                      </div>
                    </div>
                  );

                  return items;
                })}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-brand-secondary/40 px-4 py-3 z-30 lg:hidden">
        <div className="flex gap-2">
          <button onClick={handleShare}
            className="flex items-center justify-center gap-2 flex-1 py-3 rounded-2xl font-bold text-sm bg-brand-secondary text-brand-dark active:scale-[0.98] transition-all">
            <Share2 size={16} /> مشاركة
          </button>
          {!isOwner && (
            <button onClick={handleCopyPlan} disabled={copying}
              className="flex items-center justify-center gap-2 flex-1 py-3 rounded-2xl font-bold text-sm bg-brand-dark text-white disabled:opacity-60 active:scale-[0.98] transition-all">
              {copying
                ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                : <><Copy size={16} /> نسخ الجدول</>}
            </button>
          )}
        </div>
      </div>

      <div className="hidden lg:flex max-w-5xl mx-auto px-6 pb-10 justify-end gap-3">
        <button onClick={handleShare}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm bg-white border border-brand-secondary text-brand-dark hover:bg-brand-secondary/30 transition-colors shadow-sm">
          <Share2 size={15} /> مشاركة
        </button>
        {!isOwner && (
          <button onClick={handleCopyPlan} disabled={copying}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm bg-brand-dark text-white hover:bg-brand-dark/80 transition-colors shadow-sm disabled:opacity-60">
            {copying
              ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              : <><Copy size={15} /> نسخ الجدول</>}
          </button>
        )}
      </div>

    </div>
  );
};

export default PlanDetails;
