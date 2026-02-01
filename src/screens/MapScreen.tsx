import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { AppHeader } from '../components/AppHeader';
import { RouteSheet } from '../components/RouteSheet';
import { DEMO_EVENTS, DEMO_MAP_CENTER, DEMO_ORIGIN, DEMO_PLACES } from '../data/demo';
import { colors } from '../theme';

const INITIAL_REGION = {
  latitude: DEMO_MAP_CENTER.lat,
  longitude: DEMO_MAP_CENTER.lng,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const FEELING_OPTIONS = ['chill', 'party', 'quiet', 'outdoors'] as const;
const BUDGET_OPTIONS = ['low', 'med', 'high'] as const;

type GeneratePhase = 'idle' | 'loading' | 'result';

export function MapScreen() {
  const nav = useNavigation();
  const [routeDestination, setRouteDestination] = useState<{ lat: number; lng: number } | null>(null);
  const [city, setCity] = useState('Boston');
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

  return (
    <View style={styles.container}>
      <AppHeader showCityInput city={city} onCityChange={setCity} />
      <View style={styles.main}>
        <View style={styles.mapWrap}>
          <MapView
            style={StyleSheet.absoluteFill}
            initialRegion={INITIAL_REGION}
            mapType="standard"
          >
            {DEMO_PLACES.map((place) => (
              <Marker
                key={place.id}
                coordinate={{ latitude: place.lat, longitude: place.lng }}
                title={place.name}
                description={place.category}
                onCalloutPress={() => nav.navigate('PlaceDetail' as never, { placeId: place.id } as never)}
                onPress={() => setRouteDestination({ lat: place.lat, lng: place.lng })}
              />
            ))}
            {DEMO_EVENTS.map((ev) => (
              <Marker
                key={ev.id}
                coordinate={{ latitude: ev.lat, longitude: ev.lng }}
                title={ev.title}
                pinColor="green"
              />
            ))}
          </MapView>
        </View>
        <View style={styles.panel}>
          <ScrollView style={styles.panelScroll} contentContainerStyle={styles.panelContent} keyboardShouldPersistTaps="handled">
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
      {routeDestination && (
        <View style={styles.sheetWrap}>
          <RouteSheet
            origin={DEMO_ORIGIN}
            destination={routeDestination}
            onClose={() => setRouteDestination(null)}
          />
          <Text style={styles.dismiss} onPress={() => setRouteDestination(null)}>Close</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  main: { flex: 1, flexDirection: 'column' },
  mapWrap: { flex: 1, minHeight: 200 },
  panel: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '45%',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  panelScroll: { maxHeight: 280 },
  panelContent: { paddingBottom: 16 },
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
  sliderDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: { color: colors.white, fontSize: 16, marginTop: 12 },
  resultPanel: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 100,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  resultTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  resultTime: { fontSize: 15, color: colors.black, marginBottom: 4 },
  resultWeather: { fontSize: 14, color: colors.textMuted, marginBottom: 16 },
  resultClose: { alignSelf: 'flex-end' },
  resultCloseText: { color: colors.accent, fontWeight: '600' },
  sheetWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '40%',
  },
  dismiss: { color: colors.accent, textAlign: 'center', marginTop: 8, fontWeight: '600' },
});
