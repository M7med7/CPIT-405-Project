import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, Loader2, Plus, Globe, Lock } from 'lucide-react';

const MyPlans = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('plans')
          .select(`
            id, title, description, date, is_public, start_time,
            plan_stops(count)
          `)
          .eq('user_id', user.id)
          .order('date', { ascending: true });

        if (error) throw error;
        setPlans(data || []);
      } catch (err) {
        console.error("Error fetching plans:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [user.id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark mb-2">{t('my_plans')}</h1>
          <p className="text-gray-500">Manage and view your upcoming and past itineraries.</p>
        </div>
        
        <Link 
          to="/create-jadwal" 
          className="bg-brand-primary text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-amber-800 transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          {t('create_plan')}
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-brand-primary" size={40} />
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-brand-secondary">
          <p className="text-gray-500 text-lg mb-4">You haven't created any plans yet.</p>
          <Link 
            to="/create-jadwal" 
            className="inline-block bg-brand-primary text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-amber-800 transition-colors"
          >
            Create Your First Jadwal
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan.id} className="bg-white rounded-2xl p-6 shadow-sm border border-brand-secondary hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-brand-dark line-clamp-1">{plan.title}</h3>
                <div className="text-gray-400" title={plan.is_public ? 'Public' : 'Private'}>
                  {plan.is_public ? <Globe size={18} /> : <Lock size={18} />}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 line-clamp-2 mb-6 min-h-[40px]">
                {plan.description || 'No description provided.'}
              </p>

              <div className="flex flex-col gap-2 text-sm text-gray-500 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-brand-primary" />
                  <span>{new Date(plan.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-brand-primary" />
                    <span dir="ltr">Start: {plan.start_time.slice(0, 5)}</span>
                  </div>
                  <div className="font-semibold text-brand-dark bg-gray-100 px-3 py-1 rounded-full text-xs">
                    {plan.plan_stops?.[0]?.count || 0} stops
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Link 
                  to={`/plans/${plan.id}`}
                  className="flex-1 text-center bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-xl text-sm font-semibold transition-colors border border-gray-200"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPlans;
