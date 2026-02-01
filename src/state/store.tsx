import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import {
  CURRENT_USER_ID,
  DEMO_EVENTS,
  DEMO_PLACES,
  DEMO_RECS,
  type Event,
  type Place,
} from '../data/demo';
import { fetchRecommendations, type GeminiRecItem, type MemorySummary } from '../services/gemini';
import { loadProfile, saveProfile, type StoredProfile } from '../services/storage';

// ——— Civic points rules (hardcoded)
const POINTS_JOIN_EVENT = (e: Event) => e.pointsReward;
const POINTS_CHECKIN_LOCAL = 5;
const POINTS_REVIEW = 3;
const BADGES = [
  { threshold: 50, label: 'Local Supporter' },
  { threshold: 100, label: 'Cleanup Crew' },
  { threshold: 200, label: 'Community Builder' },
];

export type ProfilePrefs = {
  vibe?: 'chill' | 'party' | 'quiet' | 'outdoors';
  budget?: 'low' | 'med' | 'high';
  categories?: string[];
};

type ProfileState = {
  civicPoints: number;
  prefs: ProfilePrefs;
  joinedEventIds: string[];
  memoryCounters: Record<string, number>;
  tagCounts: Record<string, number>;
  lastChosenPlaceIds: string[];
  lastGeminiRecs: GeminiRecItem[] | null;
  loadingRecs: boolean;
  recsError: string | null;
};

const defaultProfile: ProfileState = {
  civicPoints: 0,
  prefs: {},
  joinedEventIds: [],
  memoryCounters: {},
  tagCounts: {},
  lastChosenPlaceIds: [],
  lastGeminiRecs: null,
  loadingRecs: false,
  recsError: null,
};

type AppState = {
  profile: ProfileState;
  events: Event[];
};

type Action =
  | { type: 'LOAD_PROFILE'; payload: StoredProfile | null }
  | { type: 'MERGE_JOINED_INTO_EVENTS'; joinedEventIds: string[] }
  | { type: 'JOIN_EVENT'; eventId: string }
  | { type: 'SET_PREFS'; prefs: Partial<ProfilePrefs> }
  | { type: 'CHECKIN_LOCAL' }
  | { type: 'WRITE_REVIEW' }
  | { type: 'CHOOSE_PLACE'; placeId: string; category: string; tags: string[] }
  | { type: 'SET_GEMINI_RECS'; recs: GeminiRecItem[] | null; error: string | null }
  | { type: 'SET_LOADING_RECS'; loading: boolean }
  | { type: 'HYDRATE_EVENTS'; events: Event[] };

function profileReducer(state: ProfileState, action: Action): ProfileState {
  switch (action.type) {
    case 'LOAD_PROFILE': {
      const p = action.payload;
      if (!p) return state;
      return {
        ...state,
        civicPoints: p.civicPoints ?? 0,
        prefs: (p.prefs as ProfilePrefs) ?? {},
        joinedEventIds: p.joinedEventIds ?? [],
        memoryCounters: p.memoryCounters ?? {},
        tagCounts: p.tagCounts ?? {},
        lastChosenPlaceIds: p.lastChosenPlaceIds ?? [],
        lastGeminiRecs: (p.lastGeminiRecs as GeminiRecItem[]) ?? null,
      };
    }
    case 'JOIN_EVENT': {
      const event = DEMO_EVENTS.find((e) => e.id === action.eventId);
      const points = event ? POINTS_JOIN_EVENT(event) : 0;
      return {
        ...state,
        civicPoints: state.civicPoints + points,
        joinedEventIds: state.joinedEventIds.includes(action.eventId)
          ? state.joinedEventIds
          : [...state.joinedEventIds, action.eventId],
      };
    }
    case 'SET_PREFS':
      return { ...state, prefs: { ...state.prefs, ...action.prefs } };
    case 'CHECKIN_LOCAL':
      return { ...state, civicPoints: state.civicPoints + POINTS_CHECKIN_LOCAL };
    case 'WRITE_REVIEW':
      return { ...state, civicPoints: state.civicPoints + POINTS_REVIEW };
    case 'CHOOSE_PLACE': {
      const { placeId, category, tags } = action;
      const counters = { ...state.memoryCounters, [category]: (state.memoryCounters[category] || 0) + 1 };
      const tagCounts = { ...state.tagCounts };
      tags.forEach((t) => (tagCounts[t] = (tagCounts[t] || 0) + 1));
      const lastChosen = [placeId, ...state.lastChosenPlaceIds.filter((id) => id !== placeId)].slice(0, 10);
      return {
        ...state,
        memoryCounters: counters,
        tagCounts,
        lastChosenPlaceIds: lastChosen,
      };
    }
    case 'SET_GEMINI_RECS':
      return {
        ...state,
        lastGeminiRecs: action.recs,
        recsError: action.error,
        loadingRecs: false,
      };
    case 'SET_LOADING_RECS':
      return { ...state, loadingRecs: action.loading, recsError: null };
    default:
      return state;
  }
}

