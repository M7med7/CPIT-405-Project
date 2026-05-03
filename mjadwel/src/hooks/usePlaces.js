import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// Mock data in case DB is empty for demo purposes
const MOCK_PLACES = [
  {
    id: '1',
    name: 'Al Balad (Historical Jeddah)',
    category: 'category_culture',
    description: 'Explore the ancient heart of Jeddah with its unique coral architecture, bustling souks, and historic mosques.',
    location_area: 'Al Balad',
    duration_mins: 180,
    image_url: 'https://images.unsplash.com/photo-1583416750470-965b2707b355?q=80&w=800&auto=format&fit=crop',
    tags: ['heritage', 'walking', 'shopping'],
  },
  {
    id: '2',
    name: 'Jeddah Corniche',
    category: 'category_sea',
    description: 'A beautiful waterfront stretching along the Red Sea, featuring the iconic King Fahd Fountain, parks, and restaurants.',
    location_area: 'Ash Shati',
    duration_mins: 120,
    image_url: 'https://images.unsplash.com/photo-1621683285744-8df606ac2fb3?q=80&w=800&auto=format&fit=crop',
    tags: ['sea', 'family', 'sunset'],
  },
  {
    id: '3',
    name: 'Brew92',
    category: 'category_cafe',
    description: 'A popular local specialty coffee roastery and cafe known for its cozy atmosphere and excellent brews.',
    location_area: 'Ar Rawdah',
    duration_mins: 60,
    image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop',
    tags: ['coffee', 'friends', 'cozy'],
  },
  {
    id: '4',
    name: 'Al Nakheel Restaurant',
    category: 'category_restaurant',
    description: 'Traditional Hijazi cuisine served in a beautiful open-air setting near the sea.',
    location_area: 'North Corniche',
    duration_mins: 90,
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop',
    tags: ['food', 'traditional', 'dinner'],
  }
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

        // Use mock data if table is empty
        if (!data || data.length === 0) {
          setPlaces(MOCK_PLACES);
        } else {
          setPlaces(data);
        }
      } catch (err) {
        console.error("Error fetching places:", err);
        setError(err.message);
        // Fallback to mock on error to keep UI beautiful for the presentation
        setPlaces(MOCK_PLACES); 
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, []);

  return { places, loading, error };
};
