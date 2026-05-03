import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tighter text-brand-dark">MJADWEL</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-4">
              <Link to="/places" className="text-gray-600 hover:text-brand-primary transition-colors">
                {t('places')}
              </Link>
              <Link to="/explore" className="text-gray-600 hover:text-brand-primary transition-colors">
                {t('explore')}
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand-primary transition-colors px-3 py-2 rounded-full hover:bg-gray-50"
            >
              <Globe size={18} />
              <span>{t('language')}</span>
            </button>
            
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/create-jadwal" className="text-sm font-medium text-brand-primary hover:text-amber-800 transition-colors">
                  {t('create_plan')}
                </Link>
                <div className="h-4 w-px bg-gray-200"></div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors text-sm font-medium"
                >
                  <LogOut size={18} />
                  <span>{t('logout')}</span>
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-brand-primary font-medium text-sm transition-colors">
                  {t('login')}
                </Link>
                <Link to="/register" className="bg-brand-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-amber-800 transition-colors">
                  {t('register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
