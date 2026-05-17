import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import cornicheImg from '../assets/jeddah_corniche.jpg';

const MOCK_PLACES = [
  {
    id: '1',
    name: 'كافية Mooma',
    category: 'category_cafe',
    description: 'مقهى متخصص يقدم أجود أنواع القهوة المحمصة في أجواء هادئة ومريحة بحي الزهراء.',
    location_area: 'حي الزهراء',
    duration_mins: 60,
    image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop',
    tags: ['قهوة', 'أصدقاء', 'هادئ'],
  },
  {
    id: '2',
    name: 'نادي البخوت',
    category: 'category_sea',
    description: 'نادي بحري راقٍ على شاطئ جدة يقدم تجربة فريدة على الماء مع إطلالة رائعة.',
    location_area: 'الشاطئ',
    duration_mins: 120,
    image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop',
    tags: ['بحر', 'عائلة', 'غروب'],
  },
  {
    id: '3',
    name: 'مقهى Chino',
    category: 'category_cafe',
    description: 'مقهى عصري بطابع آسيوي يقدم مشروبات مميزة وأجواء مريحة في الروضة.',
    location_area: 'الروضة',
    duration_mins: 60,
    image_url: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?q=80&w=800&auto=format&fit=crop',
    tags: ['قهوة', 'عصري', 'هادئ'],
  },
  {
    id: '4',
    name: 'Melt Ground',
    category: 'category_restaurant',
    description: 'مطعم متخصص بالتجارب الغذائية المبتكرة والأطباق الإبداعية في البرجي.',
    location_area: 'البرجي',
    duration_mins: 90,
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop',
    tags: ['طعام', 'عصري', 'عشاء'],
  },
  {
    id: '5',
    name: 'البلد التاريخية',
    category: 'category_culture',
    description: 'قلب جدة العريق بعمارته المرجانية الفريدة وأسواقه الشعبية ومساجده التاريخية.',
    location_area: 'البلد',
    duration_mins: 180,
    image_url: 'https://images.unsplash.com/photo-1583416750470-965b2707b355?q=80&w=800&auto=format&fit=crop',
    tags: ['تراث', 'مشي', 'تسوق'],
  },
  {
    id: '6',
    name: 'كورنيش جدة',
    category: 'category_sea',
    description: 'واجهة بحرية جميلة تمتد على البحر الأحمر مع نافورة الملك فهد الشهيرة.',
    location_area: 'الكورنيش',
    duration_mins: 120,
    image_url: cornicheImg,
    tags: ['بحر', 'عائلة', 'غروب'],
  },
  {
    id: '7',
    name: 'Brew92',
    category: 'category_cafe',
    description: 'محمصة قهوة محلية شهيرة تعرف بأجوائها المريحة وقهوتها المميزة.',
    location_area: 'الروضة',
    duration_mins: 60,
    image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop',
    tags: ['قهوة', 'أصدقاء', 'مريح'],
  },
];

export const usePlaces = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('places')
          .select('*')
          .order('name');

        if (error) throw error;

        if (!data || data.length === 0) {
          setPlaces(MOCK_PLACES);
        } else {
          setPlaces(data);
        }
      } catch (err) {
        console.error('Error fetching places:', err);
        setError(err.message);
        setPlaces(MOCK_PLACES);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, []);

  return { places, loading, error };
};
