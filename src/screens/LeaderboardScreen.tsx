import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { LeaderboardCard } from '../components/LeaderboardCard';
import { CURRENT_USER_ID, DEMO_FRIENDS } from '../data/demo';
import { useStore } from '../state/store';
import { colors } from '../theme';

const sortedByRank = [...DEMO_FRIENDS].sort((a, b) => a.rank - b.rank);

export function LeaderboardScreen() {
  const { state, addDemoFriend } = useStore();
  const demoFriendIds = state.demoFriendIds;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>
      <FlatList
        data={sortedByRank}
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
