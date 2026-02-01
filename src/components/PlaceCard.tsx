import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Place } from '../data/demo';

type Props = {
  place: Place;
  onPress?: () => void;
};

export function PlaceCard({ place, onPress }: Props) {
  const price = '$'.repeat(place.priceTier);
  return (
    <View style={styles.card} onTouchEnd={onPress}>
      <Text style={styles.name}>{place.name}</Text>
      <Text style={styles.meta}>{place.category} · {place.tags.slice(0, 3).join(', ')}</Text>
      <Text style={styles.price}>{price}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  name: { fontWeight: '700', fontSize: 16, marginBottom: 4 },
  meta: { fontSize: 12, color: '#666', marginBottom: 2 },
  price: { fontSize: 12, color: '#059669' },
});
