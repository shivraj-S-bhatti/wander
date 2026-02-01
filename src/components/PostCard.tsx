import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CURRENT_USER_ID, DEMO_USERS } from '../data/demo';
import type { Post } from '../data/demo';
import { colors } from '../theme';
import { formatRelative } from '../utils/time';
import { getFaceSource } from '../utils/avatarFaces';

type Props = {
  post: Post;
  onPress?: () => void;
  isFriend?: boolean;
  onAddFriend?: (userId: string) => void;
};

export function PostCard({ post, onPress, isFriend, onAddFriend }: Props) {
  const user = DEMO_USERS.find((u) => u.id === post.userId);
  const userName = user?.name ?? 'Someone';
  const faceSrc = getFaceSource(user?.avatar);
  const initial = userName.charAt(0).toUpperCase();

  const content = (
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
          <Text style={styles.action}>Did {post.what} with {post.whoWith || '—'}</Text>
          {post.experience ? (
            <Text style={styles.review} numberOfLines={2}>{post.experience}</Text>
          ) : null}
          <Text style={styles.date}>{formatRelative(post.ts)}</Text>
          {post.rating > 0 && <Text style={styles.rating}>★ {post.rating}</Text>}
          {post.tags.length > 0 && (
            <View style={styles.tagRow}>
              {post.tags.slice(0, 4).map((t) => (
                <View key={t} style={styles.tagChip}>
                  <Text style={styles.tagText}>{t}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
      {post.userId !== CURRENT_USER_ID && (onAddFriend != null || isFriend) && (
        <View style={styles.actionsRow}>
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

const CARD_MAX_WIDTH = 380;

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
  action: { fontSize: 14, color: colors.black, marginBottom: 4 },
  review: { fontSize: 13, color: colors.textMuted, marginBottom: 2 },
  date: { fontSize: 12, color: colors.textMuted },
  rating: { fontSize: 12, color: colors.accent, marginTop: 4 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 6 },
  tagChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
  tagText: { fontSize: 11, color: colors.textMuted },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
