import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, Loader2, ArrowLeft, MapPin, Copy } from 'lucide-react';
import WeatherWidget from '../../components/WeatherWidget';

const PlanDetails = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [plan, setPlan] = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlanDetails = async () => {
      try {
        setLoading(true);
        // Fetch Plan details
        const { data: planData, error: planError } = await supabase
          .from('plans')
          .select(`
            *,
            profiles(username)
          `)
          .eq('id', id)
          .single();

        if (planError) throw planError;
        setPlan(planData);

        // Fetch Stops
        const { data: stopsData, error: stopsError } = await supabase
          .from('plan_stops')
          .select(`
            id, arrival_time, duration_mins, notes, order_index,
            places(name, location_area, category, image_url)
          `)
          .eq('plan_id', id)
          .order('order_index', { ascending: true });

        if (stopsError) throw stopsError;
        setStops(stopsData || []);

      } catch (err) {
        console.error("Error fetching plan details:", err);
        setError("Could not load plan details. It might be private or deleted.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPlanDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="animate-spin text-brand-primary" size={48} />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops!</h2>
        <p className="text-gray-500 mb-8">{error}</p>
        <button onClick={() => navigate(-1)} className="text-brand-primary hover:underline flex items-center justify-center gap-2 mx-auto">
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  const isOwner = user?.id === plan.user_id;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header */}
      <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-brand-dark mb-6 flex items-center gap-2 transition-colors">
        <ArrowLeft size={20} /> Back
      </button>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-brand-secondary mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-brand-primary"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-dark mb-2">{plan.title}</h1>
            <p className="text-gray-600 mb-6 max-w-2xl">{plan.description}</p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                <Calendar size={16} className="text-brand-primary" />
                <span className="font-medium">{new Date(plan.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                <Clock size={16} className="text-brand-primary" />
                <span className="font-medium" dir="ltr">{plan.start_time.slice(0, 5)}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                <span className="font-medium">By @{plan.profiles?.username || 'Anonymous'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 items-end">
            <WeatherWidget targetDate={plan.date} />
            
            {!isOwner && (
              <button className="flex items-center gap-2 bg-brand-dark text-white px-5 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-sm whitespace-nowrap">
                <Copy size={18} />
                Copy Plan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Timeline of Stops */}
      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
        
        {stops.map((stop, index) => (
          <div key={stop.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            {/* Timeline dot */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-brand-primary text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 font-bold text-sm z-10">
              {index + 1}
            </div>
            
            {/* Card */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-brand-primary font-bold text-lg" dir="ltr">{stop.arrival_time.slice(0, 5)}</div>
                  <h3 className="font-bold text-brand-dark text-lg">{stop.places?.name}</h3>
                </div>
                <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {stop.duration_mins} mins
                </span>
              </div>
              
              <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                <MapPin size={14} />
                <span>{stop.places?.location_area}</span>
              </div>

              {stop.notes && (
                <div className="bg-orange-50/50 p-3 rounded-xl border border-brand-secondary/30 text-sm text-gray-700">
                  <span className="font-semibold block mb-1">Notes:</span>
                  {stop.notes}
                </div>
              )}
            </div>
          </div>
        ))}

      </div>

    </div>
  );
};

export default PlanDetails;
