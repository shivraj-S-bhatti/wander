import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import type { Friend } from '../data/demo';

type Props = {
  entry: Friend;
};

export function LeaderboardCard({ entry }: Props) {
  const initial = entry.username.charAt(0).toUpperCase();
  const hasAvatar = entry.avatar != null && entry.avatar.length > 0;

  return (
    <View style={styles.card}>
      <View style={styles.avatarWrap}>
        {hasAvatar ? (
          <Image source={{ uri: entry.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.username}>{entry.username}</Text>
        <Text style={styles.stats}>
          {entry.civicScore} pts · {entry.streak} day streak
        </Text>
      </View>
      <Text style={styles.rank}>#{entry.rank}</Text>
    </View>
  );
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
  rank: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.accent,
  },
});
