import { useNavigation } from '@react-navigation/native';
import React, { useMemo } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CURRENT_USER_ID, DEMO_USERS } from '../data/demo';
import type { Post } from '../data/demo';
import { useStore } from '../state/store';
import { ActivityHeatmap, CheckinCard, PostCard, useProfileFeed } from './ProfileFeed';

type Props = {
  userId: string;
  isOwnProfile: boolean;
};

function deriveHandle(name: string, id: string): string {
  if (id === CURRENT_USER_ID) return '@you';
  return '@' + name.toLowerCase().replace(/\s/g, '');
}

export function ProfileLayout({ userId, isOwnProfile }: Props) {
  const navigation = useNavigation();
  const { state, getBadges, getLevel, getStreak, getNextBadgeProgress } = useStore();

  const user = useMemo(() => DEMO_USERS.find((u) => u.id === userId) ?? { id: userId, name: 'Unknown' }, [userId]);
  const posts = useMemo(() => state.posts.filter((p) => p.userId === userId), [state.posts, userId]);
  const feedItems = useProfileFeed(posts, userId);

  const civicPoints = isOwnProfile ? state.profile.civicPoints : 0;
  const level = isOwnProfile ? getLevel() : 1;
  const streak = isOwnProfile ? getStreak() : 0;
  const nextBadge = isOwnProfile ? getNextBadgeProgress() : null;
  const badges = isOwnProfile ? getBadges() : [{ label: 'Local Supporter', unlocked: false }, { label: 'Cleanup Crew', unlocked: false }, { label: 'Community Builder', unlocked: false }];

  const handle = user.handle ?? deriveHandle(user.name, user.id);
  const memberSince = user.memberSince ?? 'Member since Jan 2024';

  const ListHeader = (
    <>
      {!isOwnProfile && (
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
            <Text style={styles.headerBackText}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerName} numberOfLines={1}>{user.name}</Text>
          <View style={styles.headerRight}>
            <Text style={styles.headerIcon}>↗</Text>
            <Text style={styles.headerIcon}>⋯</Text>
          </View>
        </View>
      )}
      <View style={styles.profileSection}>
        <View style={styles.avatar} />
        <Text style={styles.handle}>{handle}</Text>
        <Text style={styles.memberSince}>{memberSince}</Text>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>{isOwnProfile ? 'Edit profile' : 'Following'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{civicPoints}</Text>
          <Text style={styles.statLabel}>Civic points</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>Day streak</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>#{level}</Text>
          <Text style={styles.statLabel}>Rank on Wander</Text>
        </View>
      </View>
      <View style={styles.categoryRow}>
        <Text style={styles.categoryIcon}>✓</Text>
        <Text style={styles.categoryLabel}>Been</Text>
        <Text style={styles.categoryCount}>{posts.length}</Text>
        <Text style={styles.categoryChevron}>{'>'}</Text>
      </View>
      <View style={styles.categoryRow}>
        <Text style={styles.categoryIcon}>🔖</Text>
        <Text style={styles.categoryLabel}>Want to Try</Text>
        <Text style={styles.categoryCount}>0</Text>
        <Text style={styles.categoryChevron}>{'>'}</Text>
      </View>
      <View style={styles.categoryRow}>
        <Text style={styles.categoryIcon}>♥</Text>
        <Text style={styles.categoryLabel}>Recs for You</Text>
        <Text style={styles.categoryChevron}>{'>'}</Text>
      </View>
      <View style={styles.cardsRow}>
        <View style={styles.gamificationCard}>
          <Text style={styles.cardIcon}>🏆</Text>
          <Text style={styles.cardLabel}>Rank on Wander</Text>
          <Text style={styles.cardValue}>#{level}</Text>
        </View>
        <View style={styles.gamificationCard}>
          <Text style={styles.cardIcon}>🔥</Text>
          <Text style={styles.cardLabel}>Current Streak</Text>
          <Text style={styles.cardValue}>{streak} {streak === 1 ? 'day' : 'days'}</Text>
        </View>
      </View>
      {nextBadge && (
        <View style={styles.progressBlock}>
          <Text style={styles.progressTitle}>Progress to next badge</Text>
          <Text style={styles.progressValue}>{nextBadge.pointsToNext} pts to {nextBadge.label}</Text>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${(nextBadge.current / nextBadge.threshold) * 100}%` },
              ]}
            />
          </View>
        </View>
      )}
      <View style={styles.badgesRow}>
        {badges.map((b) => (
          <View key={b.label} style={[styles.badgeChip, b.unlocked && styles.badgeChipUnlocked]}>
            <Text style={[styles.badgeText, b.unlocked && styles.badgeTextUnlocked]}>
              {b.unlocked ? '✓ ' : ''}{b.label}
            </Text>
          </View>
        ))}
      </View>
      <ActivityHeatmap posts={posts} userId={userId} />
      <Text style={styles.feedTitle}>Recent Activity</Text>
    </>
  );

  return (
    <FlatList
      data={feedItems}
      keyExtractor={(item) => `${item.type}-${item.id}`}
      ListHeaderComponent={ListHeader}
      renderItem={({ item }) => {
        if (item.type === 'post') {
          const post = posts.find((p) => p.id === item.id);
          return post ? <PostCard post={post} /> : null;
        }
        return <CheckinCard checkinId={item.id} />;
      }}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <View style={styles.emptyFeed}>
          <Text style={styles.emptyFeedText}>
            {isOwnProfile ? 'No activities yet. Make a post!' : 'No activities yet.'}
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerBack: { padding: 8, marginLeft: -8 },
  headerBackText: { fontSize: 20, color: '#333', fontWeight: '600' },
  headerName: { flex: 1, fontSize: 18, fontWeight: '700', color: '#1a1a2e', textAlign: 'center' },
  headerRight: { flexDirection: 'row', gap: 16 },
  headerIcon: { fontSize: 18, color: '#333' },
  list: { paddingBottom: 24, backgroundColor: '#f5f5f5' },
  profileSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e5e5e5',
    marginBottom: 12,
  },
  handle: { fontSize: 16, fontWeight: '600', color: '#1a1a2e', marginBottom: 4 },
  memberSince: { fontSize: 12, color: '#666', marginBottom: 12 },
  actionBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  actionBtnText: { fontSize: 14, fontWeight: '600', color: '#333' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-around',
  },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: '#1a1a2e' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  categoryIcon: { fontSize: 18, marginRight: 12 },
  categoryLabel: { flex: 1, fontSize: 15, color: '#1a1a2e', fontWeight: '500' },
  categoryCount: { fontSize: 14, color: '#666', marginRight: 8 },
  categoryChevron: { fontSize: 14, color: '#999' },
  cardsRow: { flexDirection: 'row', gap: 12, marginHorizontal: 16, marginBottom: 16 },
  gamificationCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardIcon: { fontSize: 24, marginBottom: 8 },
  cardLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
  cardValue: { fontSize: 18, fontWeight: '700', color: '#1a1a2e' },
  progressBlock: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  progressTitle: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  progressValue: { fontSize: 13, color: '#666', marginBottom: 12 },
  progressBarBg: { height: 8, backgroundColor: '#e5e5e5', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#facc15', borderRadius: 4 },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginHorizontal: 16, marginBottom: 16 },
  badgeChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: '#f5f5f5' },
  badgeChipUnlocked: { backgroundColor: '#dcfce7' },
  badgeText: { fontSize: 12, color: '#666' },
  badgeTextUnlocked: { color: '#059669', fontWeight: '600' },
  feedTitle: { fontSize: 18, fontWeight: '700', paddingHorizontal: 16, marginBottom: 12 },
  emptyFeed: { padding: 24, alignItems: 'center' },
  emptyFeedText: { fontSize: 15, color: '#666' },
});
