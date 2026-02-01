import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme';
import { getFaceSource } from '../utils/avatarFaces';
import type { Friend } from '../data/demo';

type Props = {
  friend: Friend;
  onPress?: (friend: Friend) => void;
};

export function FriendCard({ friend, onPress }: Props) {
  const initial = friend.username.charAt(0).toUpperCase();
  const faceSrc = getFaceSource(friend.avatar);

  const content = (
    <>
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
        <Text style={styles.username}>{friend.username}</Text>
        <Text style={styles.stats}>
          {friend.civicScore} pts · {friend.streak} day streak · #{friend.rank}
        </Text>
      </View>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={styles.card} onPress={() => onPress(friend)} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }
  return <View style={styles.card}>{content}</View>;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
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
  avatarWrap: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textMuted,
  },
  content: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 4,
  },
  stats: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
