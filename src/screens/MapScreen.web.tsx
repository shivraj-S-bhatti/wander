import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { PlaceCard } from '../components/PlaceCard';
import { DEMO_EVENTS, DEMO_MAP_CENTER, DEMO_PLACES } from '../data/demo';
import { GOOGLE_MAPS_API_KEY, GEMINI_API_KEY } from '../config';
import { fetchItineraryOptions, type ItineraryOption } from '../services/gemini';
import { useStore } from '../state/store';
import { colors } from '../theme';

const FEELING_OPTIONS = ['chill', 'party', 'quiet', 'outdoors'] as const;
const BUDGET_OPTIONS = ['low', 'med', 'high'] as const;
const PLAN_STAR_ORANGE = '#F97316';

// Google Maps JS API (loaded via script) — minimal types
interface GoogleMarkerInstance {
  setMap(map: GoogleMapInstance | null): void;
  addListener(event: string, fn: () => void): void;
}
interface GoogleMapInstance {
  // no methods needed for cleanup
}

declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (el: HTMLElement, opts: object) => GoogleMapInstance;
        Marker: new (opts: object) => GoogleMarkerInstance;
      };
    };
    initExploreMap?: () => void;
  }
}

export function MapScreen() {
  const nav = useNavigation();
  const { state, setActivePlan, setOpenPlanModal } = useStore();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<GoogleMapInstance | null>(null);
  const markersRef = useRef<GoogleMarkerInstance[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
  const [listSearch, setListSearch] = useState('');
  const [mapReady, setMapReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [planModalVisible, setPlanModalVisible] = useState(false);
  const [planModalMode, setPlanModalMode] = useState<'form' | 'results' | 'viewPlan'>('form');
  const [startLocation, setStartLocation] = useState('');
  const [feeling, setFeeling] = useState<string | null>(null);
  const [budget, setBudget] = useState<string | null>(null);
  const [hoursOutside, setHoursOutside] = useState(3);
  const [generating, setGenerating] = useState(false);
  const [generatedOptions, setGeneratedOptions] = useState<ItineraryOption[] | null>(null);
  const [crossedOutIndices, setCrossedOutIndices] = useState<Set<number>>(new Set());
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const hasActivePlan = state.plan.activePlan != null;

  useEffect(() => {
    if (!hasActivePlan) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 750, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [hasActivePlan, glowAnim]);

  useEffect(() => {
    if (state.plan.openPlanModal) {
      setPlanModalMode('form');
      setGeneratedOptions(null);
      setCrossedOutIndices(new Set());
      setPlanModalVisible(true);
      setOpenPlanModal(false);
    }
  }, [state.plan.openPlanModal, setOpenPlanModal]);

  const openPlanModal = () => {
    setPlanModalMode('form');
    setGeneratedOptions(null);
    setCrossedOutIndices(new Set());
    setPlanModalVisible(true);
  };

  const openPlanModalViewPlan = () => {
    setPlanModalMode('viewPlan');
    setPlanModalVisible(true);
  };

  const closePlanModal = () => {
    setPlanModalVisible(false);
    setPlanModalMode('form');
    setGeneratedOptions(null);
    setCrossedOutIndices(new Set());
  };

  const onGenerate = async () => {
    setGenerating(true);
    setGeneratedOptions(null);
    const placesSummary = DEMO_PLACES.map((p) => `${p.id} | ${p.name} | ${p.category} | ${p.tags.join(', ')} | ${p.priceTier}`).join('\n');
    try {
      const { options } = await fetchItineraryOptions(
        GEMINI_API_KEY,
        { startLocation: startLocation || undefined, vibe: feeling || undefined, budget: budget || undefined, hoursOutside },
        placesSummary
      );
      const opts = options?.length ? options : FALLBACK_OPTIONS;
      setGeneratedOptions(opts);
      setPlanModalMode('results');
    } catch {
      setGeneratedOptions(FALLBACK_OPTIONS);
      setPlanModalMode('results');
    } finally {
      setGenerating(false);
    }
  };

  const toggleCrossOut = (index: number) => {
    setCrossedOutIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const visibleOptions = generatedOptions
    ? generatedOptions
        .map((opt, index) => ({ option: opt, index }))
        .filter(({ index }) => !crossedOutIndices.has(index))
    : [];

  const onAcceptPlan = () => {
    const first = visibleOptions[0]?.option;
    if (first?.placeIds?.length) {
      setActivePlan({ placeIds: first.placeIds, name: first.name });
      setGeneratedOptions(null);
      setCrossedOutIndices(new Set());
      setPlanModalVisible(false);
    }
  };

  const onTryAgain = () => {
    setGeneratedOptions(null);
    setCrossedOutIndices(new Set());
  };

  const planPlaces = useMemo(() => {
    const plan = state.plan.activePlan;
    if (!plan?.placeIds?.length) return [];
    return plan.placeIds
      .map((id) => DEMO_PLACES.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => p != null);
  }, [state.plan.activePlan]);

  const listPlaces = listSearch.trim()
    ? DEMO_PLACES.filter(
        (p) =>
          p.name.toLowerCase().includes(listSearch.trim().toLowerCase()) ||
          p.category.toLowerCase().includes(listSearch.trim().toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(listSearch.trim().toLowerCase()))
      )
    : DEMO_PLACES;

  const onPlanHeaderPress = () => {
    if (hasActivePlan) {
      openPlanModalViewPlan();
    } else {
      openPlanModal();
    }
  };

  const endPlanFromModal = () => {
    setActivePlan(null);
    closePlanModal();
  };

  const planHeaderButton = !hasActivePlan ? (
    <TouchableOpacity
      onPress={onPlanHeaderPress}
      style={styles.planHeaderBtn}
      accessibilityLabel="View plan"
      accessibilityRole="button"
    >
      <Ionicons name="navigate" size={24} color={colors.textMuted} />
    </TouchableOpacity>
  ) : undefined;

  const planFabButton = hasActivePlan ? (
    <TouchableOpacity
      onPress={openPlanModalViewPlan}
      style={styles.fabActivePlan}
      accessibilityLabel="Active plan"
      accessibilityRole="button"
    >
      <Animated.View style={{ opacity: glowAnim }}>
        <Ionicons name="navigate" size={24} color={colors.white} />
      </Animated.View>
      <Text style={styles.fabActivePlanLabel}>Active plan</Text>
    </TouchableOpacity>
  ) : (
    <TouchableOpacity style={styles.fab} onPress={openPlanModal} accessibilityLabel="Plan my day" accessibilityRole="button">
      <Ionicons name="navigate" size={24} color={colors.white} />
      <Text style={styles.fabLabel}>Plan my day</Text>
    </TouchableOpacity>
  );

  useEffect(() => {
    if (viewMode !== 'map') {
      setMapReady(false);
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      mapInstanceRef.current = null;
      delete window.initExploreMap;
      return;
    }

    if (!mapRef.current || !GOOGLE_MAPS_API_KEY) {
      setLoadError('No map API key');
      return;
    }

    const initMap = () => {
      if (!mapRef.current || !window.google) return;
      const g = window.google.maps;
      const map = new g.Map(mapRef.current, {
        center: DEMO_MAP_CENTER,
        zoom: 14,
        mapTypeId: 'roadmap',
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      mapInstanceRef.current = map;

      // Places
      DEMO_PLACES.forEach((place) => {
        const marker = new g.Marker({
          position: { lat: place.lat, lng: place.lng },
          map,
          title: place.name,
        });
        marker.addListener('click', () => {
          nav.navigate('PlaceDetail' as never, { placeId: place.id } as never);
        });
        markersRef.current.push(marker);
      });

      // Events (green label)
      DEMO_EVENTS.forEach((ev) => {
        const marker = new g.Marker({
          position: { lat: ev.lat, lng: ev.lng },
          map,
          title: ev.title,
          label: { text: '●', color: colors.accent },
        });
        markersRef.current.push(marker);
      });

      setMapReady(true);
    };

    if (window.google?.maps) {
      initMap();
      return () => {
        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];
        mapInstanceRef.current = null;
      };
    }

    window.initExploreMap = initMap;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initExploreMap`;
    script.async = true;
    script.defer = true;
    script.onerror = () => setLoadError('Failed to load Google Maps');
    document.head.appendChild(script);

    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      mapInstanceRef.current = null;
      delete window.initExploreMap;
    };
  }, [nav, viewMode]);

  if (loadError) {
    return (
      <View style={styles.container}>
        <AppHeader viewMode={viewMode} onViewModeChange={setViewMode} centerElement={planHeaderButton} />
        <Text style={styles.error}>{loadError}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader viewMode={viewMode} onViewModeChange={setViewMode} centerElement={planHeaderButton} />
      {viewMode === 'list' ? (
        <View style={styles.listWrap}>
          <TextInput
            style={styles.listSearchInput}
            value={listSearch}
            onChangeText={setListSearch}
            placeholder="Search places..."
            placeholderTextColor={colors.placeholder}
          />
          <ScrollView style={styles.listScroll} contentContainerStyle={styles.listContent} keyboardShouldPersistTaps="handled">
            {listPlaces.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                onPress={() => nav.navigate('PlaceDetail' as never, { placeId: place.id } as never)}
                elevated
              />
            ))}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.main}>
          <View style={styles.mapWrap}>
            <div ref={mapRef} style={styles.mapDiv} />
            {!mapReady && (
              <View style={styles.loading}>
                <Text style={styles.loadingText}>Loading map…</Text>
              </View>
            )}
          </View>
          {planFabButton}
        </View>
      )}
      <Modal visible={planModalVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closePlanModal}>
          <TouchableOpacity style={styles.modalCard} activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {planModalMode === 'viewPlan' ? 'Your plan' : generatedOptions ? 'Choose a plan' : 'Plan your day'}
              </Text>
              <TouchableOpacity onPress={closePlanModal} style={styles.modalClose} hitSlop={12}>
                <Ionicons name="close" size={24} color={colors.black} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
              {planModalMode === 'viewPlan' ? (
                <>
                  <Text style={styles.sheetTitle}>{state.plan.activePlan?.name || 'Your route'}</Text>
                  {planPlaces.map((place, index) => (
                    <View key={place.id} style={styles.stepRow}>
                      <View style={styles.stepNum}>
                        <Text style={styles.stepNumText}>{index + 1}</Text>
                      </View>
                      <View style={styles.stepInfo}>
                        <Text style={styles.stepName}>{place.name}</Text>
                        <Text style={styles.stepCategory}>{place.category}</Text>
                      </View>
                    </View>
                  ))}
                  <TouchableOpacity style={styles.endPlanBtn} onPress={endPlanFromModal}>
                    <Text style={styles.endPlanBtnText}>End plan</Text>
                  </TouchableOpacity>
                </>
              ) : generatedOptions ? (
                <>
                  <Text style={styles.modalRowLabel}>Cross out options you don't want, then Accept</Text>
                  {generatedOptions.map((option, index) => {
                    const crossedOut = crossedOutIndices.has(index);
                    const placeNames = (option.placeIds || [])
                      .map((id) => DEMO_PLACES.find((p) => p.id === id)?.name)
                      .filter(Boolean)
                      .join(' → ');
                    return (
                      <View key={index} style={[styles.optionRow, crossedOut && styles.optionRowCrossedOut]}>
                        <View style={styles.optionRowLeft}>
                          <View style={styles.optionCircle} />
                          <View style={styles.optionRowText}>
                            <Text style={[styles.optionName, crossedOut && styles.optionTextCrossedOut]} numberOfLines={1}>
                              {option.name || `Option ${index + 1}`}
                            </Text>
                            <Text style={[styles.optionStops, crossedOut && styles.optionTextCrossedOut]} numberOfLines={1}>
                              {option.placeIds?.length ?? 0} stops{placeNames ? ` · ${placeNames}` : ''}
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          onPress={() => toggleCrossOut(index)}
                          style={styles.optionCrossOut}
                          hitSlop={12}
                          accessibilityLabel={crossedOut ? 'Restore option' : 'Cross out option'}
                        >
                          <Ionicons name="close-circle" size={24} color={crossedOut ? colors.textMuted : colors.black} />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                  <TouchableOpacity
                    style={[styles.generateBtn, visibleOptions.length === 0 && styles.acceptDisabled]}
                    onPress={onAcceptPlan}
                    disabled={visibleOptions.length === 0}
                  >
                    <Text style={styles.generateBtnText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.tryAgainBtn} onPress={onTryAgain}>
                    <Text style={styles.tryAgainBtnText}>Try again</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelPlanBtn} onPress={closePlanModal}>
                    <Text style={styles.cancelPlanBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.modalRowLabel}>Starting location</Text>
                  <TextInput
                    style={styles.input}
                    value={startLocation}
                    onChangeText={setStartLocation}
                    placeholder="e.g. Home"
                    placeholderTextColor={colors.placeholder}
                  />
                  <Text style={styles.modalRowLabel}>Vibe</Text>
                  <View style={styles.chipRow}>
                    {FEELING_OPTIONS.map((f) => (
                      <TouchableOpacity
                        key={f}
                        style={[styles.chip, feeling === f && styles.chipActive]}
                        onPress={() => setFeeling(feeling === f ? null : f)}
                      >
                        <Text style={[styles.chipText, feeling === f && styles.chipTextActive]}>{f}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.modalRowLabel}>Budget</Text>
                  <View style={styles.chipRow}>
                    {BUDGET_OPTIONS.map((b) => (
                      <TouchableOpacity
                        key={b}
                        style={[styles.chip, budget === b && styles.chipActive]}
                        onPress={() => setBudget(budget === b ? null : b)}
                      >
                        <Text style={[styles.chipText, budget === b && styles.chipTextActive]}>{b}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.modalRowLabel}>Hours outside: {hoursOutside}</Text>
                  <View style={styles.sliderRow}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                      <TouchableOpacity
                        key={h}
                        style={[styles.sliderDot, hoursOutside === h && styles.sliderDotActive]}
                        onPress={() => setHoursOutside(h)}
                      />
                    ))}
                  </View>
                  <TouchableOpacity style={styles.generateBtn} onPress={onGenerate} disabled={generating}>
                    {generating ? (
                      <ActivityIndicator color={colors.white} />
                    ) : (
                      <Text style={styles.generateBtnText}>Generate</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: '100%', backgroundColor: colors.background },
  listWrap: { flex: 1 },
  listSearchInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  listScroll: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 24 },
  main: { flex: 1, flexDirection: 'row', position: 'relative' },
  mapWrap: { flex: 1, minWidth: 300, position: 'relative' },
  mapDiv: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { fontSize: 16, color: colors.textMuted },
  error: { padding: 16, color: colors.accent, fontSize: 16 },
  planHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    left: '50%',
    marginLeft: -80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 28,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  fabLabel: { fontSize: 16, fontWeight: '700', color: colors.white },
  fabActivePlan: {
    position: 'absolute',
    bottom: 24,
    left: '50%',
    marginLeft: -80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: PLAN_STAR_ORANGE,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 28,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  fabActivePlanLabel: { fontSize: 16, fontWeight: '700', color: colors.white },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.black },
  modalClose: { padding: 4 },
  modalScroll: { maxHeight: 400 },
  modalContent: { padding: 20, paddingBottom: 28 },
  modalRowLabel: { fontSize: 14, fontWeight: '600', color: colors.black, marginBottom: 8, marginTop: 12 },
  input: {
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 4,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.border },
  chipActive: { backgroundColor: colors.accent },
  chipText: { fontSize: 14, color: colors.black },
  chipTextActive: { fontSize: 14, color: colors.white, fontWeight: '600' },
  sliderRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  sliderDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.border },
  sliderDotActive: { backgroundColor: colors.accent },
  generateBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  generateBtnText: { fontSize: 18, fontWeight: '700', color: colors.white },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionRowCrossedOut: { opacity: 0.5 },
  optionRowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0 },
  optionCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.accent,
    marginRight: 12,
  },
  optionRowText: { flex: 1, minWidth: 0 },
  optionName: { fontSize: 16, fontWeight: '700', color: colors.black, marginBottom: 2 },
  optionStops: { fontSize: 13, color: colors.textMuted },
  optionTextCrossedOut: { textDecorationLine: 'line-through', color: colors.textMuted },
  optionCrossOut: { padding: 4 },
  acceptDisabled: { opacity: 0.5 },
  tryAgainBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  tryAgainBtnText: { fontSize: 16, fontWeight: '600', color: colors.accent },
  cancelPlanBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  cancelPlanBtnText: { fontSize: 15, color: colors.textMuted },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: colors.black, marginBottom: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumText: { fontSize: 14, fontWeight: '700', color: colors.white },
  stepInfo: { flex: 1 },
  stepName: { fontSize: 16, fontWeight: '600', color: colors.black },
  stepCategory: { fontSize: 13, color: colors.textMuted },
  endPlanBtn: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.border,
  },
  endPlanBtnText: { fontSize: 16, fontWeight: '600', color: colors.black },
});
