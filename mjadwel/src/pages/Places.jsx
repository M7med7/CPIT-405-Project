import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlaces } from '../hooks/usePlaces';
import { Search, MapPin, Clock, Plus, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  { id: 'all', labelKey: 'all_categories' },
  { id: 'category_cafe', labelKey: 'category_cafe' },
  { id: 'category_restaurant', labelKey: 'category_restaurant' },
  { id: 'category_sea', labelKey: 'category_sea' },
  { id: 'category_culture', labelKey: 'category_culture' },
  { id: 'category_entertainment', labelKey: 'category_entertainment' }
];

const Places = () => {
  const { t } = useTranslation();
  const { places, loading } = usePlaces();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredPlaces = useMemo(() => {
    return places.filter(place => {
      const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            place.location_area.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || place.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [places, searchQuery, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark mb-2">{t('places')}</h1>
          <p className="text-gray-500">Discover and save the best spots in Jeddah.</p>
        </div>
        
        <Link 
          to="/places/submit" 
          className="bg-brand-primary text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-amber-800 transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          {t('submit_place')}
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-brand-secondary mb-8">
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder={t('search_places')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id 
                  ? 'bg-brand-dark text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t(category.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Places Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-brand-primary" size={40} />
        </div>
      ) : filteredPlaces.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-brand-secondary">
          <p className="text-gray-500 text-lg">{t('no_places_found')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlaces.map(place => (
            <div key={place.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 group">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={place.image_url} 
                  alt={place.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-brand-primary shadow-sm">
                  {t(place.category)}
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="text-lg font-bold text-brand-dark mb-1 line-clamp-1">{place.name}</h3>
                
                <div className="flex items-center text-sm text-gray-500 mb-3 gap-4">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span>{place.location_area}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{place.duration_mins} {t('mins')}</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {place.description}
                </p>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex gap-2">
                    {place.tags?.slice(0, 2).map(tag => (
                      <span key={tag} className="text-xs bg-brand-secondary/50 text-brand-dark px-2 py-1 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <button className="text-brand-primary hover:bg-brand-primary/10 p-2 rounded-full transition-colors" title={t('add_to_plan')}>
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Places;
