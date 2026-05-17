import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Mail, Lock, Loader2 } from 'lucide-react';

const Login = () => {
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [isSubmitting,setIsSubmitting]= useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (user) return <Navigate to="/places" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error(t('fill_all_fields')); return; }
    setIsSubmitting(true);
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      navigate('/places');
    } catch (err) {
      toast.error(err.message || t('fill_all_fields'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 border border-brand-secondary">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-dark mb-2">{t('login')}</h1>
          <p className="text-gray-500">{t('welcome_back')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('email_label')}</label>
            <div className="relative">
              <Mail className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full ps-10 pe-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                placeholder="you@example.com"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('password_label')}</label>
            <div className="relative">
              <Lock className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full ps-10 pe-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                placeholder="••••••••"
                dir="ltr"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-primary text-white py-3 rounded-xl font-semibold hover:bg-amber-800 transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : t('login')}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-gray-600">
          {t('no_account')}{' '}
          <Link to="/register" className="text-brand-primary font-semibold hover:underline">
            {t('register')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
