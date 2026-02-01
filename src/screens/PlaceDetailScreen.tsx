import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RouteSheet } from '../components/RouteSheet';
import { DEMO_ORIGIN, DEMO_PLACES, DEMO_REVIEWS } from '../data/demo';
import { useStore } from '../state/store';
import { formatRelative } from '../utils/time';

type StackParamList = { PlaceDetail: { placeId: string } };

export function PlaceDetailScreen() {
  const route = useRoute<RouteProp<StackParamList, 'PlaceDetail'>>();
  const nav = useNavigation();
  const { choosePlace } = useStore();
  const placeId = route.params?.placeId ?? '';
  const place = DEMO_PLACES.find((p) => p.id === placeId);
  const reviews = DEMO_REVIEWS.filter((r) => r.placeId === placeId);
  const [showRoute, setShowRoute] = useState(false);

  if (!place) {
    return (
      <View style={styles.container}>
        <Text>Place not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.name}>{place.name}</Text>
      <Text style={styles.meta}>{place.category} · {place.tags.join(', ')}</Text>
      <Text style={styles.price}>{'$'.repeat(place.priceTier)}</Text>
      {place.isLocalBusiness && <Text style={styles.local}>Local business</Text>}
      <TouchableOpacity
        style={styles.btn}
        onPress={() => {
          choosePlace(place);
          setShowRoute(true);
        }}
      >
        <Text style={styles.btnText}>Get there</Text>
      </TouchableOpacity>
      {showRoute && (
        <View style={styles.sheet}>
          <RouteSheet
            origin={DEMO_ORIGIN}
            destination={{ lat: place.lat, lng: place.lng }}
            onClose={() => setShowRoute(false)}
          />
          <TouchableOpacity onPress={() => setShowRoute(false)}>
            <Text style={styles.dismiss}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
      <Text style={styles.sectionTitle}>Reviews</Text>
      {reviews.length === 0 && <Text style={styles.empty}>No reviews yet</Text>}
      {reviews.map((r) => (
        <View key={r.id} style={styles.review}>
          <Text style={styles.reviewRating}>★ {r.rating}</Text>
          <Text style={styles.reviewText}>{r.text}</Text>
          <Text style={styles.reviewTime}>{formatRelative(r.ts)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 48 },
  name: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  meta: { fontSize: 14, color: '#666', marginBottom: 4 },
  price: { fontSize: 14, color: '#059669', marginBottom: 8 },
  local: { fontSize: 12, color: '#6366f1', marginBottom: 16 },
  btn: { backgroundColor: '#1a1a2e', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 24 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  sheet: { marginBottom: 24 },
  dismiss: { color: '#6366f1', textAlign: 'center', marginTop: 8, fontWeight: '600' },
  sectionTitle: { fontWeight: '700', fontSize: 18, marginBottom: 12 },
  empty: { color: '#999', marginBottom: 16 },
  review: { marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  reviewRating: { fontSize: 14, color: '#f59e0b', marginBottom: 4 },
  reviewText: { fontSize: 14, color: '#333', marginBottom: 4 },
  reviewTime: { fontSize: 11, color: '#999' },
});
