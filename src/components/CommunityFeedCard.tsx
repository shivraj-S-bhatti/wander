import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { formatRelative } from '../utils/time';
import { getFaceSource } from '../utils/avatarFaces';
import type { Checkin, CheckinBadge } from '../data/demo';

const BADGE_ICONS: Record<CheckinBadge, keyof typeof Ionicons.glyphMap> = {
  'Local business': 'storefront-outline',
  'Volunteer': 'heart-outline',
  'Organized hangout': 'people-outline',
  'Public transport': 'bus-outline',
};

type Props = {
  checkin: Checkin;
  placeName: string;
  userName: string;
  avatarFaceKey?: string;
  activityImageSource?: number;
  userId?: string;
  isFriend?: boolean;
  onAddFriend?: (userId: string) => void;
};

export function CommunityFeedCard({ checkin, placeName, userName, avatarFaceKey, activityImageSource, userId, isFriend, onAddFriend }: Props) {
  const review = checkin.note ?? '';
  const rating = checkin.rating != null ? checkin.rating.toFixed(1) : null;
  const faceSrc = getFaceSource(avatarFaceKey);
  const initial = userName.charAt(0).toUpperCase();
  const badges = checkin.badges ?? [];

  return (
    <View style={styles.card}>
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
        <View style={styles.main}>
          <Text style={styles.name}>{userName}</Text>
          {review ? <Text style={styles.review} numberOfLines={2}>{review}</Text> : null}
          <Text style={styles.place}>{placeName}</Text>
          <Text style={styles.date}>{formatRelative(checkin.ts)}</Text>
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
        {rating != null && (
          <View style={styles.ratingCircle}>
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        )}
      </View>
      {activityImageSource != null && (
        <Image source={activityImageSource} style={styles.activityImage} resizeMode="cover" />
      )}
      <View style={styles.actionsRow}>
        <View style={styles.actionItem}>
          <Ionicons name="heart-outline" size={18} color={colors.textMuted} />
          <Text style={styles.actionText}>12</Text>
        </View>
        <View style={styles.actionItem}>
          <Ionicons name="chatbubble-outline" size={18} color={colors.textMuted} />
          <Text style={styles.actionText}>3</Text>
        </View>
      </View>
    </View>
  );
}

const CARD_MAX_WIDTH = 380;
const ACTIVITY_IMAGE_HEIGHT = 140;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    maxWidth: CARD_MAX_WIDTH,
    alignSelf: 'center',
    width: '100%',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
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
  main: { flex: 1 },
  name: { fontWeight: '700', fontSize: 16, marginBottom: 4 },
  review: { fontSize: 14, color: colors.black, marginBottom: 4 },
  place: { fontSize: 13, color: colors.textMuted, marginBottom: 2 },
  date: { fontSize: 12, color: colors.textMuted },
  ratingCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  ratingText: { fontSize: 14, fontWeight: '700', color: colors.white },
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
  activityImage: {
    width: '100%',
    height: ACTIVITY_IMAGE_HEIGHT,
    borderRadius: 12,
    marginTop: 12,
    backgroundColor: colors.border,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    fontSize: 13,
    color: colors.textMuted,
    marginLeft: 4,
  },
  addFriendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  addFriendText: { fontSize: 12, fontWeight: '600', color: colors.accent, marginLeft: 4 },
  friendsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
});
