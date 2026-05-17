# CPIT-405-Project

# Mjadwel
A community-driven day-planning app for Jeddah. Build your weekend itinerary, share it with friends, or browse plans created by locals who know the city.

**Live:** [mjadwel-v7c8.vercel.app](https://mjadwel-v7c8.vercel.app)

---

## Features

- **Plan Builder** : Multi-day itinerary builder with arrival time calculations and stop notes
- **Places Library** : Curated places across 5 categories: cafes, restaurants, beaches, culture, entertainment
- **Explore** : Browse and copy public plans from the community
- **Weather Widget** : Live Jeddah weather for your plan date
- **Auth** : Email/password sign-up and login
- **Bilingual** : Full Arabic / English UI with RTL support

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS v4 |
| Backend | Supabase (Auth, Postgres, Storage) |
| Routing | React Router v7 |
| i18n | i18next + react-i18next |
| Icons | Lucide React |
| Weather | OpenWeather API |
| Deployment | Vercel |

---

## Project Structure

```
src/
├── components/          # Shared UI components
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   └── ProtectedRoute.jsx
│   └── WeatherWidget.jsx
├── context/
│   └── AuthContext.jsx
├── hooks/               # Custom data hooks
│   ├── usePlaces.js
│   ├── useCommunityPlans.js
│   ├── usePublicPlans.js
│   ├── useMyPlans.js
│   ├── usePlanDetails.js
│   ├── useExplorerPlans.js
│   ├── useWeather.js
│   └── ...
├── services/            # All external calls (Supabase, APIs)
│   ├── planService.js
│   ├── placeService.js
│   ├── weatherService.js
│   ├── fileService.js
│   └── ...
├── utils/               # Pure functions and constants
│   ├── categoryUtils.js
│   ├── planTransform.js
│   ├── plannerUtils.js
│   └── planCalculations.js
├── pages/
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Places.jsx
│   ├── Explore.jsx
│   ├── SubmitPlace.jsx
│   └── plans/
│       ├── CreateJadwal.jsx
│       ├── MyPlans.jsx
│       └── PlanDetails.jsx
└── lib/
    ├── supabaseClient.js
    └── i18n.js
```

---

## Run Locally

```bash
git clone https://github.com/iazizlo/Mjadwel.git
cd Mjadwel/mjadwel
npm install
npm run dev
```

---



## Database Schema

| Table | Description |
|---|---|
| `profiles` | User profiles linked to Supabase auth |
| `places` | Place library (name, category, area, image, maps link) |
| `plans` | User itineraries (title, date, visibility) |
| `plan_stops` | Stops within a plan with arrival time and duration |

---

## Team Members

|  Member 1       |  Member 2    |  Member 3 |
| ------------------- | ---------------- | ------------- |
| Abdulaziz Almutairi | Mohammed Alharbi | Ali Alghamdi  |
