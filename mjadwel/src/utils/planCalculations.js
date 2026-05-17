export const detectDayBreaks = (stops) =>
  stops.reduce((acc, stop, i) => {
    if (i === 0) return [1];
    const prev = stops[i - 1].arrival_time ?? '00:00';
    const curr = stop.arrival_time         ?? '00:00';
    return [...acc, curr < prev ? acc[i - 1] + 1 : acc[i - 1]];
  }, []);

export const computeTotalMinutes = (stops) =>
  stops.reduce((s, st) => s + (st.duration_mins ?? 0), 0);
