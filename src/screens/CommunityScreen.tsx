import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppHeader } from '../components/AppHeader';
import { PlanHeaderButton } from '../components/PlanHeaderButton';
import { VolunteerCard } from '../components/VolunteerCard';
import { CommunityFeedCard } from '../components/CommunityFeedCard';
import { PostCard } from '../components/PostCard';
import { useStore } from '../state/store';
import { CURRENT_USER_ID, DEMO_CHECKINS, DEMO_PLACES, DEMO_USERS } from '../data/demo';
import { getFeedImage } from '../utils/feedImages';
import { colors } from '../theme';
import type { RootStackParamList } from '../../App';
import type { Checkin, Post } from '../data/demo';

type CommunityNavProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

type FeedItem =
  | { type: 'checkin'; id: string; ts: number; data: Checkin }
  | { type: 'post'; id: string; ts: number; data: Post };

export function CommunityScreen() {
  const navigation = useNavigation<CommunityNavProp>();
  const { state, joinEvent, addDemoFriend, setOpenPlanModal, setPendingEventId } = useStore();
  const events = state.events;
  const demoFriendIds = state?.demoFriendIds ?? [];
  const [pointsToast, setPointsToast] = useState<number | null>(null);
  const hasActivePlan = state.plan.activePlan != null;
  const onPlanHeaderPress = useCallback(() => setOpenPlanModal(true), [setOpenPlanModal]);
  const handleJoin = useCallback(
    (eventId: string, pointsReward: number) => {
      joinEvent(eventId);
      setPointsToast(pointsReward);
      setTimeout(() => setPointsToast(null), 2000);
    },
    [joinEvent]
  );
  const handleVolunteerPress = useCallback(
    (event: { id: string }) => {
      setPendingEventId(event.id);
      setOpenPlanModal(true);
    },
    [setPendingEventId, setOpenPlanModal]
  );

  const feedItems: FeedItem[] = useMemo(() => {
    const checkinItems: FeedItem[] = DEMO_CHECKINS.map((c) => ({
      type: 'checkin' as const,
      id: c.id,
      ts: c.ts,
      data: c,
    }));
    const postItems: FeedItem[] = state.posts
      .filter((p) => p.userId !== CURRENT_USER_ID)
      .map((p) => ({
        type: 'post' as const,
        id: p.id,
        ts: p.ts,
        data: p,
      }));
    return [...checkinItems, ...postItems].sort((a, b) => b.ts - a.ts);
  }, [state.posts]);

  const openLeaderboard = () => {
    navigation.navigate('Leaderboard');
  };

  const renderFeedItem = ({ item }: { item: FeedItem }) => {
    if (item.type === 'post') {
      return (
        <PostCard
          post={item.data}
          onPress={() =>
            item.data.userId === 'u_me'
              ? navigation.navigate('MainTabs', { screen: 'Profile' })
              : navigation.navigate('ProfileDetail', { userId: item.data.userId })
          }
          isFriend={demoFriendIds.includes(item.data.userId)}
          onAddFriend={
            item.data.userId !== 'u_me' ? () => addDemoFriend(item.data.userId) : undefined
          }
        />
      );
    }
    const place = DEMO_PLACES.find((p) => p.id === item.data.placeId);
    const user = DEMO_USERS.find((u) => u.id === item.data.userId);
    if (!place || !user) return null;
    return (
      <CommunityFeedCard
        checkin={item.data}
        placeName={place.name}
        userName={user.name}
        avatarFaceKey={user.avatar}
        activityImageSource={getFeedImage(item.data.id)}
        userId={item.data.userId}
        isFriend={demoFriendIds.includes(item.data.userId)}
        onAddFriend={
          item.data.userId !== 'u_me' ? () => addDemoFriend(item.data.userId) : undefined
        }
      />
    );
  };

  const planHeaderButton = (
    <PlanHeaderButton hasActivePlan={hasActivePlan} onPress={onPlanHeaderPress} />
  );

  const ListHeader = useMemo(
    () => (
      <>
        <AppHeader centerElement={planHeaderButton} />
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
              onPress={() => handleVolunteerPress(item)}
            />
          ))}
        </ScrollView>
        <Text style={styles.sectionTitle}>Your Feed</Text>
      </>
    ),
    [events, hasActivePlan, planHeaderButton, handleJoin, handleVolunteerPress]
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={feedItems}
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
