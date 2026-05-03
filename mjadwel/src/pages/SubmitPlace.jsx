import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const SubmitPlace = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'category_cafe',
    description: '',
    location_area: '',
    duration_mins: 60,
    image_url: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.location_area) {
      setError('Name and Location Area are required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const { error: submitError } = await supabase
        .from('places')
        .insert([{
          ...formData,
          duration_mins: parseInt(formData.duration_mins, 10),
          created_by: user.id
        }]);

      if (submitError) throw submitError;
      
      navigate('/places');
    } catch (err) {
      setError(err.message || 'Failed to submit place. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-brand-secondary p-8">
        <h1 className="text-2xl font-bold text-brand-dark mb-2">{t('submit_place')}</h1>
        <p className="text-gray-500 mb-8">Suggest a new place to be added to the Mjadwel library.</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Place Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
              placeholder="e.g. Al Balad"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all bg-white"
              >
                <option value="category_cafe">{t('category_cafe')}</option>
                <option value="category_restaurant">{t('category_restaurant')}</option>
                <option value="category_sea">{t('category_sea')}</option>
                <option value="category_culture">{t('category_culture')}</option>
                <option value="category_entertainment">{t('category_entertainment')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location Area</label>
              <input
                type="text"
                name="location_area"
                value={formData.location_area}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                placeholder="e.g. Obhur"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all resize-none"
              placeholder="Short description about the place..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Duration (mins)</label>
              <input
                type="number"
                name="duration_mins"
                value={formData.duration_mins}
                onChange={handleChange}
                min="15"
                step="15"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                placeholder="https://..."
                dir="ltr"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-primary text-white py-3 rounded-xl font-semibold hover:bg-amber-800 transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : t('submit_place')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitPlace;
