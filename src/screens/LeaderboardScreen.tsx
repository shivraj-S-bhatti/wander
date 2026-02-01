import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { LeaderboardCard } from '../components/LeaderboardCard';
import { DEMO_FRIENDS } from '../data/demo';
import { colors } from '../theme';

const sortedByRank = [...DEMO_FRIENDS].sort((a, b) => a.rank - b.rank);

export function LeaderboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>
      <FlatList
        data={sortedByRank}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <LeaderboardCard entry={item} />}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.black,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  list: { paddingBottom: 24 },
});