function eventsReducer(state: Event[], action: Action): Event[] {
  if (action.type === 'HYDRATE_EVENTS') return action.events;
  if (action.type === 'MERGE_JOINED_INTO_EVENTS') {
    const joined = new Set(action.joinedEventIds);
    return state.map((e) =>
      joined.has(e.id) && !e.joinedUserIds.includes(CURRENT_USER_ID)
        ? { ...e, joinedUserIds: [...e.joinedUserIds, CURRENT_USER_ID] }
        : e
    );
  }
  if (action.type === 'JOIN_EVENT') {
    return state.map((e) =>
      e.id === action.eventId
        ? { ...e, joinedUserIds: e.joinedUserIds.includes(CURRENT_USER_ID) ? e.joinedUserIds : [...e.joinedUserIds, CURRENT_USER_ID] }
        : e
    );
  }
  return state;
}

const initialState: AppState = {
  profile: defaultProfile,
  events: DEMO_EVENTS.map((e) => ({ ...e, joinedUserIds: [...e.joinedUserIds] })),
};

function rootReducer(state: AppState, action: Action): AppState {
  return {
    profile: profileReducer(state.profile, action),
    events: eventsReducer(state.events, action),
  };
}

type StoreContextValue = {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  joinEvent: (eventId: string) => void;
  setPrefs: (prefs: Partial<ProfilePrefs>) => void;
  choosePlace: (place: Place) => void;
  refreshRecs: (geminiKey?: string) => Promise<void>;
  getBadges: () => { label: string; unlocked: boolean }[];
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(rootReducer, initialState);

  useEffect(() => {
    loadProfile().then((p) => {
      dispatch({ type: 'LOAD_PROFILE', payload: p });
      if (p?.joinedEventIds?.length) dispatch({ type: 'MERGE_JOINED_INTO_EVENTS', joinedEventIds: p.joinedEventIds });
    });
  }, []);

  useEffect(() => {
    const profile: StoredProfile = {
      prefs: state.profile.prefs,
      civicPoints: state.profile.civicPoints,
      joinedEventIds: state.profile.joinedEventIds,
      memoryCounters: state.profile.memoryCounters,
      tagCounts: state.profile.tagCounts,
      lastChosenPlaceIds: state.profile.lastChosenPlaceIds,
      lastGeminiRecs: state.profile.lastGeminiRecs,
    };
    saveProfile(profile);
  }, [state.profile]);

  const joinEvent = useCallback((eventId: string) => {
    dispatch({ type: 'JOIN_EVENT', eventId });
  }, []);

  const setPrefs = useCallback((prefs: Partial<ProfilePrefs>) => {
    dispatch({ type: 'SET_PREFS', prefs });
  }, []);

  const choosePlace = useCallback((place: Place) => {
    dispatch({ type: 'CHOOSE_PLACE', placeId: place.id, category: place.category, tags: place.tags });
  }, []);

  const refreshRecs = useCallback(async (geminiKey?: string) => {
    dispatch({ type: 'SET_LOADING_RECS', loading: true });
    const memory: MemorySummary = {
      categoryCounts: state.profile.memoryCounters,
      tagCounts: state.profile.tagCounts,
      lastChosenPlaceIds: state.profile.lastChosenPlaceIds,
      vibe: state.profile.prefs.vibe,
      budget: state.profile.prefs.budget,
    };
    const friendSummary = 'Alex visited The Hive Coffee. Sam visited Sunset Bar & Grill. Jordan was at Marina Green. Riley volunteered at Downtown Community Center.';
    const placesSummary = DEMO_PLACES.map((p) => `${p.id} | ${p.name} | ${p.category} | ${p.tags.join(', ')} | ${p.priceTier}`).join('\n');

    if (!geminiKey) {
      dispatch({ type: 'SET_GEMINI_RECS', recs: DEMO_RECS, error: null });
      return;
    }
    try {
      const res = await fetchRecommendations(geminiKey, memory, friendSummary, placesSummary);
      dispatch({ type: 'SET_GEMINI_RECS', recs: res.recs || DEMO_RECS, error: null });
    } catch {
      dispatch({ type: 'SET_GEMINI_RECS', recs: DEMO_RECS, error: 'Using fallback recs' });
    }
  }, [state.profile.memoryCounters, state.profile.tagCounts, state.profile.lastChosenPlaceIds, state.profile.prefs.vibe, state.profile.prefs.budget]);

  const getBadges = useCallback(() => {
    const pts = state.profile.civicPoints;
    return BADGES.map((b) => ({ label: b.label, unlocked: pts >= b.threshold }));
  }, [state.profile.civicPoints]);

  const value: StoreContextValue = {
    state,
    dispatch,
    joinEvent,
    setPrefs,
    choosePlace,
    refreshRecs,
    getBadges,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
