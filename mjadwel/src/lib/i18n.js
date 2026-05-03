import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "app_title": "Mjadwel",
      "home_title": "Plan Your Weekend Easily",
      "home_subtitle": "Save the effort of searching for places. Discover new schedules or get inspired by others.",
      "explore_places": "Explore Places",
      "start_planning": "Start Planning Now",
      "popular_places": "Popular Places",
      "login": "Login",
      "register": "Sign Up",
      "logout": "Logout",
      "my_plans": "My Plans",
      "explore": "Explore",
      "language": "العربية",
      "places": "Places",
      "create_plan": "Create Jadwal",
      "search_places": "Search for cafes, restaurants, beaches...",
      "all_categories": "All",
      "category_cafe": "Cafes",
      "category_restaurant": "Restaurants",
      "category_sea": "Sea & Beaches",
      "category_culture": "Culture & Heritage",
      "category_entertainment": "Entertainment",
      "submit_place": "Suggest a Place",
      "add_to_plan": "Add to Plan",
      "duration": "Duration",
      "mins": "mins",
      "no_places_found": "No places found matching your search."
    }
  },
  ar: {
    translation: {
      "app_title": "مجدول",
      "home_title": "سهلنا عليك جدول الويكند",
      "home_subtitle": "وفّرنا عليك جهد البحث عن الجداول والأماكن الجديدة - اكتشف وجهّز جدولك، أو استلهم من جداول غيرك.",
      "explore_places": "تصفح الأماكن",
      "start_planning": "ابدأ جدولك الآن",
      "popular_places": "الأماكن الرائجة",
      "login": "تسجيل الدخول",
      "register": "إنشاء حساب",
      "logout": "تسجيل خروج",
      "my_plans": "جداولي",
      "explore": "المجتمع",
      "language": "English",
      "places": "الأماكن",
      "create_plan": "جدول جديد",
      "search_places": "ابحث عن مقاهي، مطاعم، شواطئ...",
      "all_categories": "الكل",
      "category_cafe": "مقاهي",
      "category_restaurant": "مطاعم",
      "category_sea": "بحر وشواطئ",
      "category_culture": "ثقافة وتراث",
      "category_entertainment": "ترفيه",
      "submit_place": "اقتراح مكان",
      "add_to_plan": "أضف للجدول",
      "duration": "المدة",
      "mins": "دقيقة",
      "no_places_found": "لم يتم العثور على أماكن تطابق بحثك."
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "ar", // Default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
