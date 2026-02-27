import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import {
  CURRENT_USER_ID,
  DEMO_CHECKINS,
  DEMO_EVENTS,
  DEMO_PLACES,
  DEMO_POSTS_CURRENT_USER,
  DEMO_PROFILE_INITIAL,
  DEMO_RECS,
  DEMO_USERS,
  type Event,
  type Place,
  type Post,
} from '../data/demo';
import { GEMINI_API_KEY } from '../config';
import { fetchRecommendations, type GeminiRecItem, type MemorySummary } from '../services/gemini';
import { loadProfile, loadPlan, loadPosts, loadDemoFriends, saveProfile, savePlan, savePosts, saveDemoFriends, type StoredProfile, type StoredPost } from '../services/storage';

// ——— Civic points rules (hardcoded)
const POINTS_JOIN_EVENT = (e: Event) => e.pointsReward;
const POINTS_CHECKIN_LOCAL = 5;
const POINTS_REVIEW = 3;
const POINTS_POST = 5;
const POINTS_PER_LEVEL = 25;
const BADGES = [
  { threshold: 50, label: 'Local Supporter' },
  { threshold: 100, label: 'Cleanup Crew' },
  { threshold: 200, label: 'Community Builder' },
];
export { POINTS_POST };

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

export type ActivePlan = { placeIds: string[]; name?: string; eventIds?: string[] };

type PlanState = {
  activePlan: ActivePlan | null;
  openPlanModal: boolean;
  pendingEventId: string | null;
};

type CityState = {
  selectedCityId: string;
  recentPostLocation: { lat: number; lng: number } | null;
};

const defaultPlan: PlanState = {
  activePlan: null,
  openPlanModal: false,
  pendingEventId: null,
};

const defaultCity: CityState = {
  selectedCityId: 'san_francisco',
  recentPostLocation: null,
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
  plan: PlanState;
  city: CityState;
  events: Event[];
  posts: Post[];
  demoFriendIds: string[];
};

type Action =
  | { type: 'LOAD_PROFILE'; payload: StoredProfile | null }
  | { type: 'LOAD_POSTS'; payload: StoredPost[] }
  | { type: 'ADD_POST'; payload: Post }
  | { type: 'MERGE_JOINED_INTO_EVENTS'; joinedEventIds: string[] }
  | { type: 'JOIN_EVENT'; eventId: string }
  | { type: 'SET_PREFS'; prefs: Partial<ProfilePrefs> }
  | { type: 'CHECKIN_LOCAL' }
  | { type: 'WRITE_REVIEW' }
  | { type: 'CHOOSE_PLACE'; placeId: string; category: string; tags: string[] }
  | { type: 'SET_GEMINI_RECS'; recs: GeminiRecItem[] | null; error: string | null }
  | { type: 'SET_LOADING_RECS'; loading: boolean }
  | { type: 'HYDRATE_EVENTS'; events: Event[] }
  | { type: 'SET_ACTIVE_PLAN'; payload: ActivePlan | null }
  | { type: 'CLEAR_ACTIVE_PLAN' }
  | { type: 'SET_OPEN_PLAN_MODAL'; payload: boolean }
  | { type: 'LOAD_PLAN'; payload: ActivePlan | null }
  | { type: 'ADD_DEMO_FRIEND'; payload: string }
  | { type: 'REMOVE_DEMO_FRIEND'; payload: string }
  | { type: 'LOAD_DEMO_FRIENDS'; payload: string[] }
  | { type: 'SET_SELECTED_CITY'; payload: string }
  | { type: 'SET_RECENT_POST_LOCATION'; payload: { lat: number; lng: number } | null }
  | { type: 'DELETE_POST'; payload: string };

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
    case 'ADD_POST':
      return { ...state, civicPoints: state.civicPoints + POINTS_POST };
    default:
      return state;
  }
}

