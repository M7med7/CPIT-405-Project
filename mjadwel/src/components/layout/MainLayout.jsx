import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const MainLayout = () => {
  const { i18n } = useTranslation();

  // Ensure document direction matches language on mount
  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {/* Footer can go here later */}
    </div>
  );
};

export default MainLayout;
