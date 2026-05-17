import { useState, useMemo } from 'react';
import { usePlaces } from '../hooks/usePlaces';
import { Search, Clock, Plus, Map, Coffee, Waves, Landmark, Utensils, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

/* ── Category config ───────────────────────────────────────── */
const CATEGORY_META = {
  category_cafe:          { label: 'مقاهي',   Icon: Coffee,   bg: '#c9b99a', fg: '#7a5c38' },
  category_sea:           { label: 'شواطئ',   Icon: Waves,    bg: '#8fb3c4', fg: '#2f6a80' },
  category_culture:       { label: 'تاريخية', Icon: Landmark, bg: '#c9a088', fg: '#8a4a30' },
  category_restaurant:    { label: 'مطاعم',   Icon: Utensils, bg: '#a4b48a', fg: '#4a6a30' },
  category_entertainment: { label: 'ترفيه',   Icon: Star,     bg: '#a4a4b4', fg: '#4a4a6a' },
};

const FILTER_CATS = [
  { id: 'all',                    label: 'الكل',    Icon: null      },
  { id: 'category_cafe',          label: 'مقاهي',   Icon: Coffee    },
  { id: 'category_restaurant',    label: 'مطاعم',   Icon: Utensils  },
  { id: 'category_sea',           label: 'شواطئ',   Icon: Waves     },
  { id: 'category_culture',       label: 'تاريخية', Icon: Landmark  },
  { id: 'category_entertainment', label: 'ترفيه',   Icon: Star      },
];

const DIAMOND = `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0 L40 20 L20 40 L0 20 Z' fill='none' stroke='rgba(255,255,255,0.18)' stroke-width='1'/%3E%3C/svg%3E")`;

/* ── PlaceCard ─────────────────────────────────────────────── */
const PlaceCard = ({ place, rank, featured }) => {
  const navigate = useNavigate();
  const meta = CATEGORY_META[place.category] ?? { label: '', Icon: Star, bg: '#bbb', fg: '#666' };
  const { Icon, bg, fg } = meta;

  const mapsUrl = place.maps_url ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.location_area + ' جدة')}`;

  return (
    <div className={`
      rounded-2xl overflow-hidden border border-brand-secondary/40 bg-white
      hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group flex flex-col
      ${featured ? 'lg:row-span-2' : ''}
    `}>

      {/* ── Image / placeholder ── */}
      <div
        className={`relative shrink-0 overflow-hidden ${
          featured ? 'h-44 sm:h-52 lg:h-[280px]' : 'h-36 sm:h-40'
        }`}
        style={place.image_url ? {} : { backgroundColor: bg, backgroundImage: DIAMOND, backgroundSize: '40px 40px' }}
      >
        {place.image_url ? (
          <img
            src={place.image_url}
            alt={place.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon size={featured ? 52 : 36} className="text-white/30" strokeWidth={1} />
          </div>
        )}

        {/* Gradient overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Category badge — top start */}
        <div className="absolute top-3 start-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
          <Icon size={10} style={{ color: fg }} strokeWidth={2} />
          <span className="text-[10px] font-bold" style={{ color: fg }}>{meta.label}</span>
        </div>

        {/* Duration badge — top end */}
        <div className="absolute top-3 end-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
          <Clock size={10} className="text-white/80" />
          <span className="text-[10px] font-semibold text-white">{place.duration_mins} د</span>
        </div>

        {/* Rank — bottom start */}
        <span className="absolute bottom-3 start-3 text-white/50 text-[10px] font-black tracking-[0.2em]">
          #{rank}
        </span>

        {/* Location — bottom end */}
        <span className="absolute bottom-3 end-3 text-white/80 text-[10px] font-semibold bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full">
          {place.location_area}
        </span>
      </div>

      {/* ── Info ── */}
      <div className="flex flex-col flex-1 p-3 gap-2">

        {/* Name */}
        <h3 className={`font-black text-brand-dark leading-snug text-end ${
          featured ? 'text-lg sm:text-xl' : 'text-sm'
        }`}>
          {place.name}
        </h3>

        {/* Description */}
        <p className={`text-xs text-gray-400 leading-relaxed text-end ${featured ? 'line-clamp-3' : 'line-clamp-2'}`}>
          {place.description}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto pt-1">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 active:bg-blue-200 transition-colors shrink-0"
          >
            <Map size={12} />
            خريطة
          </a>
          <button
            onClick={() => navigate('/create-jadwal', { state: { preselect: place } })}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-dark text-white hover:bg-brand-dark/80 active:scale-[0.97] transition-all"
          >
            <Plus size={12} />
            أضف للجدول
          </button>
        </div>

      </div>
    </div>
  );
};

/* ── Places Page ───────────────────────────────────────────── */
const Places = () => {
  const { places, loading }                          = usePlaces();
  const [searchQuery, setSearchQuery]                = useState('');
  const [selectedCategory, setSelectedCategory]      = useState('all');

  const filteredPlaces = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return places.filter(place => {
      const matchSearch =
        place.name.toLowerCase().includes(q) ||
        place.location_area.toLowerCase().includes(q) ||
        (place.description ?? '').toLowerCase().includes(q);
      return matchSearch && (selectedCategory === 'all' || place.category === selectedCategory);
    });
  }, [places, searchQuery, selectedCategory]);

  const catCounts = useMemo(() => {
    const c = { all: places.length };
    places.forEach(p => { c[p.category] = (c[p.category] ?? 0) + 1; });
    return c;
  }, [places]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="mb-7 sm:mb-9">
        <p className="text-[11px] font-bold tracking-[0.18em] text-gray-400 uppercase mb-2">
          PLACE LIBRARY — مكتبة الأماكن
        </p>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-brand-dark leading-snug mb-5">
          اكتشف أماكن جدة
        </h1>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="ابحث باسم مكان أو حي..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pe-4 ps-11 py-3 rounded-2xl bg-white border border-brand-secondary/60 text-sm placeholder-gray-400 focus:outline-none focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/10 transition-all"
            />
            <Search size={16} className="absolute top-1/2 -translate-y-1/2 start-4 text-gray-400 pointer-events-none" />
          </div>
          <Link
            to="/places/submit"
            className="flex items-center gap-1.5 bg-brand-dark text-white px-4 py-3 rounded-2xl text-sm font-semibold hover:bg-brand-dark/80 transition-colors shrink-0"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">اقترح مكانًا</span>
            <span className="sm:hidden">اقترح</span>
          </Link>
        </div>
      </div>

      {/* ── Filter pills ────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 mb-5">
        {FILTER_CATS.map(cat => {
          const count  = catCounts[cat.id] ?? 0;
          const active = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all shrink-0 ${
                active
                  ? 'bg-brand-dark text-white shadow-sm'
                  : 'bg-white border border-brand-secondary/60 text-gray-600 hover:border-brand-dark/30'
              }`}
            >
              {cat.Icon && <cat.Icon size={11} className={active ? 'text-white/70' : 'text-gray-400'} strokeWidth={1.5} />}
              <span>{cat.label}</span>
              <span className={`text-[10px] tabular-nums ${active ? 'text-white/60' : 'text-gray-400'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* ── Results count ───────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-gray-400">رُتّب: الأكثر شعبية</span>
        <span className="text-sm font-bold text-brand-dark">{filteredPlaces.length} مكان</span>
      </div>

      {/* ── Grid ────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`bg-brand-secondary/30 rounded-2xl animate-pulse ${i === 0 ? 'h-[420px] lg:row-span-2' : 'h-64'}`} />
          ))}
        </div>
      ) : filteredPlaces.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-3 bg-white rounded-2xl border border-brand-secondary/50">
          <p className="text-2xl">🔍</p>
          <p className="text-gray-500 font-semibold">لم يتم العثور على أماكن</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="text-brand-primary text-sm font-semibold hover:underline mt-1"
          >
            مسح الفلتر
          </button>
        </div>
      ) : (
        <div className="places-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlaces.map((place, i) => (
            <PlaceCard key={place.id} place={place} rank={i + 1} featured={i === 0} />
          ))}
        </div>
      )}

    </div>
  );
};

export default Places;
