import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { Plus, X, Clock, GripVertical, Loader2, Search } from 'lucide-react';

const CreateJadwal = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [isPublic, setIsPublic] = useState(false);
  
  const [places, setPlaces] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const [stops, setStops] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Search places dynamically
  useEffect(() => {
    if (searchQuery.length < 2) {
      setPlaces([]);
      return;
    }

    const searchPlaces = async () => {
      setIsSearching(true);
      const { data, error } = await supabase
        .from('places')
        .select('id, name, location_area, duration_mins')
        .ilike('name', `%${searchQuery}%`)
        .limit(5);

      if (!error && data) {
        setPlaces(data);
      }
      setIsSearching(false);
    };

    const debounce = setTimeout(searchPlaces, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const addStop = (place) => {
    // Add 15 mins travel time roughly + place duration
    setStops(prev => [
      ...prev,
      {
        id: crypto.randomUUID(), // Temp ID for React key
        place_id: place.id,
        place_name: place.name,
        location_area: place.location_area,
        duration_mins: place.duration_mins || 60,
        notes: ''
      }
    ]);
    setSearchQuery('');
    setPlaces([]);
  };

  const removeStop = (id) => {
    setStops(prev => prev.filter(stop => stop.id !== id));
  };

  const updateStopNotes = (id, notes) => {
    setStops(prev => prev.map(stop => stop.id === id ? { ...stop, notes } : stop));
  };

  const moveStop = (index, direction) => {
    if (
      (direction === -1 && index === 0) || 
      (direction === 1 && index === stops.length - 1)
    ) return;

    const newStops = [...stops];
    const temp = newStops[index];
    newStops[index] = newStops[index + direction];
    newStops[index + direction] = temp;
    setStops(newStops);
  };

  // Calculate times
  const calculateTimes = () => {
    if (!startTime) return [];
    
    let [hours, mins] = startTime.split(':').map(Number);
    let totalMinutes = hours * 60 + mins;

    return stops.map(stop => {
      const arrivalHour = Math.floor(totalMinutes / 60) % 24;
      const arrivalMin = totalMinutes % 60;
      const arrivalStr = `${arrivalHour.toString().padStart(2, '0')}:${arrivalMin.toString().padStart(2, '0')}`;
      
      // Add duration + 15 mins travel gap
      totalMinutes += stop.duration_mins + 15;
      
      return arrivalStr;
    });
  };

  const stopTimes = calculateTimes();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !date || stops.length === 0) {
      setError('Please provide a title, date, and at least one stop.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // 1. Create the plan
      const { data: plan, error: planError } = await supabase
        .from('plans')
        .insert([{
          user_id: user.id,
          title,
          description,
          date,
          start_time: startTime,
          is_public: isPublic
        }])
        .select()
        .single();

      if (planError) throw planError;

      // 2. Add all stops
      const stopInserts = stops.map((stop, index) => ({
        plan_id: plan.id,
        place_id: stop.place_id,
        arrival_time: stopTimes[index], // Pre-calculated start time
        notes: stop.notes,
        order_index: index,
        duration_mins: stop.duration_mins
      }));

      const { error: stopsError } = await supabase
        .from('plan_stops')
        .insert(stopInserts);

      if (stopsError) throw stopsError;

      navigate('/my-plans');
    } catch (err) {
      setError(err.message || 'Failed to save the plan.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-brand-dark">{t('create_plan')}</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Plan Details Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-secondary">
            <h2 className="text-xl font-bold mb-4">Plan Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                  placeholder="e.g. A Day in Al Balad"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none resize-none"
                  placeholder="What's this plan about?"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
                />
                <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                  Make this plan public (visible to community)
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Builder */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-secondary h-full">
            <h2 className="text-xl font-bold mb-4">Itinerary Stops</h2>

            {/* Place Search */}
            <div className="relative mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search to add a place..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-dashed border-gray-300 focus:border-brand-primary focus:border-solid outline-none transition-all"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-brand-primary" size={20} />
                )}
              </div>

              {/* Search Results Dropdown */}
              {places.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  {places.map(place => (
                    <button
                      key={place.id}
                      onClick={() => addStop(place)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 flex justify-between items-center border-b border-gray-50 last:border-0"
                    >
                      <div>
                        <div className="font-semibold text-brand-dark">{place.name}</div>
                        <div className="text-xs text-gray-500">{place.location_area}</div>
                      </div>
                      <Plus className="text-brand-primary" size={20} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Stops List */}
            <div className="space-y-4">
              {stops.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-500">Your itinerary is empty. Search for places to add stops.</p>
                </div>
              ) : (
                stops.map((stop, index) => (
                  <div key={stop.id} className="flex gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50 hover:bg-white hover:shadow-sm transition-all group">
                    <div className="flex flex-col items-center justify-between gap-2 text-gray-400">
                      <button onClick={() => moveStop(index, -1)} className="hover:text-brand-primary" disabled={index === 0}>
                        <GripVertical size={16} />
                      </button>
                      <div className="text-xs font-bold text-brand-primary px-2 bg-brand-primary/10 rounded-full py-1">
                        {index + 1}
                      </div>
                      <button onClick={() => moveStop(index, 1)} className="hover:text-brand-primary" disabled={index === stops.length - 1}>
                        <GripVertical size={16} />
                      </button>
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-brand-dark">{stop.place_name}</h4>
                          <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Clock size={14} />
                            <span dir="ltr">{stopTimes[index]}</span>
                            <span className="mx-2">•</span>
                            <span>{stop.location_area}</span>
                          </div>
                        </div>
                        <button onClick={() => removeStop(stop.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <X size={20} />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={stop.notes}
                        onChange={(e) => updateStopNotes(stop.id, e.target.value)}
                        placeholder="Add personal notes (e.g., 'Try their signature coffee')"
                        className="w-full text-sm bg-transparent border-b border-gray-200 focus:border-brand-primary outline-none pb-1 transition-colors mt-2"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Submit Button */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || stops.length === 0}
                className="w-full bg-brand-primary text-white py-3.5 rounded-xl font-bold hover:bg-amber-800 transition-all shadow-md flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Save Jadwal'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CreateJadwal;
