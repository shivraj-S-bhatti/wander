import React, { useMemo } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { useStore } from '../state/store';
import { formatDate } from '../utils/time';
import { DEMO_CHECKINS, DEMO_PLACES, DEMO_USERS } from '../data/demo';
import type { Post } from '../data/demo';

const HEATMAP_DAYS = 30;
type ActivityType = 'food' | 'active' | 'community' | 'none';

// Mock heatmap: each day has an activity type for demo
function mockHeatmapData(): ActivityType[] {
  const types: ActivityType[] = ['food', 'active', 'community', 'none'];
  return Array.from({ length: HEATMAP_DAYS }, (_, i) => {
    const r = (i * 17 + 31) % 100;
    if (r < 25) return 'food';
    if (r < 50) return 'active';
    if (r < 75) return 'community';
    return 'none';
  });
}

const HEATMAP_COLORS: Record<ActivityType, string> = {
  food: '#facc15',
  active: '#22c55e',
  community: '#3b82f6',
  none: '#e5e5e5',
};

function Heatmap({ data }: { data: ActivityType[] }) {
  const cols = 7;
  const rows = Math.ceil(data.length / cols);
  const grid = useMemo(() => {
    const out: ActivityType[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: ActivityType[] = [];
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        row.push(i < data.length ? data[i] : 'none');
      }
      out.push(row);
    }
    return out;
  }, [data, rows, cols]);

  return (
    <View style={styles.heatmapWrap}>
      <Text style={styles.heatmapTitle}>Activity</Text>
      <View style={styles.heatmapGrid}>
        {grid.map((row, r) => (
          <View key={r} style={styles.heatmapRow}>
            {row.map((cell, c) => (
              <View
                key={`${r}-${c}`}
                style={[styles.heatmapCell, { backgroundColor: HEATMAP_COLORS[cell] }]}
              />
            ))}
          </View>
        ))}
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: HEATMAP_COLORS.food }]} />
          <Text style={styles.legendText}>Food</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: HEATMAP_COLORS.active }]} />
          <Text style={styles.legendText}>Active</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: HEATMAP_COLORS.community }]} />
          <Text style={styles.legendText}>Community</Text>
        </View>
      </View>
    </View>
  );
}

