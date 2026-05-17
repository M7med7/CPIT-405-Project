import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUserPlanCount } from '../../hooks/useUserPlanCount';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAr      = i18n.language === 'ar';
  const planCount = useUserPlanCount(user?.id);

  const toggleLanguage = () => {
    const newLang = isAr ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.documentElement.dir  = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const handleLogout = async () => {
    await signOut();
    setMobileOpen(false);
    navigate('/');
  };

  const isActive   = (path) => location.pathname === path;
  const closeMobile = () => setMobileOpen(false);

  const navLinks = [
    { path: '/',              label: t('home_page') },
    { path: '/places',        label: t('places')    },
    { path: '/create-jadwal', label: t('planner')   },
    { path: '/explore',       label: t('explore')   },
  ];

  return (
    <div className="sticky top-0 z-50 px-4 sm:px-6 pt-4 pb-2 pointer-events-none">
      <div
        className={`
          max-w-5xl mx-auto bg-white/88 backdrop-blur-xl border border-brand-secondary/60
          shadow-lg shadow-black/[0.06] pointer-events-auto overflow-hidden
          transition-[border-radius] duration-200
          ${mobileOpen ? 'rounded-3xl' : 'rounded-full'}
        `}
      >
        <div className="px-4 flex justify-between items-center h-12">

          <Link to="/" onClick={closeMobile} className="shrink-0">
            <img src="/Logo.png" alt="Mjadwel" className="h-7 sm:h-8 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isActive(link.path)
                    ? 'bg-brand-dark text-brand-light'
                    : 'text-gray-500 hover:text-brand-dark hover:bg-brand-secondary/60'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {user && (
              <Link
                to="/my-plans"
                className="hidden sm:flex items-center gap-1.5 bg-brand-secondary/70 text-brand-dark px-3 py-1.5 rounded-full text-sm font-semibold hover:bg-brand-secondary transition-colors"
              >
                <span>{t('my_jadwals')}</span>
                <span className="bg-brand-dark text-brand-light text-xs px-1.5 py-0.5 rounded-full leading-none">
                  {planCount ?? '…'}
                </span>
              </Link>
            )}

            <button
              onClick={toggleLanguage}
              className="flex items-center gap-0.5 bg-brand-secondary/60 text-brand-dark px-2.5 sm:px-3 py-1.5 rounded-full text-sm font-semibold hover:bg-brand-secondary transition-colors"
            >
              <span className={isAr ? 'text-brand-dark' : 'text-gray-400'}>ع</span>
              <span className="text-gray-300 mx-0.5">-</span>
              <span className={!isAr ? 'text-brand-dark' : 'text-gray-400'}>E</span>
            </button>

            {!user && (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm text-gray-500 hover:text-brand-primary font-medium px-3 py-1.5 rounded-full hover:bg-brand-secondary/40 transition-colors"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="bg-brand-primary text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-amber-800 transition-colors shadow-sm"
                >
                  {t('register')}
                </Link>
              </div>
            )}

            {user && (
              <button
                onClick={handleLogout}
                className="hidden md:flex p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                title={t('logout')}
              >
                <LogOut size={16} />
              </button>
            )}

            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden p-1.5 rounded-full text-gray-600 hover:bg-brand-secondary/50 transition-colors"
              aria-label="القائمة"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-brand-secondary/40 px-3 py-3 flex flex-col gap-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={closeMobile}
                className={`px-4 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                  isActive(link.path)
                    ? 'bg-brand-dark text-white'
                    : 'text-gray-600 hover:bg-brand-secondary/50'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="border-t border-brand-secondary/30 mt-2 pt-2 flex flex-col gap-1">
              {user ? (
                <>
                  <Link
                    to="/my-plans"
                    onClick={closeMobile}
                    className="px-4 py-2.5 rounded-2xl text-sm font-medium text-gray-600 hover:bg-brand-secondary/50 flex items-center justify-between"
                  >
                    <span>{t('my_jadwals')}</span>
                    <span className="bg-brand-dark text-white text-xs px-2 py-0.5 rounded-full">{planCount ?? '…'}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2.5 rounded-2xl text-sm font-medium text-red-500 hover:bg-red-50 text-start"
                  >
                    {t('logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={closeMobile}
                    className="px-4 py-2.5 rounded-2xl text-sm font-medium text-gray-600 hover:bg-brand-secondary/50"
                  >
                    {t('login')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobile}
                    className="px-4 py-2.5 rounded-2xl text-sm font-bold bg-brand-primary text-white text-center hover:bg-amber-800 transition-colors"
                  >
                    {t('register')}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