function planReducer(state: PlanState, action: Action): PlanState {
  switch (action.type) {
    case 'LOAD_PLAN':
      return { ...state, activePlan: action.payload };
    case 'SET_ACTIVE_PLAN':
      return { ...state, activePlan: action.payload, pendingEventId: null };
    case 'CLEAR_ACTIVE_PLAN':
      return { ...state, activePlan: null };
    case 'SET_OPEN_PLAN_MODAL':
      return { ...state, openPlanModal: action.payload };
    case 'ADD_EVENT_TO_PLAN': {
      const plan = state.activePlan;
      if (!plan) return state;
      const eventIds = plan.eventIds ?? [];
      if (eventIds.includes(action.payload)) return state;
      return {
        ...state,
        activePlan: { ...plan, eventIds: [...eventIds, action.payload] },
      };
    }
    case 'SET_PENDING_EVENT':
      return { ...state, pendingEventId: action.payload };
    default:
      return state;
  }
}

function cityReducer(state: CityState, action: Action): CityState {
  if (action.type === 'SET_SELECTED_CITY') return { ...state, selectedCityId: action.payload };
  if (action.type === 'SET_RECENT_POST_LOCATION') return { ...state, recentPostLocation: action.payload };
  return state;
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

function demoFriendIdsReducer(state: string[], action: Action): string[] {
  if (action.type === 'LOAD_DEMO_FRIENDS') return action.payload;
  if (action.type === 'ADD_DEMO_FRIEND') {
    const id = action.payload;
    if (id === CURRENT_USER_ID || state.includes(id)) return state;
    const user = DEMO_USERS.find((u) => u.id === id);
    if (!user) return state;
    return [...state, id];
  }
  if (action.type === 'REMOVE_DEMO_FRIEND') return state.filter((id) => id !== action.payload);
  return state;
}

const initialState: AppState = {
  profile: defaultProfile,
  plan: defaultPlan,
  city: defaultCity,
  events: DEMO_EVENTS.map((e) => ({ ...e, joinedUserIds: [...e.joinedUserIds] })),
  posts: [],
  demoFriendIds: [],
};

function postsReducer(state: Post[], action: Action): Post[] {
  if (action.type === 'LOAD_POSTS') {
    return action.payload.map((p) => ({
      id: p.id,
      userId: p.userId,
      ts: p.ts,
      what: p.what,
      whoWith: p.whoWith,
      rating: p.rating,
      experience: p.experience,
      imageUris: p.imageUris ?? [],
      tags: p.tags ?? [],
      hoursSpent: p.hoursSpent,
      ...(('placeName' in p && p.placeName != null) && { placeName: p.placeName }),
      ...(('badges' in p && p.badges != null) && { badges: p.badges }),
    }));
  }
  if (action.type === 'ADD_POST') return [action.payload, ...state];
  if (action.type === 'DELETE_POST') return state.filter((p) => p.id !== action.payload);
  return state;
}

function rootReducer(state: AppState, action: Action): AppState {
  return {
    profile: profileReducer(state.profile, action),
    plan: planReducer(state.plan, action),
    city: cityReducer(state.city, action),
    events: eventsReducer(state.events, action),
    posts: postsReducer(state.posts, action),
    demoFriendIds: demoFriendIdsReducer(state.demoFriendIds, action),
  };
}

type StoreContextValue = {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  joinEvent: (eventId: string) => void;
  setPrefs: (prefs: Partial<ProfilePrefs>) => void;
  choosePlace: (place: Place) => void;
  addPost: (post: Omit<Post, 'id' | 'userId' | 'ts'>, ts?: number) => void;
  deletePost: (postId: string) => void;
  refreshRecs: (geminiKey?: string) => Promise<void>;
  getBadges: () => { label: string; unlocked: boolean }[];
  getLevel: () => number;
  getStreak: () => number;
  getNextBadgeProgress: () => { label: string; pointsToNext: number; current: number; threshold: number } | null;
  setActivePlan: (plan: ActivePlan | null) => void;
  clearActivePlan: () => void;
  setOpenPlanModal: (open: boolean) => void;
  addEventToPlan: (eventId: string) => void;
  setPendingEventId: (eventId: string | null) => void;
  setSelectedCity: (cityId: string) => void;
  setRecentPostLocation: (location: { lat: number; lng: number } | null) => void;
  clearRecentPostLocation: () => void;
  addDemoFriend: (userId: string) => void;
  removeDemoFriend: (userId: string) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(rootReducer, initialState);

  useEffect(() => {
    loadProfile().then((p) => {
      const useDemoProfile = p == null || (typeof p?.civicPoints === 'number' && p.civicPoints === 0);
      const profile = useDemoProfile ? (DEMO_PROFILE_INITIAL as StoredProfile) : p!;
      dispatch({ type: 'LOAD_PROFILE', payload: profile });
      if (profile?.joinedEventIds?.length) dispatch({ type: 'MERGE_JOINED_INTO_EVENTS', joinedEventIds: profile.joinedEventIds });
    });
    loadPosts().then((list) => {
      let posts = list.length > 0 ? list : DEMO_POSTS_CURRENT_USER;
      // Remove warmup Brown post if user created one (placeName Brown + "warmup" in text)
      const filtered = posts.filter(
        (p) =>
          !(
            ('placeName' in p && p.placeName === 'Brown University') &&
            (p.what || '').toLowerCase().includes('warmup')
          )
      );
      if (filtered.length !== posts.length) savePosts(filtered);
      dispatch({ type: 'LOAD_POSTS', payload: filtered });
    });
    loadPlan().then((p) => dispatch({ type: 'LOAD_PLAN', payload: p }));
    loadDemoFriends().then((ids) => dispatch({ type: 'LOAD_DEMO_FRIENDS', payload: ids }));
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

  useEffect(() => {
    if (state.plan.activePlan) savePlan(state.plan.activePlan);
    else savePlan(null);
  }, [state.plan.activePlan]);

  useEffect(() => {
    const toStore: StoredPost[] = state.posts.map((p) => ({
      id: p.id,
      userId: p.userId,
      ts: p.ts,
      what: p.what,
      whoWith: p.whoWith,
      rating: p.rating,
      experience: p.experience,
      imageUris: p.imageUris ?? [],
      tags: p.tags ?? [],
      hoursSpent: p.hoursSpent,
      ...(p.placeName != null && { placeName: p.placeName }),
    }));
    if (toStore.length > 0) savePosts(toStore);
  }, [state.posts]);

  useEffect(() => {
    saveDemoFriends(state.demoFriendIds);
  }, [state.demoFriendIds]);

  const joinEvent = useCallback((eventId: string) => {
    dispatch({ type: 'JOIN_EVENT', eventId });
  }, []);

  const setPrefs = useCallback((prefs: Partial<ProfilePrefs>) => {
    dispatch({ type: 'SET_PREFS', prefs });
  }, []);

  const choosePlace = useCallback((place: Place) => {
    dispatch({ type: 'CHOOSE_PLACE', placeId: place.id, category: place.category, tags: place.tags });
  }, []);

  const addPost = useCallback((post: Omit<Post, 'id' | 'userId' | 'ts'>, ts?: number) => {
    const full: Post = {
      ...post,
      id: `post_${Date.now()}`,
      userId: CURRENT_USER_ID,
      ts: ts ?? Date.now(),
    };
    dispatch({ type: 'ADD_POST', payload: full });
  }, []);

  const deletePost = useCallback((postId: string) => {
    dispatch({ type: 'DELETE_POST', payload: postId });
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
    const friendSummary = DEMO_CHECKINS.slice()
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 10)
      .map((c) => {
        const user = DEMO_USERS.find((u) => u.id === c.userId);
        const place = DEMO_PLACES.find((p) => p.id === c.placeId);
        const name = user?.name ?? 'Someone';
        const placeName = place?.name ?? 'a place';
        const action = c.type === 'volunteer' ? 'volunteered at' : 'visited';
        return `${name} ${action} ${placeName}${c.note ? ` — ${c.note}` : ''}`;
      })
      .join('. ');
    const placesSummary = DEMO_PLACES.map((p) => `${p.id} | ${p.name} | ${p.category} | ${p.tags.join(', ')} | ${p.priceTier}`).join('\n');

    const key = geminiKey ?? GEMINI_API_KEY;
    if (!key) {
      dispatch({ type: 'SET_GEMINI_RECS', recs: DEMO_RECS, error: null });
      return;
    }
    try {
      const res = await fetchRecommendations(key, memory, friendSummary, placesSummary);
      dispatch({ type: 'SET_GEMINI_RECS', recs: res.recs || DEMO_RECS, error: null });
    } catch {
      dispatch({ type: 'SET_GEMINI_RECS', recs: DEMO_RECS, error: 'Using fallback recs' });
    }
  }, [state.profile.memoryCounters, state.profile.tagCounts, state.profile.lastChosenPlaceIds, state.profile.prefs.vibe, state.profile.prefs.budget]);

  const getBadges = useCallback(() => {
    const pts = state.profile.civicPoints;
    return BADGES.map((b) => ({ label: b.label, unlocked: pts >= b.threshold }));
  }, [state.profile.civicPoints]);

  const getLevel = useCallback(() => {
    const pts = state.profile.civicPoints;
    return Math.floor(pts / POINTS_PER_LEVEL) + 1;
  }, [state.profile.civicPoints]);

  const getStreak = useCallback(() => {
    const posts = state.posts.filter((p) => p.userId === CURRENT_USER_ID);
    if (posts.length === 0) return 0;
    const dayMs = 24 * 60 * 60 * 1000;
    const startOfDay = (ts: number) => {
      const d = new Date(ts);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    };
    const sortedDays = [...new Set(posts.map((p) => startOfDay(p.ts)))].sort((a, b) => b - a);
    let streak = 0;
    const today = startOfDay(Date.now());
    for (let i = 0; i < sortedDays.length; i++) {
      const expected = today - i * dayMs;
      if (sortedDays[i] === expected) streak++;
      else break;
    }
    return streak;
  }, [state.posts]);

  const getNextBadgeProgress = useCallback(() => {
    const pts = state.profile.civicPoints;
    const next = BADGES.find((b) => pts < b.threshold);
    if (!next) return null;
    const prev = BADGES.filter((b) => b.threshold < next.threshold).pop();
    const current = prev ? pts - prev.threshold : pts;
    const threshold = prev ? next.threshold - prev.threshold : next.threshold;
    return {
      label: next.label,
      pointsToNext: next.threshold - pts,
      current: Math.min(pts - (prev?.threshold ?? 0), threshold),
      threshold,
    };
  }, [state.profile.civicPoints]);

  const setActivePlan = useCallback((plan: ActivePlan | null) => {
    dispatch({ type: 'SET_ACTIVE_PLAN', payload: plan });
  }, []);

  const clearActivePlan = useCallback(() => {
    dispatch({ type: 'CLEAR_ACTIVE_PLAN' });
  }, []);

  const setOpenPlanModal = useCallback((open: boolean) => {
    dispatch({ type: 'SET_OPEN_PLAN_MODAL', payload: open });
  }, []);

  const addEventToPlan = useCallback((eventId: string) => {
    dispatch({ type: 'ADD_EVENT_TO_PLAN', payload: eventId });
  }, []);

  const setPendingEventId = useCallback((eventId: string | null) => {
    dispatch({ type: 'SET_PENDING_EVENT', payload: eventId });
  }, []);

  const setSelectedCity = useCallback((cityId: string) => {
    dispatch({ type: 'SET_SELECTED_CITY', payload: cityId });
  }, []);

  const setRecentPostLocation = useCallback((location: { lat: number; lng: number } | null) => {
    dispatch({ type: 'SET_RECENT_POST_LOCATION', payload: location });
  }, []);

  const clearRecentPostLocation = useCallback(() => {
    dispatch({ type: 'SET_RECENT_POST_LOCATION', payload: null });
  }, []);

  const addDemoFriend = useCallback((userId: string) => {
    dispatch({ type: 'ADD_DEMO_FRIEND', payload: userId });
  }, []);

  const removeDemoFriend = useCallback((userId: string) => {
    dispatch({ type: 'REMOVE_DEMO_FRIEND', payload: userId });
  }, []);

  const value: StoreContextValue = {
    state,
    dispatch,
    joinEvent,
    setPrefs,
    choosePlace,
    addPost,
    deletePost,
    refreshRecs,
    getBadges,
    getLevel,
    getStreak,
    getNextBadgeProgress,
    setActivePlan,
    clearActivePlan,
    setOpenPlanModal,
    addEventToPlan,
    setPendingEventId,
    setSelectedCity,
    setRecentPostLocation,
    clearRecentPostLocation,
    addDemoFriend,
    removeDemoFriend,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
