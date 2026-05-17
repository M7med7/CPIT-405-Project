export const DAY_NAMES = [
  'اليوم الأول', 'اليوم الثاني', 'اليوم الثالث',
  'اليوم الرابع', 'اليوم الخامس',
];

export const getDayLabel = (n) => DAY_NAMES[n - 1] ?? `اليوم ${n}`;

export const uid = () =>
  typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

export const pad = (n) => String(n).padStart(2, '0');

export const timeToMins = (time) =>
  time.split(':').map(Number).reduce((a, v, i) => a + v * (i === 0 ? 60 : 1), 0);

export const minsToTime = (total) =>
  `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}`;

export const addMins = (time, mins) => minsToTime(timeToMins(time) + mins);
