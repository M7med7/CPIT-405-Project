import { useState, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { useExplorerPlans } from '../../hooks/useExplorerPlans';
import { savePlanWithStops, fetchPlanStopsForCopy } from '../../services/planService';
import { saveDraft, loadDraft, clearDraft } from '../../services/draftService';
import { catOf, CAT_ICON } from '../../utils/categoryUtils';
import { uid, pad, DAY_NAMES, getDayLabel, timeToMins, minsToTime } from '../../utils/plannerUtils';
import {
  Plus, X, Clock, Globe, Share2, ChevronDown,
  Copy,
} from 'lucide-react';

const EXPLORER_TAGS = ['يوم واحد', 'عائلة', 'شواطئ', 'صباح'];

const CreateJadwal = () => {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const location    = useLocation();
  const lastPreselectId = useRef(null);

  const draft = useRef(loadDraft());

  const [planTitle,   setPlanTitle]   = useState(draft.current?.planTitle   ?? 'جدولي الجديد');
  const [description, setDescription] = useState(draft.current?.description ?? '');
  const [date,        setDate]        = useState(draft.current?.date        ?? '');
  const [startTime,   setStartTime]   = useState(draft.current?.startTime   ?? '08:30');
  const [isPublic,    setIsPublic]    = useState(draft.current?.isPublic    ?? false);

  const [days,      setDays]      = useState(draft.current?.days      ?? [{ id: uid(), title: DAY_NAMES[0], stops: [] }]);
  const [activeDay, setActiveDay] = useState(draft.current?.activeDay ?? 0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedPlanId,  setSavedPlanId]  = useState(null);
  const [showDetails,  setShowDetails]  = useState(true);
  const [activeTag,    setActiveTag]    = useState(null);
  const [copyingPlan,  setCopyingPlan]  = useState(null);

  const { plans: explorerPlans, loading: explorerLoading } = useExplorerPlans(6);

  const stops      = days[activeDay]?.stops ?? [];
  const totalMins  = stops.reduce((s, st) => s + st.duration_mins, 0);

  const updateActiveStops = (updater) =>
    setDays(prev => prev.map((d, i) =>
      i === activeDay
        ? { ...d, stops: typeof updater === 'function' ? updater(d.stops) : updater }
        : d
    ));

  useState(() => {
    const incoming = location.state?.preselect;
    if (!incoming) return;
    if (lastPreselectId.current === incoming.id) return;
    lastPreselectId.current = incoming.id;

    updateActiveStops(prev => [...prev, {
      id: uid(), place_id: incoming.id, place_name: incoming.name,
      location_area: incoming.location_area, duration_mins: incoming.duration_mins ?? 60,
      category: incoming.category, notes: '',
    }]);
    window.history.replaceState({}, '');
  });

  const stopTimes = useMemo(() => {
    let total = timeToMins(startTime);
    return stops.map(stop => {
      const t = minsToTime(total);
      total += stop.duration_mins + 15;
      return t;
    });
  }, [stops, startTime]);

  const endTime = stops.length ? minsToTime(timeToMins(stopTimes.at(-1)) + stops.at(-1).duration_mins) : '—';

  const removeStop      = (id)        => updateActiveStops(p => p.filter(s => s.id !== id));
  const updateStopNotes = (id, notes) => updateActiveStops(p => p.map(s => s.id === id ? { ...s, notes } : s));

  const addDay = () => {
    const newDay = { id: uid(), title: getDayLabel(days.length + 1), stops: [] };
    setDays(prev => [...prev, newDay]);
    setActiveDay(days.length);
  };

  const deleteDay = (i) => {
    if (days.length === 1) return;
    setDays(prev => prev.filter((_, idx) => idx !== i));
    setActiveDay(prev => (prev >= i && prev > 0 ? prev - 1 : prev));
  };

  const handleShare = async () => {
    if (!savedPlanId) { toast.info('احفظ الجدول أولًا لمشاركته'); return; }
    const url = `${window.location.origin}/plans/${savedPlanId}`;
    try {
      if (navigator.share) { await navigator.share({ title: planTitle, url }); }
      else { await navigator.clipboard.writeText(url); toast.success('تم نسخ الرابط ✓'); }
    } catch { /* cancelled */ }
  };

  const handleCopyExplorerPlan = async (planId) => {
    setCopyingPlan(planId);
    try {
      const { data, error } = await fetchPlanStopsForCopy(planId);
      if (error) throw error;
      if (!data?.length) { toast.warning('لا توجد محطات في هذا الجدول'); return; }
      updateActiveStops(prev => [...prev, ...data.map(s => ({
        id: uid(), place_id: s.place_id,
        place_name: s.places?.name ?? '', location_area: s.places?.location_area ?? '',
        duration_mins: s.duration_mins ?? 60, category: s.places?.category ?? '',
        notes: s.notes ?? '',
      }))]);
      toast.success('تم نسخ المحطات إلى يومك الحالي');
    } catch { toast.error('تعذر نسخ الجدول. حاول مجددًا.'); }
    finally { setCopyingPlan(null); }
  };

  const handleSave = async () => {
    const totalStops = days.reduce((n, d) => n + d.stops.length, 0);
    if (!planTitle.trim()) { toast.error('أدخل عنوانًا للجدول'); return; }
    if (!date)             { toast.error('اختر تاريخًا للجدول', { description: 'اضغط على رأس الجدول لفتح تفاصيل الجدول واختيار التاريخ' }); setShowDetails(true); return; }
    if (totalStops === 0)  { toast.error('أضف محطة واحدة على الأقل'); return; }

    setIsSubmitting(true);
    try {
      const plan = await savePlanWithStops({
        userId: user.id, title: planTitle, description,
        date, startTime, isPublic, days,
      });
      setSavedPlanId(plan.id);
      clearDraft();
      toast.success('تم حفظ الجدول بنجاح ✓');
      navigate(`/plans/${plan.id}`);
    } catch (e) {
      toast.error(e.message ?? 'حدث خطأ. حاول مجددًا.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light pb-28 lg:pb-6">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-5 py-4 sm:py-6 flex flex-col gap-4">

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPublic(v => !v)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                isPublic ? 'bg-brand-primary text-white shadow-md' : 'bg-brand-dark text-white hover:bg-brand-dark/80'
              }`}
            >
              {isPublic ? '🌐 سيُنشر عند الحفظ' : 'نشر للمجتمع'}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-dark p-2 rounded-full hover:bg-brand-secondary/40 transition-colors"
              title="مشاركة"
            >
              <Share2 size={16} />
            </button>
          </div>

          <input
            value={planTitle}
            onChange={e => setPlanTitle(e.target.value)}
            className="text-xl sm:text-3xl lg:text-4xl font-black text-brand-dark bg-transparent outline-none text-end flex-1 min-w-0 placeholder-brand-secondary/60"
            placeholder="اسم جدولك..."
            dir="rtl"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {days.map((day, i) => {
            const isActive = i === activeDay;
            return (
              <div key={day.id} className="relative shrink-0 flex items-center">
                <button
                  onClick={() => setActiveDay(i)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-brand-dark text-white shadow'
                      : 'bg-white border border-brand-secondary/50 text-gray-600'
                  }`}
                >
                  {day.title}
                  {day.stops.length > 0 && (
                    <span className={`text-[10px] ${isActive ? 'text-white/60' : 'text-gray-400'}`}>
                      {day.stops.length}
                    </span>
                  )}
                </button>
                {!isActive && days.length > 1 && (
                  <button
                    onClick={() => deleteDay(i)}
                    className="absolute -top-1 -start-1 w-4 h-4 rounded-full bg-red-400 text-white flex items-center justify-center"
                  >
                    <X size={8} strokeWidth={3} />
                  </button>
                )}
              </div>
            );
          })}
          <button
            onClick={addDay}
            className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-brand-primary bg-white border border-dashed border-brand-primary/40 hover:bg-brand-secondary/20 transition-colors"
          >
            <Plus size={11} />
            يوم
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-brand-secondary/50 overflow-hidden">
          <button
            onClick={() => setShowDetails(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 lg:cursor-default"
          >
            <div className="flex items-center gap-3 text-xs text-gray-400" dir="ltr">
              <Clock size={13} />
              <span className="font-medium">{startTime} — {endTime}</span>
              {totalMins > 0 && (
                <span className="bg-brand-secondary/50 text-brand-dark px-2 py-0.5 rounded-full text-[10px] font-semibold">
                  {totalMins} د
                </span>
              )}
              {date && (
                <span className="text-[10px] text-gray-400">{new Date(date).toLocaleDateString('ar-SA')}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-brand-dark">{days[activeDay]?.title}</span>
              <ChevronDown
                size={14}
                className={`text-gray-400 transition-transform lg:hidden ${showDetails ? 'rotate-180' : ''}`}
              />
            </div>
          </button>

          <div className={`${showDetails ? 'block' : 'hidden'} lg:block border-t border-brand-secondary/30 px-4 py-3`}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className="text-[10px] text-gray-400 mb-1 block">
                  التاريخ <span className="text-red-400">*</span>
                </label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-brand-secondary/60 focus:outline-none focus:border-brand-primary/50 bg-brand-light" dir="ltr" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 mb-1 block">وقت البداية</label>
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-brand-secondary/60 focus:outline-none focus:border-brand-primary/50 bg-brand-light" dir="ltr" />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] text-gray-400 mb-1 block">وصف (اختياري)</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="عن هذا الجدول..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-brand-secondary/60 focus:outline-none focus:border-brand-primary/50 bg-brand-light"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 items-start">

          <div className="w-48 shrink-0 hidden lg:flex flex-col gap-3">
            <div className="bg-white rounded-3xl border border-brand-secondary/50 p-4 flex flex-col gap-2">
              <p className="text-[10px] text-gray-400 font-semibold tracking-wide mb-1">الأيام</p>
              {days.map((day, i) => {
                const isActive = i === activeDay;
                return isActive ? (
                  <div key={day.id} className="bg-brand-dark text-white rounded-2xl p-3">
                    <p className="text-sm font-black">{day.title}</p>
                    <p className="text-[11px] text-white/50 mt-0.5">{stops.length} محطات</p>
                    <div className="flex gap-1 justify-end flex-wrap mt-1.5">
                      {stops.slice(0, 4).map((s, j) => {
                        const { Icon, bg } = catOf(s.category);
                        return (
                          <div key={j} className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: bg + '50' }}>
                            <Icon size={10} className="text-white/70" />
                          </div>
                        );
                      })}
                      {stops.length > 4 && <span className="text-[9px] text-white/40 self-center">+{stops.length - 4}</span>}
                    </div>
                  </div>
                ) : (
                  <div
                    key={day.id}
                    onClick={() => setActiveDay(i)}
                    className="rounded-2xl p-3 border border-brand-secondary/40 hover:bg-brand-secondary/20 transition-colors cursor-pointer group/day"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-400">{day.stops.length}</span>
                        <button
                          onClick={e => { e.stopPropagation(); deleteDay(i); }}
                          className="opacity-0 group-hover/day:opacity-100 transition-opacity p-0.5 text-gray-300 hover:text-red-400"
                        >
                          <X size={10} />
                        </button>
                      </div>
                      <div className="text-end">
                        <p className="text-xs font-bold text-brand-dark">{day.title}</p>
                        <p className="text-[10px] text-gray-400">
                          {[...new Set(day.stops.map(s => s.location_area))].slice(0, 2).join(' و') || 'لا محطات'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <button onClick={addDay}
                className="text-xs text-brand-primary font-semibold py-1 hover:underline flex items-center justify-end gap-1 mt-1">
                <Plus size={11} /> أضف يومًا
              </button>
              <div className="border-t border-brand-secondary/40 pt-3 mt-1">
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  ارجع لمكتبة الأماكن · اضغط محطة لتعديل ملاحظاتها.
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0 flex flex-col gap-3">

            <button
              onClick={() => {
                saveDraft({ planTitle, description, date, startTime, isPublic, days, activeDay });
                navigate('/places');
              }}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-brand-primary bg-white border-2 border-dashed border-brand-primary/30 rounded-2xl hover:bg-brand-secondary/20 hover:border-brand-primary/50 transition-all"
            >
              <Plus size={16} />
              أضف محطة من مكتبة الأماكن
            </button>

            <div className="bg-white rounded-3xl border border-brand-secondary/50 overflow-hidden">
              {stops.length === 0 ? (
                <div className="py-14 flex flex-col items-center gap-3 text-center px-6">
                  <div className="w-14 h-14 rounded-full bg-brand-secondary/40 flex items-center justify-center">
                    <Plus size={24} className="text-brand-primary/50" />
                  </div>
                  <p className="text-sm font-bold text-brand-dark">ابدأ بإضافة محطاتك</p>
                  <p className="text-xs text-gray-400 max-w-[220px] leading-relaxed">
                    اضغط الزر أعلاه للذهاب إلى مكتبة الأماكن وإضافة محطة
                  </p>
                </div>
              ) : (
                stops.map((stop, i) => {
                  const { Icon, bg, fg } = catOf(stop.category);
                  return (
                    <div key={stop.id}
                      className="flex items-start gap-3 px-4 py-3.5 border-b border-brand-secondary/20 last:border-0 active:bg-brand-secondary/10 transition-colors">

                      <div className="w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center mt-0.5" style={{ backgroundColor: bg }}>
                        <Icon size={16} style={{ color: fg }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-brand-dark text-sm leading-snug">{stop.place_name}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{stop.location_area} · {stop.duration_mins} د</p>
                        <input
                          type="text"
                          value={stop.notes}
                          onChange={e => updateStopNotes(stop.id, e.target.value)}
                          placeholder="ملاحظة..."
                          className="mt-1.5 w-full text-xs text-gray-500 bg-brand-light/60 rounded-lg px-2 py-1.5 outline-none placeholder-gray-300 focus:bg-brand-secondary/30 transition-colors"
                        />
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-lg font-black text-brand-dark tabular-nums" dir="ltr">
                          {stopTimes[i]}
                        </span>
                        <button
                          onClick={() => removeStop(stop.id)}
                          className="p-1.5 text-gray-300 hover:text-red-400 active:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={isSubmitting || days.every(d => d.stops.length === 0)}
              className="hidden lg:flex w-full items-center justify-center gap-2 bg-brand-dark text-white py-3.5 rounded-2xl font-bold hover:bg-brand-dark/80 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                : 'حفظ الجدول'}
            </button>
          </div>

          <div className="w-60 shrink-0 hidden lg:flex flex-col gap-3">
            <div className="bg-white rounded-3xl border border-brand-secondary/50 p-4">
              <p className="text-[10px] tracking-widest text-gray-400 uppercase mb-1">EXPLORER</p>
              <h3 className="text-sm font-black text-brand-dark mb-3">إلهام من المجتمع</h3>
              <div className="flex gap-1.5 flex-wrap mb-4">
                {EXPLORER_TAGS.map(tag => (
                  <button key={tag}
                    onClick={() => setActiveTag(t => t === tag ? null : tag)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      activeTag === tag ? 'bg-brand-dark text-white' : 'bg-brand-secondary/50 text-brand-dark hover:bg-brand-secondary'
                    }`}
                  >{tag}</button>
                ))}
              </div>
              {explorerLoading ? (
                <div className="flex flex-col gap-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-16 rounded-xl bg-brand-secondary/30 animate-pulse" />
                  ))}
                </div>
              ) : explorerPlans.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">لا توجد جداول عامة بعد</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {explorerPlans.map(plan => {
                    const username = plan.profiles?.username;
                    const initials = username ? username.slice(0, 2) : '؟';
                    const icons = [...new Set(
                      (plan.plan_stops || []).map(s => s.places?.category).filter(Boolean)
                    )].slice(0, 3).map(cat => CAT_ICON[cat] ?? Globe);

                    return (
                      <div key={plan.id} className="border-b border-brand-secondary/30 pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-gray-400">{plan.plan_stops?.length ?? 0} محطة</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-brand-dark">@{username || 'مجهول'}</span>
                            <div className="w-6 h-6 rounded-full bg-brand-secondary flex items-center justify-center text-[9px] font-black text-brand-dark">
                              {initials}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm font-black text-brand-dark text-end mb-1.5 line-clamp-1">{plan.title}</p>
                        <div className="flex gap-1 justify-end mb-2">
                          {icons.length > 0 ? icons.map((Ic, j) => (
                            <div key={j} className="w-6 h-6 rounded-full bg-brand-secondary/50 flex items-center justify-center">
                              <Ic size={11} className="text-brand-primary" />
                            </div>
                          )) : (
                            <div className="w-6 h-6 rounded-full bg-brand-secondary/50 flex items-center justify-center">
                              <Globe size={11} className="text-brand-primary" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => handleCopyExplorerPlan(plan.id)}
                            disabled={copyingPlan === plan.id}
                            className="flex items-center gap-1 text-[11px] bg-brand-secondary/50 text-brand-dark px-2.5 py-1 rounded-full font-medium hover:bg-brand-secondary transition-colors disabled:opacity-60"
                          >
                            {copyingPlan === plan.id
                              ? <span className="animate-spin inline-block w-3 h-3 border border-brand-dark/30 border-t-brand-dark rounded-full" />
                              : <Copy size={10} />}
                            انسخ
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-brand-secondary/40 px-4 py-3 z-30">
        <button
          onClick={handleSave}
          disabled={isSubmitting || days.every(d => d.stops.length === 0)}
          className="w-full flex items-center justify-center gap-2 bg-brand-dark text-white py-3.5 rounded-2xl font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
        >
          {isSubmitting
            ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
            : 'حفظ الجدول'}
        </button>
      </div>
    </div>
  );
};

export default CreateJadwal;
