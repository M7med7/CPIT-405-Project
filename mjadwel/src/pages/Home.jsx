import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Compass, CalendarPlus, MapPin } from 'lucide-react';
import { usePlaces } from '../hooks/usePlaces';

const Home = () => {
  const { t } = useTranslation();
  const { places, loading } = usePlaces();
  
  // Show only up to 3 places on the home page
  const popularPlaces = places.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-6xl font-bold text-brand-dark mb-6 leading-tight">
          {t('home_title')}
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed">
          {t('home_subtitle')}
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            to="/create-jadwal" 
            className="flex items-center justify-center gap-2 bg-brand-primary text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-amber-800 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <CalendarPlus size={24} />
            <span>{t('start_planning')}</span>
          </Link>
          <Link 
            to="/places" 
            className="flex items-center justify-center gap-2 bg-white text-brand-primary border-2 border-brand-primary px-8 py-4 rounded-full text-lg font-semibold hover:bg-orange-50 transition-colors"
          >
            <Compass size={24} />
            <span>{t('explore_places')}</span>
          </Link>
        </div>
      </div>

      <div className="bg-brand-secondary/30 rounded-3xl p-8 md:p-12 border border-brand-secondary">
        <h2 className="text-2xl font-bold mb-8 text-center">{t('popular_places')}</h2>
        
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {popularPlaces.map(place => (
              <div key={place.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="h-40 overflow-hidden">
                  <img src={place.image_url} alt={place.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-brand-dark mb-1">{place.name}</h3>
                  <div className="flex items-center text-sm text-gray-500 gap-1">
                    <MapPin size={14} />
                    <span>{place.location_area}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="text-center mt-8">
          <Link to="/places" className="text-brand-primary font-semibold hover:underline">
            {t('explore_places')} &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
