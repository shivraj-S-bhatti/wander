import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { EventCard } from '../components/EventCard';
import { useStore } from '../state/store';

export function CommunityScreen() {
  const { state, joinEvent } = useStore();
  const events = state.events;
  const [pointsToast, setPointsToast] = useState<number | null>(null);

  const handleJoin = (eventId: string, pointsReward: number) => {
    joinEvent(eventId);
    setPointsToast(pointsReward);
    setTimeout(() => setPointsToast(null), 2500);
  };

  return (
    <View style={styles.container}>
      <AppHeader />
      <Text style={styles.subtitle}>Join events, earn civic points</Text>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            joined={item.joinedUserIds.includes('u_me')}
            onJoin={() => handleJoin(item.id, item.pointsReward)}
          />
        )}
        contentContainerStyle={styles.list}
      />
      {pointsToast !== null && (
        <View style={styles.pointsToast}>
          <Text style={styles.pointsToastText}>+{pointsToast} civic points!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  subtitle: { fontSize: 14, color: '#666', paddingHorizontal: 16, paddingBottom: 12 },
  list: { paddingBottom: 24 },
  pointsToast: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  pointsToastText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
