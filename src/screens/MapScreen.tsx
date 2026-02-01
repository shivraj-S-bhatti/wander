import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { AppHeader } from '../components/AppHeader';
import { PlaceCard } from '../components/PlaceCard';
import { RouteSheet } from '../components/RouteSheet';
import { getCityById } from '../data/cities';
import { useStore } from '../state/store';
import { colors } from '../theme';

const getInitialRegion = (lat: number, lng: number) => ({
  latitude: lat,
  longitude: lng,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
});

const HOME_MARKER_COLOR = '#2563EB'; // blue — distinct from red accent and green events

export function MapScreen() {
  const nav = useNavigation();
  const { state, setOpenPlanModal, setSelectedCity } = useStore();
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const hasActivePlan = state.plan.activePlan != null;
  const selectedCityId = state.city.selectedCityId;
  const city = getCityById(selectedCityId) ?? getCityById('san_francisco')!;
  const mapRef = useRef<MapView>(null);

  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
  const [listSearch, setListSearch] = useState('');
  const [routeDestination, setRouteDestination] = useState<{ lat: number; lng: number } | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const region = getInitialRegion(city.center.lat, city.center.lng);
    mapRef.current.animateToRegion(region, 400);
  }, [selectedCityId, mapReady, city.center.lat, city.center.lng]);

  const listPlaces = listSearch.trim()
    ? city.places.filter(
        (p) =>
          p.name.toLowerCase().includes(listSearch.trim().toLowerCase()) ||
          p.category.toLowerCase().includes(listSearch.trim().toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(listSearch.trim().toLowerCase()))
      )
    : city.places;

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
          <FlatList
            data={listPlaces}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
<PlaceCard
                  place={item}
                  onPress={() => nav.navigate('PlaceDetail' as never, { placeId: item.id } as never)}
                  elevated
                />
            )}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      ) : (
        <View style={styles.main}>
          <View style={styles.mapWrap}>
            <MapView
              ref={mapRef}
              style={StyleSheet.absoluteFill}
              initialRegion={getInitialRegion(city.center.lat, city.center.lng)}
              mapType="standard"
              onMapReady={() => setMapReady(true)}
            >
              <Marker
                key="home"
                identifier="home"
                coordinate={{ latitude: city.origin.lat, longitude: city.origin.lng }}
                title="You"
                description="Home"
                pinColor={HOME_MARKER_COLOR}
                tracksViewChanges={false}
              />
              {city.places.map((place) => (
                <Marker
                  key={place.id}
                  identifier={place.id}
                  coordinate={{ latitude: place.lat, longitude: place.lng }}
                  title={place.name}
                  description={place.category}
                  tracksViewChanges={false}
                  onCalloutPress={() => nav.navigate('PlaceDetail' as never, { placeId: place.id } as never)}
                  onPress={() => setRouteDestination({ lat: place.lat, lng: place.lng })}
                />
              ))}
              {city.events.map((ev) => (
                <Marker
                  key={ev.id}
                  identifier={ev.id}
                  coordinate={{ latitude: ev.lat, longitude: ev.lng }}
                  title={ev.title}
                  pinColor="green"
                  tracksViewChanges={false}
                />
              ))}
            </MapView>
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
      {routeDestination && (
        <View style={styles.sheetWrap}>
          <RouteSheet
            origin={city.origin}
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
  container: { flex: 1, backgroundColor: colors.background, overflow: 'hidden' },
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
  listContent: { padding: 16, paddingBottom: 24 },
  main: { flex: 1, flexDirection: 'column', overflow: 'hidden' },
  mapWrap: { flex: 1, minHeight: 200, overflow: 'hidden' },
  fab: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
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
    elevation: 6,
  },
  fabLabel: { fontSize: 16, fontWeight: '700', color: colors.white },
  fabActivePlan: { backgroundColor: '#F97316' },
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
