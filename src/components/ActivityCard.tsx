import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DEMO_PLACES, DEMO_USERS } from '../data/demo';
import type { Checkin, CheckinBadge } from '../data/demo';
import { colors } from '../theme';
import { formatRelative } from '../utils/time';
import { getFaceSource } from '../utils/avatarFaces';

const BADGE_ICONS: Record<CheckinBadge, keyof typeof Ionicons.glyphMap> = {
  'Local business': 'storefront-outline',
  'Volunteer': 'heart-outline',
  'Organized hangout': 'people-outline',
  'Public transport': 'bus-outline',
};

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
  const faceSrc = getFaceSource(user.avatar);
  const initial = user.name.charAt(0).toUpperCase();
  const badges: CheckinBadge[] = checkin.badges ?? [];
  if (badges.length === 0) {
    if (place.isLocalBusiness) badges.push('Local business');
    if (checkin.type === 'volunteer') badges.push('Volunteer');
    if (checkin.type === 'hangout') badges.push('Organized hangout');
  }

  return (
    <View style={styles.card} onTouchEnd={onPress}>
      <View style={styles.row}>
        <View style={styles.avatarWrap}>
          {faceSrc != null ? (
            <Image
              source={typeof faceSrc === 'number' ? faceSrc : faceSrc}
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
          )}
        </View>
        <View style={styles.content}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.action}>{typeLabel} {place.name}</Text>
          <Text style={styles.meta}>{subtitle}</Text>
          <Text style={styles.time}>{formatRelative(checkin.ts)}</Text>
          {checkin.rating != null && <Text style={styles.rating}>★ {checkin.rating}</Text>}
          {badges.length > 0 && (
            <View style={styles.badgesRow}>
              {badges.map((b) => (
                <View key={b} style={styles.badgeChip}>
                  <Ionicons name={BADGE_ICONS[b]} size={12} color="#C9A227" style={styles.badgeIcon} />
                  <Text style={styles.badgeText}>{b}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
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
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  avatarWrap: { marginRight: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { fontSize: 16, fontWeight: '600', color: colors.textMuted },
  content: { flex: 1 },
  name: { fontWeight: '700', fontSize: 16, marginBottom: 2 },
  action: { fontSize: 15, color: colors.black, marginBottom: 4 },
  meta: { fontSize: 12, color: colors.textMuted, marginBottom: 2 },
  time: { fontSize: 11, color: colors.textMuted },
  rating: { fontSize: 12, color: colors.accent, marginTop: 4 },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  badgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(201, 162, 39, 0.15)',
    borderWidth: 1,
    borderColor: '#C9A227',
    marginRight: 6,
    marginBottom: 4,
  },
  badgeIcon: { marginRight: 4 },
  badgeText: { fontSize: 11, fontWeight: '600', color: colors.black },
});
