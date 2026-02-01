import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { LeaderboardCard } from '../components/LeaderboardCard';
import { CURRENT_USER_ID, DEMO_FRIENDS } from '../data/demo';
import type { Friend } from '../data/demo';
import { useStore } from '../state/store';
import { colors } from '../theme';

const LEADERBOARD_DEMO_ORDER = ['u_1', 'u_4', 'u_me', 'u_2', 'u_5', 'u_3', 'u_6'];

function buildOrderedLeaderboard(currentUserEntry: Friend): Friend[] {
  const byId = new Map<string, Friend>();
  DEMO_FRIENDS.forEach((f) => byId.set(f.id, f));
  byId.set(currentUserEntry.id, currentUserEntry);
  return LEADERBOARD_DEMO_ORDER.map((id, index) => {
    const entry = byId.get(id);
    if (!entry) return null;
    return { ...entry, rank: index + 1 };
  }).filter((e): e is Friend => e != null);
}

export function LeaderboardScreen() {
  const { state, addDemoFriend, getStreak } = useStore();
  const demoFriendIds = state.demoFriendIds;

  const currentUserEntry: Friend = useMemo(
    () => ({
      id: CURRENT_USER_ID,
      username: 'Jordan Lee',
      avatar: 'guy4',
      civicScore: state.profile.civicPoints,
      streak: getStreak(),
      rank: 0,
    }),
    [state.profile.civicPoints, getStreak]
  );

  const orderedList = useMemo(
    () => buildOrderedLeaderboard(currentUserEntry),
    [currentUserEntry]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>
      <FlatList
        data={orderedList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LeaderboardCard
            entry={item}
            isFriend={demoFriendIds.includes(item.id)}
            onAddFriend={item.id !== CURRENT_USER_ID ? () => addDemoFriend(item.id) : undefined}
          />
        )}
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
