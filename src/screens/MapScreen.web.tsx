import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
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
import { getCityById } from '../data/cities';
import { GOOGLE_MAPS_API_KEY } from '../config';
import { useStore } from '../state/store';
import { colors } from '../theme';

const HOME_MARKER_COLOR = '#2563EB';

// Google Maps JS API (loaded via script) — minimal types
interface GoogleMarkerInstance {
  setMap(map: GoogleMapInstance | null): void;
  addListener(event: string, fn: () => void): void;
}
interface GoogleMapInstance {
  setCenter(center: { lat: number; lng: number }): void;
}

declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (el: HTMLElement, opts: object) => GoogleMapInstance;
        Marker: new (opts: object) => GoogleMarkerInstance;
        SymbolPath: { CIRCLE: unknown };
      };
    };
    initExploreMap?: () => void;
  }
}

export function MapScreen() {
  const nav = useNavigation();
  const { state, setOpenPlanModal, setSelectedCity } = useStore();
  const selectedCityId = state.city.selectedCityId;
  const city = getCityById(selectedCityId) ?? getCityById('san_francisco')!;
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<GoogleMapInstance | null>(null);
  const markersRef = useRef<GoogleMarkerInstance[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
  const [listSearch, setListSearch] = useState('');
  const [mapReady, setMapReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const hasActivePlan = state.plan.activePlan != null;

  const listPlaces = listSearch.trim()
    ? city.places.filter(
        (p) =>
          p.name.toLowerCase().includes(listSearch.trim().toLowerCase()) ||
          p.category.toLowerCase().includes(listSearch.trim().toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(listSearch.trim().toLowerCase()))
      )
    : city.places;

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
        center: { lat: city.center.lat, lng: city.center.lng },
        zoom: 14,
        mapTypeId: 'roadmap',
      });
      mapInstanceRef.current = map;

      // Home (you) — blue marker
      const homeMarker = new g.Marker({
        position: { lat: city.origin.lat, lng: city.origin.lng },
        map,
        title: 'You',
        icon: {
          path: g.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: HOME_MARKER_COLOR,
          fillOpacity: 1,
          strokeColor: '#1e40af',
          strokeWeight: 2,
        },
      });
      markersRef.current.push(homeMarker);

      // Places
      city.places.forEach((place) => {
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
      city.events.forEach((ev) => {
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

  // When city changes and map already exists, update center and markers
  useEffect(() => {
    if (viewMode !== 'map' || !mapInstanceRef.current || !window.google?.maps) return;
    const map = mapInstanceRef.current as unknown as { setCenter: (c: { lat: number; lng: number }) => void };
    map.setCenter({ lat: city.center.lat, lng: city.center.lng });
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    const g = window.google.maps;
    const homeMarker = new g.Marker({
      position: { lat: city.origin.lat, lng: city.origin.lng },
      map: mapInstanceRef.current,
      title: 'You',
      icon: {
        path: g.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: HOME_MARKER_COLOR,
        fillOpacity: 1,
        strokeColor: '#1e40af',
        strokeWeight: 2,
      },
    });
    markersRef.current.push(homeMarker);
    city.places.forEach((place) => {
      const marker = new g.Marker({
        position: { lat: place.lat, lng: place.lng },
        map: mapInstanceRef.current,
        title: place.name,
      });
      marker.addListener('click', () => {
        nav.navigate('PlaceDetail' as never, { placeId: place.id } as never);
      });
      markersRef.current.push(marker);
    });
    city.events.forEach((ev) => {
      const marker = new g.Marker({
        position: { lat: ev.lat, lng: ev.lng },
        map: mapInstanceRef.current,
        title: ev.title,
        label: { text: '●', color: colors.accent },
      });
      markersRef.current.push(marker);
    });
  }, [selectedCityId, viewMode, city, nav]);

  if (loadError) {
    return (
      <View style={styles.container}>
        <AppHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedCityId={selectedCityId}
          onCityChange={setSelectedCity}
        />
        <Text style={styles.error}>{loadError}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedCityId={selectedCityId}
        onCityChange={setSelectedCity}
      />
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
          {!hasActivePlan ? (
            <TouchableOpacity style={styles.fab} onPress={() => setOpenPlanModal(true)} accessibilityLabel="Plan my day" accessibilityRole="button">
              <Ionicons name="navigate" size={24} color={colors.white} />
              <Text style={styles.fabLabel}>Plan my day</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.fab, styles.fabActivePlan]} onPress={() => setOpenPlanModal(true)} accessibilityLabel="Active plan" accessibilityRole="button">
              <Ionicons name="navigate" size={24} color={colors.white} />
              <Text style={styles.fabLabel}>Active plan</Text>
            </TouchableOpacity>
          )}
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
  fabActivePlan: { backgroundColor: '#F97316' },
});
