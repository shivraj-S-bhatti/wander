import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { getFaceSource } from '../utils/avatarFaces';
import type { Friend } from '../data/demo';

type Props = {
  entry: Friend;
};

export function LeaderboardCard({ entry }: Props) {
  const initial = entry.username.charAt(0).toUpperCase();
  const faceSrc = getFaceSource(entry.avatar);

  return (
    <View style={styles.card}>
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
        <Text style={styles.username}>{entry.username}</Text>
        <Text style={styles.stats}>
          {entry.civicScore} pts · {entry.streak} day streak
        </Text>
      </View>
      <View style={styles.rankWrap}>
        {entry.rank <= 3 && (
          <Ionicons
            name="trophy"
            size={18}
            color={entry.rank === 1 ? '#C9A227' : entry.rank === 2 ? '#C0C0C0' : '#CD7F32'}
            style={styles.rankIcon}
          />
        )}
        <Text style={styles.rank}>#{entry.rank}</Text>
      </View>
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
  rankWrap: { alignItems: 'flex-end' },
  rankIcon: { marginBottom: 2 },
  rank: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.accent,
  },
});
