import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Search, MapPin, Globe, ArrowLeft } from 'lucide-react';
import { usePublicPlans } from '../hooks/usePublicPlans';
import { CAT_ICON, CAT_BG, CAT_FG } from '../utils/categoryUtils';

const Explore = () => {
  const { plans, loading } = usePublicPlans();
  const [search, setSearch] = useState('');

  const filtered = plans.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.description ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-brand-light">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        <div className="mb-8">
          <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-2">
            COMMUNITY · المجتمع
          </p>
          <h1 className="text-3xl sm:text-5xl font-black text-brand-dark leading-snug mb-5">
            إلهام من المجتمع
          </h1>

          <div className="relative max-w-lg">
            <input
              type="text"
              placeholder="ابحث في جداول المجتمع..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pe-4 ps-11 py-3 rounded-2xl bg-white border border-brand-secondary/60 text-sm placeholder-gray-400 focus:outline-none focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/10 transition-all"
            />
            <Search size={16} className="absolute top-1/2 -translate-y-1/2 start-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-2xl h-52 animate-pulse border border-brand-secondary/30" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 flex flex-col items-center gap-3 bg-white rounded-2xl border border-brand-secondary/40">
            <p className="text-3xl">🗓️</p>
            <p className="text-gray-500 font-semibold">لا توجد جداول عامة بعد</p>
            <Link to="/create-jadwal" className="text-brand-primary text-sm font-bold hover:underline mt-1">
              أنشئ أول جدول وانشره
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(plan => {
              const stops      = plan.plan_stops ?? [];
              const stopCount  = stops.length;
              const categories = [...new Set(stops.map(s => s.places?.category).filter(Boolean))].slice(0, 4);
              const username   = plan.profiles?.username;
              const initials   = username ? username.slice(0, 2) : '؟';
              const dateLabel  = plan.date
                ? new Date(plan.date).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })
                : null;

              return (
                <Link
                  key={plan.id}
                  to={`/plans/${plan.id}`}
                  className="bg-white rounded-2xl border border-brand-secondary/40 p-4 flex flex-col gap-3 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-brand-secondary flex items-center justify-center text-[10px] font-black text-brand-dark shrink-0">
                        {initials}
                      </div>
                      <span className="text-xs text-gray-500 font-medium">@{username || 'مجهول'}</span>
                    </div>
                    {dateLabel && (
                      <div className="flex items-center gap-1 text-[11px] text-gray-400">
                        <Calendar size={11} />
                        <span>{dateLabel}</span>
                      </div>
                    )}
                  </div>

                  <h3 className="font-black text-brand-dark text-base leading-snug line-clamp-2 text-end">
                    {plan.title}
                  </h3>

                  {plan.description && (
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 text-end">
                      {plan.description}
                    </p>
                  )}

                  {categories.length > 0 && (
                    <div className="flex gap-1.5 justify-end">
                      {categories.map((cat, i) => {
                        const Ic = CAT_ICON[cat] ?? Globe;
                        return (
                          <div key={i}
                            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                            style={{ backgroundColor: CAT_BG[cat] ?? '#eee' }}>
                            <Ic size={13} style={{ color: CAT_FG[cat] ?? '#888' }} />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-brand-secondary/30 mt-auto">
                    <div className="flex items-center gap-1 text-[11px] text-brand-primary font-semibold group-hover:gap-2 transition-all">
                      <span>عرض الجدول</span>
                      <ArrowLeft size={11} />
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400">
                      {plan.start_time && (
                        <span className="flex items-center gap-1" dir="ltr">
                          <Clock size={11} />
                          {plan.start_time.slice(0, 5)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <MapPin size={11} />
                        {stopCount} محطة
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default Explore;
