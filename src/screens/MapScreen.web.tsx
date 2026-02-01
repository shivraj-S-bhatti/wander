import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DEMO_EVENTS, DEMO_PLACES } from '../data/demo';
import { GOOGLE_MAPS_API_KEY } from '../config';

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

const SF_CENTER = { lat: 37.7849, lng: -122.4094 };

export function MapScreen() {
  const nav = useNavigation();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<GoogleMapInstance | null>(null);
  const markersRef = useRef<GoogleMarkerInstance[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current || !GOOGLE_MAPS_API_KEY) {
      setLoadError('No map API key');
      return;
    }

    const initMap = () => {
      if (!mapRef.current || !window.google) return;
      const g = window.google.maps;
      const map = new g.Map(mapRef.current, {
        center: SF_CENTER,
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
          label: { text: '●', color: '#22c55e' },
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
        <Text style={styles.error}>{loadError}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <div ref={mapRef} style={styles.mapDiv} />
      {!mapReady && (
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading map…</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: '100%',
  },
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
  loadingText: { fontSize: 16, color: '#666' },
  error: { padding: 16, color: '#dc2626', fontSize: 16 },
});
