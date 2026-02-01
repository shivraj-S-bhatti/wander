import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppHeader } from '../components/AppHeader';
import { VolunteerCard } from '../components/VolunteerCard';
import { CommunityFeedCard } from '../components/CommunityFeedCard';
import { useStore } from '../state/store';
import { DEMO_CHECKINS, DEMO_PLACES, DEMO_USERS } from '../data/demo';
import { getFeedImage } from '../utils/feedImages';
import { colors } from '../theme';
import type { RootStackParamList } from '../../App';
import type { Checkin } from '../data/demo';

type CommunityNavProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

const feedCheckins = [...DEMO_CHECKINS].sort((a, b) => b.ts - a.ts);

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

  const renderFeedItem = ({ item }: { item: Checkin }) => {
    const place = DEMO_PLACES.find((p) => p.id === item.placeId);
    const user = DEMO_USERS.find((u) => u.id === item.userId);
    if (!place || !user) return null;
    return (
      <CommunityFeedCard
        checkin={item}
        placeName={place.name}
        userName={user.name}
        avatarFaceKey={user.avatar}
        activityImageSource={getFeedImage(item.id)}
      />
    );
  };

  const ListHeader = useMemo(
    () => (
      <>
        <AppHeader />
        <Text style={styles.sectionTitle}>Volunteer!</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}
        >
          {events.map((item) => (
            <VolunteerCard
              key={item.id}
              event={item}
              joined={item.joinedUserIds.includes('u_me')}
              onJoin={() => handleJoin(item.id, item.pointsReward)}
            />
          ))}
        </ScrollView>
        <Text style={styles.sectionTitle}>Your Feed</Text>
      </>
    ),
    [events]
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={feedCheckins}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        renderItem={renderFeedItem}
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity
        style={styles.leaderboardFab}
        onPress={openLeaderboard}
        accessibilityLabel="View leaderboard"
        accessibilityRole="button"
      >
        <Ionicons name="podium-outline" size={24} color={colors.white} />
        <Text style={styles.leaderboardFabText}>Leaderboard</Text>
      </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    color: colors.black,
  },
  carousel: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  list: { paddingBottom: 80 },
  leaderboardFab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.accent,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  leaderboardFabText: { fontSize: 14, fontWeight: '600', color: colors.white },
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
