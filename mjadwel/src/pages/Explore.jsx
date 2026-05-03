import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Calendar, Clock, Loader2, Users, Search } from 'lucide-react';

const Explore = () => {
  const { t } = useTranslation();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPublicPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('plans')
          .select(`
            id, title, description, date, start_time,
            profiles ( username, avatar_url ),
            plan_stops(count)
          `)
          .eq('is_public', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPlans(data || []);
      } catch (err) {
        console.error("Error fetching public plans:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicPlans();
  }, []);

  const filteredPlans = plans.filter(plan => 
    plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (plan.description && plan.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="flex justify-center mb-4 text-brand-primary">
          <Users size={48} />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-brand-dark mb-4">{t('explore')}</h1>
        <p className="text-gray-500 text-lg">
          Discover schedules created by the Mjadwel community. Get inspired or copy a plan for your next outing.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-xl mx-auto mb-10 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text"
          placeholder="Search community plans..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-full bg-white shadow-sm border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-brand-primary" size={40} />
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-brand-secondary">
          <p className="text-gray-500 text-lg">No public plans found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map(plan => (
            <div key={plan.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-brand-secondary transition-all flex flex-col">
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold overflow-hidden border border-brand-primary/20">
                  {plan.profiles?.avatar_url ? (
                    <img src={plan.profiles.avatar_url} alt={plan.profiles.username} className="w-full h-full object-cover" />
                  ) : (
                    (plan.profiles?.username || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-brand-dark">@{plan.profiles?.username || 'Anonymous'}</div>
                  <div className="text-xs text-gray-500">Shared a plan</div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-brand-dark line-clamp-1 mb-2">{plan.title}</h3>
              
              <p className="text-sm text-gray-600 line-clamp-2 mb-6 flex-grow min-h-[40px]">
                {plan.description || 'No description provided.'}
              </p>

              <div className="flex flex-col gap-2 text-sm text-gray-500 mb-6 bg-gray-50 p-3 rounded-xl">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-brand-primary" />
                    <span>{new Date(plan.date).toLocaleDateString()}</span>
                  </div>
                  <div className="font-semibold text-brand-dark bg-white px-2 py-1 rounded shadow-sm text-xs">
                    {plan.plan_stops?.[0]?.count || 0} stops
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-brand-primary" />
                  <span dir="ltr">Starts at: {plan.start_time.slice(0, 5)}</span>
                </div>
              </div>

              <Link 
                to={`/plans/${plan.id}`}
                className="w-full text-center bg-brand-primary text-white hover:bg-amber-800 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
              >
                View Itinerary
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;
