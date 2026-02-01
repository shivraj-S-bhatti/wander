import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DEMO_PLACES, DEMO_USERS } from '../data/demo';
import type { Checkin } from '../data/demo';
import { colors } from '../theme';
import { formatRelative } from '../utils/time';

type Props = {
  checkin: Checkin;
  onPress?: () => void;
};

export function ActivityCard({ checkin, onPress }: Props) {
  const user = DEMO_USERS.find((u) => u.id === checkin.userId);
  const place = DEMO_PLACES.find((p) => p.id === checkin.placeId);
  if (!user || !place) return null;

  const typeLabel = checkin.type === 'volunteer' ? 'Volunteered at' : checkin.type === 'visited' ? 'Visited' : 'Was at';
  const subtitle = [place.category, place.tags.slice(0, 2).join(', ')].filter(Boolean).join(' · ');

  return (
    <View style={styles.card} onTouchEnd={onPress}>
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.action}>{typeLabel} {place.name}</Text>
      <Text style={styles.meta}>{subtitle}</Text>
      <Text style={styles.time}>{formatRelative(checkin.ts)}</Text>
      {checkin.rating != null && <Text style={styles.rating}>★ {checkin.rating}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  name: { fontWeight: '700', fontSize: 16, marginBottom: 2 },
  action: { fontSize: 15, color: colors.black, marginBottom: 4 },
  meta: { fontSize: 12, color: colors.textMuted, marginBottom: 2 },
  time: { fontSize: 11, color: colors.textMuted },
  rating: { fontSize: 12, color: colors.accent, marginTop: 4 },
});
