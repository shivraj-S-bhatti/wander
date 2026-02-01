import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { EventCard } from '../components/EventCard';
import { useStore } from '../state/store';

export function CommunityScreen() {
  const { state, joinEvent } = useStore();
  const events = state.events;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Community & volunteer</Text>
      <Text style={styles.subtitle}>Join events, earn civic points</Text>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            joined={item.joinedUserIds.includes('u_me')}
            onJoin={() => joinEvent(item.id)}
          />
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: '700', padding: 16, paddingBottom: 4 },
  subtitle: { fontSize: 14, color: '#666', paddingHorizontal: 16, paddingBottom: 12 },
  list: { paddingBottom: 24 },
});
