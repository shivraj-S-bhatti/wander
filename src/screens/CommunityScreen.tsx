import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppHeader } from '../components/AppHeader';
import { EventCard } from '../components/EventCard';
import { useStore } from '../state/store';
import { colors } from '../theme';
import type { RootStackParamList } from '../../App';

type CommunityNavProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export function CommunityScreen() {
  const navigation = useNavigation<CommunityNavProp>();
  const { state, joinEvent } = useStore();
  const events = state.events;
  const [pointsToast, setPointsToast] = useState<number | null>(null);

  const handleJoin = (eventId: string, pointsReward: number) => {
    joinEvent(eventId);
    setPointsToast(pointsReward);
    setTimeout(() => setPointsToast(null), 2500);
  };

  const openLeaderboard = () => {
    navigation.navigate('Leaderboard');
  };

  return (
    <View style={styles.container}>
      <AppHeader subtitle="Join events, earn civic points" />
      <TouchableOpacity
        style={styles.leaderboardButton}
        onPress={openLeaderboard}
        accessibilityLabel="View leaderboard"
        accessibilityRole="button"
      >
        <Ionicons name="podium-outline" size={20} color={colors.white} />
        <Text style={styles.leaderboardButtonText}>View leaderboard</Text>
      </TouchableOpacity>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            joined={item.joinedUserIds.includes('u_me')}
            onJoin={() => handleJoin(item.id, item.pointsReward)}
            elevated
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
  container: { flex: 1, backgroundColor: colors.background },
  leaderboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: colors.accent,
  },
  leaderboardButtonText: { fontSize: 16, fontWeight: '600', color: colors.white },
  list: { paddingBottom: 24 },
  pointsToast: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  pointsToastText: { fontSize: 16, fontWeight: '700', color: colors.white },
});
