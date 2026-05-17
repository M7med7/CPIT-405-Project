const DRAFT_KEY = 'mjadwel_planner_draft';

export const saveDraft  = (state) => { try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(state)); } catch {} };
export const loadDraft  = ()      => { try { return JSON.parse(sessionStorage.getItem(DRAFT_KEY)); } catch { return null; } };
export const clearDraft = ()      => { try { sessionStorage.removeItem(DRAFT_KEY); } catch {} };
