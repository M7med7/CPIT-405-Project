import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMyPlans } from '../../hooks/useMyPlans';
import { Calendar, Clock, Loader2, Plus, Globe, Lock, MapPin } from 'lucide-react';

const MyPlans = () => {
  const { user } = useAuth();
  const { plans, loading, togglingId, togglePublic } = useMyPlans(user.id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-1">MY PLANS</p>
          <h1 className="text-3xl sm:text-4xl font-black text-brand-dark">جداولي</h1>
        </div>
        <Link
          to="/create-jadwal"
          className="flex items-center gap-2 bg-brand-dark text-white px-4 py-2.5 rounded-2xl text-sm font-bold hover:bg-brand-dark/80 transition-colors"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">جدول جديد</span>
          <span className="sm:hidden">جديد</span>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl h-48 animate-pulse border border-brand-secondary/30" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="py-24 flex flex-col items-center gap-4 bg-white rounded-2xl border border-brand-secondary/40">
          <p className="text-4xl">🗓️</p>
          <p className="text-gray-500 font-semibold">لا توجد جداول بعد</p>
          <Link to="/create-jadwal"
            className="bg-brand-dark text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-brand-dark/80 transition-colors">
            أنشئ جدولك الأول
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map(plan => {
            const stopCount = plan.plan_stops?.[0]?.count ?? 0;
            const dateLabel = plan.date
              ? new Date(plan.date).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric', year: 'numeric' })
              : null;

            return (
              <div key={plan.id}
                className="bg-white rounded-2xl border border-brand-secondary/40 p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">

                <div className="flex items-start justify-between gap-2">
                  <button
                    onClick={() => togglePublic(plan)}
                    disabled={togglingId === plan.id}
                    title={plan.is_public ? 'انقر لإخفائه عن المجتمع' : 'انقر لنشره للمجتمع'}
                    className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                      plan.is_public
                        ? 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    {togglingId === plan.id
                      ? <span className="animate-spin inline-block w-3 h-3 border border-current/30 border-t-current rounded-full" />
                      : plan.is_public
                        ? <><Globe size={11} /> منشور</>
                        : <><Lock size={11} /> خاص</>
                    }
                  </button>
                  <h3 className="font-black text-brand-dark text-base leading-snug text-end line-clamp-2 flex-1">
                    {plan.title}
                  </h3>
                </div>

                {plan.description && (
                  <p className="text-xs text-gray-400 line-clamp-2 text-end leading-relaxed">
                    {plan.description}
                  </p>
                )}

                <div className="flex items-center justify-end gap-3 text-[11px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin size={11} />
                    {stopCount} محطة
                  </span>
                  {plan.start_time && (
                    <span className="flex items-center gap-1" dir="ltr">
                      <Clock size={11} />
                      {plan.start_time.slice(0, 5)}
                    </span>
                  )}
                  {dateLabel && (
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {dateLabel}
                    </span>
                  )}
                </div>

                <Link
                  to={`/plans/${plan.id}`}
                  className="mt-auto w-full text-center py-2.5 rounded-xl text-sm font-bold bg-brand-secondary/50 text-brand-dark hover:bg-brand-secondary transition-colors"
                >
                  عرض الجدول
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyPlans;
