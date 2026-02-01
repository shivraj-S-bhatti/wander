import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { PlaceCard } from '../components/PlaceCard';
import { DEMO_EVENTS, DEMO_MAP_CENTER, DEMO_PLACES } from '../data/demo';
import { GOOGLE_MAPS_API_KEY } from '../config';
import { colors } from '../theme';

const FEELING_OPTIONS = ['chill', 'party', 'quiet', 'outdoors'] as const;
const BUDGET_OPTIONS = ['low', 'med', 'high'] as const;
type GeneratePhase = 'idle' | 'loading' | 'result';

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
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<GoogleMapInstance | null>(null);
  const markersRef = useRef<GoogleMarkerInstance[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
  const [listSearch, setListSearch] = useState('');
  const [mapReady, setMapReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [startLocation, setStartLocation] = useState('');
  const [feeling, setFeeling] = useState<string | null>(null);
  const [budget, setBudget] = useState<string | null>(null);
  const [hoursOutside, setHoursOutside] = useState(3);
  const [phase, setPhase] = useState<GeneratePhase>('idle');

  const onGenerate = () => {
    setPhase('loading');
    setTimeout(() => setPhase('result'), 1500);
  };
  const resultTime = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const mockWeather = [72, 70, 68, 65, 64, 63];

  const listPlaces = listSearch.trim()
    ? DEMO_PLACES.filter(
        (p) =>
          p.name.toLowerCase().includes(listSearch.trim().toLowerCase()) ||
          p.category.toLowerCase().includes(listSearch.trim().toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(listSearch.trim().toLowerCase()))
      )
    : DEMO_PLACES;

  useEffect(() => {
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
      return;
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
  }, [nav]);

  if (loadError) {
    return (
      <View style={styles.container}>
        <AppHeader viewMode={viewMode} onViewModeChange={setViewMode} />
        <Text style={styles.error}>{loadError}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader viewMode={viewMode} onViewModeChange={setViewMode} />
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
          <View style={styles.panel}>
            <ScrollView style={styles.panelScroll} contentContainerStyle={styles.panelContent}>
            <Text style={styles.panelLabel}>Starting location</Text>
            <TextInput
              style={styles.input}
              value={startLocation}
              onChangeText={setStartLocation}
              placeholder="e.g. Home"
              placeholderTextColor={colors.placeholder}
            />
            <Text style={styles.panelLabel}>I'm feeling...</Text>
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
            <Text style={styles.panelLabel}>Budget</Text>
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
            <Text style={styles.panelLabel}>Hours outside: {hoursOutside}</Text>
            <View style={styles.sliderRow}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                <TouchableOpacity
                  key={h}
                  style={[styles.sliderDot, hoursOutside === h && styles.sliderDotActive]}
                  onPress={() => setHoursOutside(h)}
                />
              ))}
            </View>
            <TouchableOpacity style={styles.generateBtn} onPress={onGenerate} disabled={phase === 'loading'}>
              <Text style={styles.generateBtnText}>Generate</Text>
            </TouchableOpacity>
          </ScrollView>
          </View>
        </View>
      )}
      {phase === 'loading' && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.overlayText}>Finding ideas…</Text>
        </View>
      )}
      {phase === 'result' && (
        <View style={styles.resultPanel}>
          <Text style={styles.resultTitle}>Your plan</Text>
          <Text style={styles.resultTime}>Current time: {resultTime}</Text>
          <Text style={styles.resultWeather}>Next 6 hours: {mockWeather.map((t) => `${t}°F`).join(', ')}</Text>
          <TouchableOpacity style={styles.resultClose} onPress={() => setPhase('idle')}>
            <Text style={styles.resultCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
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
  main: { flex: 1, flexDirection: 'row' },
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
  panel: {
    width: 320,
    backgroundColor: colors.white,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  panelScroll: { flex: 1 },
  panelContent: { paddingBottom: 24 },
  panelLabel: { fontSize: 14, fontWeight: '600', color: colors.black, marginBottom: 8, marginTop: 4 },
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
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  generateBtnText: { fontSize: 18, fontWeight: '700', color: colors.white },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: { color: colors.white, fontSize: 16, marginTop: 12 },
  resultPanel: {
    position: 'absolute',
    left: 24,
    bottom: 24,
    right: 340,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  resultTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  resultTime: { fontSize: 15, color: colors.black, marginBottom: 4 },
  resultWeather: { fontSize: 14, color: colors.textMuted, marginBottom: 16 },
  resultClose: { alignSelf: 'flex-end' },
  resultCloseText: { color: colors.accent, fontWeight: '600' },
});
