import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Place } from '../data/demo';
import { colors } from '../theme';

type Props = {
  place: Place;
  onPress?: () => void;
  elevated?: boolean;
};

export function PlaceCard({ place, onPress, elevated }: Props) {
  const price = '$'.repeat(place.priceTier);
  return (
    <View style={[styles.card, elevated && styles.cardElevated]} onTouchEnd={onPress}>
      <Text style={styles.name}>{place.name}</Text>
      <Text style={styles.meta}>{place.category} · {place.tags.slice(0, 3).join(', ')}</Text>
      <Text style={styles.price}>{price}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    marginVertical: 6,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardElevated: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  name: { fontWeight: '700', fontSize: 16, marginBottom: 4 },
  meta: { fontSize: 12, color: colors.textMuted, marginBottom: 2 },
  price: { fontSize: 12, color: colors.accent },
});
