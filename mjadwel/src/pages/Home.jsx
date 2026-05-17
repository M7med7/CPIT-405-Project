import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MapPin, ArrowLeft, Globe } from 'lucide-react';
import { usePlaces } from '../hooks/usePlaces';
import { useCommunityPlans } from '../hooks/useCommunityPlans';
import { usePublicPlanCount } from '../hooks/usePublicPlanCount';
import { useRecentPlaces } from '../hooks/useRecentPlaces';
import { catOf, CAT_ICON } from '../utils/categoryUtils';

const TRENDING_PCTS = [24, 18, 12, 9, 8, 7, 5];

function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

const Home = () => {
  const { t } = useTranslation();
  const { places, loading } = usePlaces();
  const communityPlans = useCommunityPlans(3);
  const planCount      = usePublicPlanCount();
  const heroPlaces     = useRecentPlaces(3);

  const [trendingRef,  trendingVisible]  = useInView(0.05);
  const [communityRef, communityVisible] = useInView(0.05);
  const [ctaRef,       ctaVisible]       = useInView(0.1);

  const delay = (ms) => ({ animationDelay: `${ms}ms` });

  return (
    <div>

      {/* ══ HERO ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-brand-light min-h-[calc(100svh-4rem)] flex items-center">

        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, rgba(155,106,70,0.08) 1.5px, transparent 1.5px)',
          backgroundSize: '28px 28px',
        }} />

        <div className="absolute -top-32 -start-32 w-[32rem] h-[32rem] rounded-full bg-brand-primary/6 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -end-24 w-96 h-96 rounded-full bg-brand-secondary/50 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            <div>
              <h1
                className="anim-fade-up text-5xl sm:text-6xl lg:text-[3.8rem] font-black text-brand-dark leading-[1.1] mb-6"
                style={delay(0)}
              >
               جدول مثل المجدولين<br />
                في{' '}
                <span className="relative inline-block">
                  <span className="relative z-10">جدة</span>
                  <span className="absolute bottom-1.5 inset-x-0 h-3 bg-brand-primary/20 rounded-sm -z-0" />
                </span>
                {' '}
              </h1>

              <p
                className="anim-fade-up text-[15px] text-gray-500 leading-relaxed mb-10 max-w-[38ch]"
                style={delay(120)}
              >
                 رتّب جدول الويكند، وشارك الجدول مع الشلة — أو شوف لك جدول من مجدولين يعرفون جدة.
              </p>

              <div className="anim-fade-up flex flex-wrap gap-3 mb-10" style={delay(240)}>
                <Link
                  to="/create-jadwal"
                  className="flex items-center gap-2 bg-brand-dark text-white px-7 py-3.5 rounded-full text-sm font-bold hover:bg-brand-dark/80 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                >
                  <span>{t('start_planning')}</span>
                  <ArrowLeft size={15} />
                </Link>
                <Link
                  to="/places"
                  className="flex items-center gap-2 bg-white border border-brand-secondary text-brand-dark px-7 py-3.5 rounded-full text-sm font-bold hover:bg-brand-secondary/40 transition-all duration-200 active:scale-95"
                >
                  <span>{t('explore_places')}</span>
                </Link>
              </div>

              <div className="anim-fade-up flex items-center gap-6" style={delay(360)}>
                <div>
                  <p className="text-2xl font-black text-brand-dark tabular-nums">
                    {loading ? '—' : `${places.length}+`}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">مكان في جدة</p>
                </div>
                <div className="w-px h-8 bg-brand-secondary" />
                <div>
                  <p className="text-2xl font-black text-brand-dark tabular-nums">
                    {planCount != null ? `${planCount}+` : '—'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">جدول مجدولين</p>
                </div>
                <div className="w-px h-8 bg-brand-secondary" />
                <div>
                  <p className="text-2xl font-black text-brand-dark">٥</p>
                  <p className="text-xs text-gray-400 mt-0.5">تصنيفات</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="anim-fade-up" style={delay(180)}>
                <div className="anim-float" style={{ animationDelay: '900ms' }}>
                  <div className="relative w-[290px] lg:w-[400px] h-[320px] lg:h-[420px]">

                    {heroPlaces.map((place, i) => {
                      const { Icon, bg, fg } = catOf(place.category);
                      const pct      = TRENDING_PCTS[i] ?? 5;
                      const offsetTop  = i * 62;
                      const offsetSide = i * 24;
                      const rotate     = i % 2 === 0 ? -2.5 : 2;
                      const shadow     = i === 0
                        ? '0 20px 56px rgba(0,0,0,0.14)'
                        : i === 1 ? '0 8px 24px rgba(0,0,0,0.08)'
                        : '0 4px 12px rgba(0,0,0,0.05)';
                      const cardBg = i === 0 ? '#fff' : i === 1 ? '#fdfaf6' : '#f5f1ec';

                      return (
                        <div
                          key={place.id}
                          className="anim-fade-up absolute w-full rounded-2xl lg:rounded-3xl overflow-hidden border border-brand-secondary/40"
                          style={{
                            top: offsetTop, right: offsetSide,
                            zIndex: heroPlaces.length - i,
                            transform: `rotate(${rotate}deg)`,
                            background: cardBg, boxShadow: shadow,
                            animationDelay: `${200 + i * 130}ms`,
                          }}
                        >
                          {place.image_url ? (
                            <img src={place.image_url} alt={place.name} className="w-full object-cover h-32 lg:h-48" />
                          ) : (
                            <div className="w-full flex items-center justify-center h-32 lg:h-48" style={{ backgroundColor: bg }}>
                              <Icon size={44} style={{ color: fg, opacity: 0.3 }} strokeWidth={1.2} />
                            </div>
                          )}

                          <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                              {pct}%+ ↑
                            </span>
                            <div className="text-end min-w-0">
                              <p className="text-sm font-black text-brand-dark leading-tight truncate">{place.name}</p>
                              <p className="text-[11px] text-gray-400 truncate">{place.location_area}</p>
                            </div>
                            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
                              <Icon size={12} style={{ color: fg }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <div
                      className="anim-pop-in absolute -top-4 -start-4 bg-brand-dark text-white text-[11px] font-black px-3.5 py-2 rounded-2xl shadow-lg whitespace-nowrap z-50"
                      style={delay(850)}
                    >
                      🔥 الأكثر زيارة
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══ TRENDING PLACES ════════════════════════════════════════ */}
      <section
        ref={trendingRef}
        className={`py-10 sm:py-14 overflow-hidden transition-all duration-700 ease-out ${
          trendingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[11px] text-gray-400 mb-1 font-medium tracking-wide">الأماكن في جدة</p>
              <h2 className="text-2xl font-black text-brand-dark">{t('popular_places')}</h2>
            </div>
            <Link
              to="/places"
              className="flex items-center gap-1.5 text-sm text-brand-primary font-semibold hover:underline transition-colors"
            >
              <span>{t('browse_all')}</span>
              <ArrowLeft size={15} />
            </Link>
          </div>
        </div>

        <div className="flex gap-3 sm:gap-4 overflow-x-auto px-4 sm:px-6 pb-2 no-scrollbar">
          {loading
            ? Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-44 h-44 bg-brand-secondary/30 rounded-2xl animate-pulse" />
              ))
            : places.map((place, i) => {
                const Icon = CAT_ICON[place.category] ?? MapPin;
                const pct  = TRENDING_PCTS[i] ?? Math.max(3, 20 - i * 2);
                return (
                  <Link
                    key={place.id}
                    to="/places"
                    className="group flex-shrink-0 w-44 rounded-2xl overflow-hidden border border-brand-secondary/50 bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                  >
                    <div className="bg-brand-secondary/20 flex items-center justify-center h-28 group-hover:bg-brand-secondary/30 transition-colors relative overflow-hidden">
                      {place.image_url
                        ? <img src={place.image_url} alt={place.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        : <Icon size={30} className="text-brand-secondary" strokeWidth={1.2} />}
                    </div>
                    <div className="p-3 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-brand-dark leading-snug line-clamp-1">{place.name}</p>
                        <div className="flex items-center gap-0.5 mt-0.5">
                          <Globe size={9} className="text-gray-300 shrink-0" />
                          <span className="text-[10px] text-gray-400 truncate">{place.location_area}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0 mt-0.5">
                        {pct}%+ ↑
                      </span>
                    </div>
                  </Link>
                );
              })}
        </div>
      </section>

      {/* ══ COMMUNITY PLANS ════════════════════════════════════════ */}
      <section ref={communityRef} className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className={`mb-8 sm:mb-10 transition-all duration-700 ease-out ${
          communityVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <p className="text-[11px] font-bold tracking-[0.16em] text-gray-400 mb-2 uppercase">
            Community · من الناس
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-brand-dark">جداول من ناس يعرفون جدة.</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {communityPlans.map((plan, idx) => {
            const dark = plan.featured;
            return (
              <Link
                key={plan.id}
                to={`/plans/${plan.id}`}
                className={`rounded-3xl p-6 flex flex-col gap-5 transition-all duration-700 ease-out hover:-translate-y-1 ${
                  dark
                    ? 'bg-brand-dark text-brand-light hover:shadow-2xl hover:shadow-brand-dark/20'
                    : 'bg-white border border-brand-secondary/50 hover:shadow-lg hover:shadow-brand-secondary/40'
                } ${communityVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: communityVisible ? `${idx * 120}ms` : '0ms' }}
              >
                <div className="flex gap-2 flex-wrap">
                  {plan.tags.map(tag => (
                    <span key={tag} className={`text-xs px-3 py-1 rounded-full font-medium ${
                      dark ? 'bg-white/15 text-white/90' : 'bg-brand-secondary/50 text-brand-dark'
                    }`}>
                      {tag}
                    </span>
                  ))}
                </div>

                <h3 className={`text-2xl font-black leading-snug ${dark ? 'text-white' : 'text-brand-dark'}`}>
                  {plan.title}
                </h3>

                <p className={`text-sm leading-relaxed italic flex-1 ${dark ? 'text-white/55' : 'text-gray-400'}`}>
                  {plan.description}
                </p>

                <div className="flex items-center gap-2">
                  {(plan.stopIcons ?? []).map((SIcon, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      dark ? 'bg-white/15' : 'bg-brand-secondary/50'
                    }`}>
                      <SIcon size={14} className={dark ? 'text-white/70' : 'text-brand-primary'} />
                    </div>
                  ))}
                  {plan.extra > 0 && (
                    <span className={`text-xs font-semibold ${dark ? 'text-white/40' : 'text-gray-400'}`}>
                      {plan.extra}+
                    </span>
                  )}
                </div>

                <div className={`flex items-center justify-between pt-4 border-t ${
                  dark ? 'border-white/10' : 'border-brand-secondary/40'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      dark ? 'bg-brand-primary text-white' : 'bg-brand-secondary text-brand-dark'
                    }`}>
                      {plan.initials}
                    </div>
                    <span className={`text-sm font-medium ${dark ? 'text-white/80' : 'text-brand-dark'}`}>
                      {plan.creator}
                    </span>
                  </div>
                  <span className={`text-xs ${dark ? 'text-white/40' : 'text-gray-400'}`}>
                    {plan.days} يوم · {plan.stops} محطات
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ══ BOTTOM CTA BANNER ══════════════════════════════════════ */}
      <section ref={ctaRef} className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
        <div className={`relative overflow-hidden rounded-3xl bg-brand-dark px-8 sm:px-14 py-12 sm:py-16 text-center transition-all duration-700 ease-out ${
          ctaVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-[0.97]'
        }`}>
          <div className="absolute inset-0 pointer-events-none opacity-[0.06]" style={{
            backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)',
            backgroundSize: '28px 28px',
          }} />
          <div className="absolute -top-16 -start-16 w-64 h-64 rounded-full bg-brand-primary/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -end-16 w-64 h-64 rounded-full bg-brand-secondary/10 blur-3xl pointer-events-none" />

          <div className="relative">
            <p className="text-[11px] font-bold tracking-[0.2em] text-white/40 uppercase mb-4">جدول الحين — </p>
            <h2 className="text-3xl sm:text-5xl font-black text-white leading-snug mb-5">
              يومك في جدة<br />يستاهل.
            </h2>
            <p className="text-white/50 text-sm mb-8 max-w-[36ch] mx-auto leading-relaxed">
              سجّل في مجدول ورتّب يومك الأول في دقائق — أو شوف جداول ناس من جدة يعرفون أحلى الأماكن.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/register"
                className="flex items-center gap-2 bg-brand-primary text-white px-8 py-3.5 rounded-full text-sm font-bold hover:bg-amber-700 transition-all duration-200 shadow-lg active:scale-95"
              >
                <span>سجّل الآن</span>
                <ArrowLeft size={15} />
              </Link>
              <Link
                to="/explore"
                className="flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 px-8 py-3.5 rounded-full text-sm font-bold hover:bg-white/20 transition-all duration-200 active:scale-95"
              >
                <span>شوف جداول الناس</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
