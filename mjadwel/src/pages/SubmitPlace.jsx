import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { submitPlace } from '../services/placeService';
import { uploadPlaceImage } from '../services/fileService';
import { Loader2, Upload, X } from 'lucide-react';

const SubmitPlace = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [isSubmitting,   setIsSubmitting]   = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview,   setImagePreview]   = useState('');

  const [formData, setFormData] = useState({
    name: '', category: 'category_cafe', description: '',
    location_area: '', duration_mins: 60, image_url: '', maps_url: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('الملف المختار ليس صورة'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('حجم الصورة يجب أن يكون أقل من 5MB'); return; }

    setUploadingImage(true);
    setImagePreview(URL.createObjectURL(file));
    try {
      const publicUrl = await uploadPlaceImage(file);
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
    } catch {
      toast.error('فشل رفع الصورة. تأكد من إعداد bucket باسم "place-images" في Supabase Storage.');
      setImagePreview('');
    } finally {
      setUploadingImage(false);
    }
  };

  const clearImage = () => {
    setImagePreview('');
    setFormData(prev => ({ ...prev, image_url: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.location_area) {
      toast.error('اسم المكان والحي مطلوبان');
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await submitPlace(formData, user.id);
      if (error) throw error;
      toast.success('تم إرسال المكان بنجاح ✓');
      navigate('/places');
    } catch (err) {
      toast.error(err.message || 'حدث خطأ أثناء الإرسال. حاول مجددًا.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-brand-secondary p-8">
        <h1 className="text-2xl font-bold text-brand-dark mb-2">{t('submit_place')}</h1>
        <p className="text-gray-500 mb-8">اقترح مكانًا جديدًا ليُضاف إلى مكتبة مجدول.</p>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">اسم المكان</label>
            <input
              type="text" name="name" value={formData.name} onChange={handleChange}
              className="w-full ps-4 pe-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
              placeholder="مثال: البلد التاريخي" required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">التصنيف</label>
              <select
                name="category" value={formData.category} onChange={handleChange}
                className="w-full ps-4 pe-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all bg-white"
              >
                <option value="category_cafe">{t('category_cafe')}</option>
                <option value="category_restaurant">{t('category_restaurant')}</option>
                <option value="category_sea">{t('category_sea')}</option>
                <option value="category_culture">{t('category_culture')}</option>
                <option value="category_entertainment">{t('category_entertainment')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الحي أو المنطقة</label>
              <input
                type="text" name="location_area" value={formData.location_area} onChange={handleChange}
                className="w-full ps-4 pe-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                placeholder="مثال: أبحر" required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">وصف المكان</label>
            <textarea
              name="description" value={formData.description} onChange={handleChange}
              rows="3"
              className="w-full ps-4 pe-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all resize-none"
              placeholder="وصف مختصر عن المكان..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">المدة التقريبية (دقيقة)</label>
            <input
              type="number" name="duration_mins" value={formData.duration_mins} onChange={handleChange}
              min="15" step="15"
              className="w-full ps-4 pe-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              صورة المكان
              <span className="text-gray-400 font-normal ms-1">(اختياري)</span>
            </label>

            {imagePreview || formData.image_url ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                <img
                  src={imagePreview || formData.image_url}
                  alt="preview"
                  className="w-full h-48 object-cover"
                />
                <button
                  type="button" onClick={clearImage}
                  className="absolute top-2 end-2 bg-white/90 text-gray-600 hover:text-red-500 p-1.5 rounded-full shadow-sm transition-colors"
                >
                  <X size={14} />
                </button>
                {uploadingImage && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                    <Loader2 className="animate-spin text-brand-primary" size={28} />
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-brand-primary/40 hover:bg-brand-secondary/10 transition-all"
              >
                {uploadingImage ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="animate-spin text-brand-primary" size={28} />
                    <p className="text-sm text-gray-400">جاري رفع الصورة...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-brand-secondary/50 flex items-center justify-center">
                      <Upload size={20} className="text-brand-primary" />
                    </div>
                    <p className="text-sm font-semibold text-brand-dark">ارفع صورة من جهازك</p>
                    <p className="text-xs text-gray-400">PNG, JPG, WEBP — حتى 5MB</p>
                  </div>
                )}
              </div>
            )}

            <input
              ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
            />

            {!imagePreview && !formData.image_url && (
              <>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400">أو أدخل رابط صورة</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
                <input
                  type="url" name="image_url" value={formData.image_url} onChange={handleChange}
                  className="mt-3 w-full ps-4 pe-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all text-sm"
                  placeholder="https://..." dir="ltr"
                />
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رابط Google Maps
              <span className="text-gray-400 font-normal ms-1">(اختياري)</span>
            </label>
            <div className="relative">
              <input
                type="url" name="maps_url" value={formData.maps_url} onChange={handleChange}
                className="w-full ps-10 pe-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-300 outline-none transition-all text-sm"
                placeholder="https://maps.google.com/..." dir="ltr"
              />
              <svg
                className="absolute top-1/2 -translate-y-1/2 start-3 text-blue-400 pointer-events-none"
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">
              انسخ الرابط من Google Maps — سيظهر كزر "خريطة" على بطاقة المكان.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit" disabled={isSubmitting || uploadingImage}
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