function PostCard({ post }: { post: Post }) {
  const user = DEMO_USERS.find((u) => u.id === post.userId);
  return (
    <View style={styles.activityCard}>
      <View style={styles.activityCardImage} />
      <View style={styles.activityCardBody}>
        <Text style={styles.activityCardTitle}>{post.what}</Text>
        {post.whoWith ? <Text style={styles.activityCardWho}>with {post.whoWith}</Text> : null}
        <Text style={styles.activityCardDate}>{formatDate(post.ts)}</Text>
        {post.rating > 0 && <Text style={styles.activityCardRating}>★ {post.rating}</Text>}
        {post.experience ? <Text style={styles.activityCardDesc}>{post.experience}</Text> : null}
        {post.tags.length > 0 && (
          <View style={styles.activityCardTags}>
            {post.tags.map((t) => (
              <Text key={t} style={styles.activityCardTag}>{t}</Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

function CheckinCard({ checkinId }: { checkinId: string }) {
  const checkin = DEMO_CHECKINS.find((c) => c.id === checkinId);
  if (!checkin) return null;
  const user = DEMO_USERS.find((u) => u.id === checkin.userId);
  const place = DEMO_PLACES.find((p) => p.id === checkin.placeId);
  if (!user || !place) return null;
  return (
    <View style={styles.activityCard}>
      <View style={styles.activityCardImage} />
      <View style={styles.activityCardBody}>
        <Text style={styles.activityCardTitle}>{place.name}</Text>
        <Text style={styles.activityCardWho}>{checkin.type} · {place.category}</Text>
        <Text style={styles.activityCardDate}>{formatDate(checkin.ts)}</Text>
        {checkin.rating != null && <Text style={styles.activityCardRating}>★ {checkin.rating}</Text>}
        {checkin.note ? <Text style={styles.activityCardDesc}>{checkin.note}</Text> : null}
        {place.tags.length > 0 && (
          <View style={styles.activityCardTags}>
            {place.tags.slice(0, 3).map((t) => (
              <Text key={t} style={styles.activityCardTag}>{t}</Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

// Merge posts and demo checkins for "You" into one feed, sorted by ts
type FeedItem = { type: 'post'; id: string; ts: number } | { type: 'checkin'; id: string; ts: number };
function useProfileFeed(posts: Post[]): FeedItem[] {
  return useMemo(() => {
    const items: FeedItem[] = [
      ...posts.map((p) => ({ type: 'post' as const, id: p.id, ts: p.ts })),
      ...DEMO_CHECKINS.filter((c) => c.userId === 'u_me').map((c) => ({ type: 'checkin' as const, id: c.id, ts: c.ts })),
    ];
    items.sort((a, b) => b.ts - a.ts);
    return items;
  }, [posts]);
}

export function ProfileScreen() {
  const { state, getBadges, getLevel, getStreak, getNextBadgeProgress } = useStore();
  const { civicPoints } = state.profile;
  const posts = state.posts;
  const badges = getBadges();
  const level = getLevel();
  const streak = getStreak();
  const nextBadge = getNextBadgeProgress();
  const heatmapData = useMemo(() => mockHeatmapData(), []);
  const feedItems = useProfileFeed(posts);

  return (
    <View style={styles.container}>
      <AppHeader />
      <FlatList
        data={feedItems}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        ListHeaderComponent={
          <>
            <View style={styles.profileSection}>
              <View style={styles.avatar} />
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>Level {level}</Text>
              </View>
              <Text style={styles.name}>You</Text>
              <Text style={styles.location}>Boston, MA</Text>
              {streak > 0 && (
                <View style={styles.streakRow}>
                  <Text style={styles.streakEmoji}>🔥</Text>
                  <Text style={styles.streakText}>{streak}-day streak</Text>
                </View>
              )}
              <View style={styles.pointsRow}>
                <Text style={styles.pointsEmoji}>⭐</Text>
                <Text style={styles.civicPoints}>{civicPoints} civic points</Text>
              </View>
              {nextBadge && (
                <View style={styles.nextBadgeWrap}>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${(nextBadge.current / nextBadge.threshold) * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.nextBadgeLabel}>
                    {nextBadge.pointsToNext} pts to <Text style={styles.nextBadgeName}>{nextBadge.label}</Text>
                  </Text>
                </View>
              )}
              <View style={styles.badges}>
                {badges.map((b) => (
                  <View key={b.label} style={[styles.badgeChip, b.unlocked && styles.badgeChipUnlocked]}>
                    <Text style={[styles.badge, b.unlocked && styles.badgeUnlocked]}>
                      {b.unlocked ? '✓ ' : ''}{b.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
            <Heatmap data={heatmapData} />
            <Text style={styles.feedTitle}>Activity</Text>
          </>
        }
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
            <Text style={styles.emptyFeedText}>No activities yet. Make a post!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  list: { paddingBottom: 24 },
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
  levelBadge: {
    backgroundColor: '#facc15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  levelBadgeText: { fontSize: 14, fontWeight: '800', color: '#1a1a2e' },
  name: { fontSize: 22, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  location: { fontSize: 14, color: '#666', marginBottom: 8 },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  streakEmoji: { fontSize: 18 },
  streakText: { fontSize: 15, fontWeight: '600', color: '#ea580c' },
  pointsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  pointsEmoji: { fontSize: 22 },
  civicPoints: { fontSize: 20, fontWeight: '800', color: '#b45309' },
  nextBadgeWrap: { width: '100%', marginBottom: 12 },
  progressBarBg: {
    height: 8,
    backgroundColor: '#e5e5e5',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#facc15',
    borderRadius: 4,
  },
  nextBadgeLabel: { fontSize: 12, color: '#666', textAlign: 'center' },
  nextBadgeName: { fontWeight: '700', color: '#1a1a2e' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  badgeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  badgeChipUnlocked: { backgroundColor: '#dcfce7' },
  badge: { fontSize: 12, color: '#999' },
  badgeUnlocked: { color: '#059669', fontWeight: '600' },
  heatmapWrap: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
  },
  heatmapTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  heatmapGrid: {},
  heatmapRow: { flexDirection: 'row', gap: 4, marginBottom: 4 },
  heatmapCell: { flex: 1, aspectRatio: 1, borderRadius: 4, maxWidth: 24, maxHeight: 24 },
  legend: { flexDirection: 'row', gap: 16, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 12, color: '#666' },
  feedTitle: { fontSize: 18, fontWeight: '700', paddingHorizontal: 16, marginBottom: 12 },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: '#fef9c3',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#fde047',
  },
  activityCardImage: {
    width: 80,
    height: 80,
    backgroundColor: '#e5e5e5',
  },
  activityCardBody: { flex: 1, padding: 12 },
  activityCardTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a2e', marginBottom: 2 },
  activityCardWho: { fontSize: 13, color: '#666', marginBottom: 2 },
  activityCardDate: { fontSize: 12, color: '#999', marginBottom: 4 },
  activityCardRating: { fontSize: 14, color: '#b45309', marginBottom: 4 },
  activityCardDesc: { fontSize: 14, color: '#333', marginBottom: 6 },
  activityCardTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  activityCardTag: { fontSize: 12, color: '#666', backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  emptyFeed: { padding: 24, alignItems: 'center' },
  emptyFeedText: { fontSize: 15, color: '#666' },
});
