import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CURRENT_USER_ID, DEMO_USERS } from '../data/demo';
import type { CheckinBadge, Post } from '../data/demo';
import { colors } from '../theme';
import { formatRelative } from '../utils/time';
import { getFaceSource } from '../utils/avatarFaces';

const BADGE_ICONS: Record<CheckinBadge, keyof typeof Ionicons.glyphMap> = {
  'Local business': 'storefront-outline',
  'Volunteer': 'heart-outline',
  'Organized hangout': 'people-outline',
  'Public transport': 'bus-outline',
};

const CARD_MAX_WIDTH = 380;
const ACTIVITY_IMAGE_HEIGHT = 220;

type Props = {
  post: Post;
  onPress?: () => void;
  isFriend?: boolean;
  onAddFriend?: (userId: string) => void;
  onDelete?: () => void;
};

export function PostCard({ post, onPress, isFriend, onAddFriend, onDelete }: Props) {
  const user = DEMO_USERS.find((u) => u.id === post.userId);
  const userName = user?.name ?? 'Someone';
  const faceSrc = getFaceSource(user?.avatar);
  const initial = userName.charAt(0).toUpperCase();
  const ratingDisplay = post.rating > 0 ? post.rating.toFixed(1) : null;
  const badges = post.badges ?? [];
  const mainImageUri = post.imageUris?.[0];

  const content = (
    <View style={styles.card}>
      {onDelete != null && (
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={(e) => {
            e?.stopPropagation?.();
            onDelete();
          }}
          accessibilityLabel="Delete post"
          accessibilityRole="button"
        >
          <Ionicons name="trash-outline" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      )}
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
          <Text style={styles.title} numberOfLines={2}>{post.what}</Text>
          {post.placeName ? (
            <Text style={styles.place} numberOfLines={1}>{post.placeName}</Text>
          ) : null}
          <Text style={styles.date}>{formatRelative(post.ts)}</Text>
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
        {ratingDisplay != null && (
          <View style={styles.ratingCircle}>
            <Text style={styles.ratingText}>{ratingDisplay}</Text>
          </View>
        )}
      </View>
      {mainImageUri != null && (
        <Image source={{ uri: mainImageUri }} style={styles.activityImage} resizeMode="cover" />
      )}
      <View style={styles.actionsRow}>
        <View style={styles.actionItem}>
          <Ionicons name="heart-outline" size={18} color={colors.textMuted} />
          <Text style={styles.actionText}>0</Text>
        </View>
        <View style={styles.actionItem}>
          <Ionicons name="chatbubble-outline" size={18} color={colors.textMuted} />
          <Text style={styles.actionText}>0</Text>
        </View>
      </View>
      {post.userId !== CURRENT_USER_ID && (onAddFriend != null || isFriend) && (
        <View style={styles.addFriendRow}>
          {onAddFriend != null && !isFriend && (
            <TouchableOpacity
              style={styles.addFriendBtn}
              onPress={() => onAddFriend(post.userId)}
              accessibilityLabel="Add friend"
              accessibilityRole="button"
            >
              <Ionicons name="person-add-outline" size={18} color={colors.accent} />
              <Text style={styles.addFriendText}>Add friend</Text>
            </TouchableOpacity>
          )}
          {isFriend && (
            <View style={styles.friendsLabel}>
              <Ionicons name="checkmark-circle" size={18} color={colors.textMuted} />
              <Text style={styles.friendsText}>Friends</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress} activeOpacity={0.8}>{content}</TouchableOpacity>;
  }
  return content;
}

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
    position: 'relative',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    padding: 6,
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
  main: { flex: 1, minWidth: 0 },
  name: { fontWeight: '700', fontSize: 16, marginBottom: 2 },
  title: { fontWeight: '600', fontSize: 15, color: colors.black, marginBottom: 2 },
  place: { fontSize: 13, color: colors.textMuted, marginBottom: 2 },
  date: { fontSize: 12, color: colors.textMuted },
  ratingCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
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
  addFriendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  addFriendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  addFriendText: { fontSize: 12, fontWeight: '600', color: colors.accent },
  friendsLabel: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  friendsText: { fontSize: 13, color: colors.textMuted },
});
