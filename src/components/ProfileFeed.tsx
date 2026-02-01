import React, { useCallback, useMemo, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { formatDate } from '../utils/time';
import { DEMO_CHECKINS, DEMO_PLACES, DEMO_USERS } from '../data/demo';
import type { Post } from '../data/demo';
import { colors } from '../theme';

const HEATMAP_COLORS = [colors.background, 'rgba(255,65,54,0.2)', 'rgba(255,65,54,0.4)', 'rgba(255,65,54,0.6)', colors.accent] as const;
const WEEKS = 53;
const ROWS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;
const CELL_SIZE = 10;
const GAP = 2;
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function hoursToLevel(hours: number): 0 | 1 | 2 | 3 | 4 {
  if (hours <= 0) return 0;
  if (hours <= 0.5) return 1;
  if (hours <= 1.5) return 2;
  if (hours <= 3) return 3;
  return 4;
}

function dateKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function buildHoursByDay(posts: Post[], userId: string): Record<string, number> {
  const out: Record<string, number> = {};
  const sorted = [...posts].filter((p) => p.userId === userId).sort((a, b) => a.ts - b.ts);
  for (const p of sorted) {
    const key = dateKey(p.ts);
    if (out[key] == null) out[key] = p.hoursSpent ?? 1;
  }
  // Seed some red cells so the activity graph is never empty
  const now = Date.now();
  const today = startOfDay(now);
  for (let i = 0; i < 60; i++) {
    const d = today - i * DAY_MS;
    const key = dateKey(d);
    if (out[key] == null) {
      if (i % 5 === 0 || i % 7 === 2) out[key] = 1.5;
      else if (i % 4 === 1) out[key] = 0.5;
      else if (i % 6 === 3) out[key] = 2.5;
    }
  }
  return out;
}

export function ActivityHeatmap({ posts, userId }: { posts: Post[]; userId: string }) {
  const { grid, monthLabels } = useMemo(() => {
    const now = Date.now();
    const today = startOfDay(now);
    const startDate = new Date(today - (WEEKS * ROWS - 1) * DAY_MS);
    startDate.setHours(0, 0, 0, 0);
    const startDateTs = startDate.getTime();
    const hoursByDay = buildHoursByDay(posts, userId);

    const grid: (0 | 1 | 2 | 3 | 4)[][] = [];
    for (let r = 0; r < ROWS; r++) {
      const row: (0 | 1 | 2 | 3 | 4)[] = [];
      for (let c = 0; c < WEEKS; c++) {
        const dayIndex = c * ROWS + r;
        const cellDate = startDateTs + dayIndex * DAY_MS;
        if (cellDate > now) {
          row.push(0);
          continue;
        }
        const key = dateKey(cellDate);
        const hours = hoursByDay[key] ?? 0;
        row.push(hoursToLevel(hours));
      }
      grid.push(row);
    }

    const monthLabels: { col: number; label: string }[] = [];
    const endYear = new Date(now).getFullYear();
    const endMonth = new Date(now).getMonth();
    for (let y = startDate.getFullYear(); y <= endYear; y++) {
      const startM = y === startDate.getFullYear() ? startDate.getMonth() : 0;
      const endM = y === endYear ? endMonth : 11;
      for (let m = startM; m <= endM; m++) {
        const firstDay = new Date(y, m, 1).getTime();
        if (firstDay < startDateTs) continue;
        const dayIndex = Math.round((firstDay - startDateTs) / DAY_MS);
        const col = Math.floor(dayIndex / ROWS);
        if (col >= 0 && col < WEEKS) monthLabels.push({ col, label: MONTH_NAMES[m] });
      }
    }

    return { grid, monthLabels };
  }, [posts, userId]);

  const monthLabelLeft = (col: number) => col * (CELL_SIZE + GAP);
  const scrollRef = useRef<ScrollView>(null);
  const scrollToEnd = useCallback(() => {
    scrollRef.current?.scrollToEnd({ animated: false });
  }, []);

  return (
    <View style={feedStyles.heatmapWrap}>
      <Text style={feedStyles.heatmapTitle}>Activity</Text>
      <Text style={feedStyles.heatmapSubtitle}>Hours spent — past year</Text>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={feedStyles.heatmapScroll}
        onContentSizeChange={scrollToEnd}
      >
        <View style={feedStyles.heatmapInner}>
          <View style={feedStyles.monthRow}>
            {monthLabels.map(({ col, label }) => (
              <Text
                key={`${col}-${label}`}
                style={[feedStyles.monthLabelText, { position: 'absolute', left: monthLabelLeft(col), minWidth: 28 }]}
                numberOfLines={1}
              >
                {label}
              </Text>
            ))}
          </View>
          <View style={feedStyles.heatmapGrid}>
            {grid.map((row, r) => (
              <View key={r} style={feedStyles.heatmapRow}>
                {row.map((level, c) => (
                  <View
                    key={`${r}-${c}`}
                    style={[feedStyles.heatmapCell, { backgroundColor: HEATMAP_COLORS[level] }]}
                  />
                ))}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <View style={feedStyles.legend}>
        <Text style={feedStyles.legendLess}>Less</Text>
        {HEATMAP_COLORS.map((color, i) => (
          <View key={i} style={[feedStyles.legendCell, { backgroundColor: color }]} />
        ))}
        <Text style={feedStyles.legendMore}>More</Text>
      </View>
    </View>
  );
}

export function PostCard({ post }: { post: Post }) {
  return (
    <View style={feedStyles.activityCard}>
      <View style={feedStyles.activityCardImage} />
      <View style={feedStyles.activityCardBody}>
        <Text style={feedStyles.activityCardTitle}>{post.what}</Text>
        {post.whoWith ? <Text style={feedStyles.activityCardWho}>with {post.whoWith}</Text> : null}
        <Text style={feedStyles.activityCardDate}>{formatDate(post.ts)}</Text>
        {post.rating > 0 && <Text style={feedStyles.activityCardRating}>★ {post.rating}</Text>}
        {post.experience ? <Text style={feedStyles.activityCardDesc}>{post.experience}</Text> : null}
        {post.tags.length > 0 && (
          <View style={feedStyles.activityCardTags}>
            {post.tags.map((t) => (
              <Text key={t} style={feedStyles.activityCardTag}>{t}</Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

export function CheckinCard({ checkinId }: { checkinId: string }) {
  const checkin = DEMO_CHECKINS.find((c) => c.id === checkinId);
  if (!checkin) return null;
  const place = DEMO_PLACES.find((p) => p.id === checkin.placeId);
  if (!place) return null;
  return (
    <View style={feedStyles.activityCard}>
      <View style={feedStyles.activityCardImage} />
      <View style={feedStyles.activityCardBody}>
        <Text style={feedStyles.activityCardTitle}>{place.name}</Text>
        <Text style={feedStyles.activityCardWho}>{checkin.type} · {place.category}</Text>
        <Text style={feedStyles.activityCardDate}>{formatDate(checkin.ts)}</Text>
        {checkin.rating != null && <Text style={feedStyles.activityCardRating}>★ {checkin.rating}</Text>}
        {checkin.note ? <Text style={feedStyles.activityCardDesc}>{checkin.note}</Text> : null}
        {place.tags.length > 0 && (
          <View style={feedStyles.activityCardTags}>
            {place.tags.slice(0, 3).map((t) => (
              <Text key={t} style={feedStyles.activityCardTag}>{t}</Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

export function PlaceholderActivityCard({
  title,
  subtitle,
  date,
}: {
  title: string;
  subtitle?: string;
  date?: string;
}) {
  return (
    <View style={feedStyles.activityCard}>
      <View style={feedStyles.activityCardImage} />
      <View style={feedStyles.activityCardBody}>
        <Text style={feedStyles.activityCardTitle}>{title}</Text>
        {subtitle ? <Text style={feedStyles.activityCardWho}>{subtitle}</Text> : null}
        {date ? <Text style={feedStyles.activityCardDate}>{date}</Text> : null}
      </View>
    </View>
  );
}

export type FeedItem = { type: 'post'; id: string; ts: number } | { type: 'checkin'; id: string; ts: number };

export function useProfileFeed(posts: Post[], userId: string): FeedItem[] {
  return useMemo(() => {
    const items: FeedItem[] = [
      ...posts.map((p) => ({ type: 'post' as const, id: p.id, ts: p.ts })),
      ...DEMO_CHECKINS.filter((c) => c.userId === userId).map((c) => ({ type: 'checkin' as const, id: c.id, ts: c.ts })),
    ];
    items.sort((a, b) => b.ts - a.ts);
    return items;
  }, [posts, userId]);
}

const feedStyles = StyleSheet.create({
  heatmapWrap: { backgroundColor: colors.white, marginHorizontal: 16, marginBottom: 16, borderRadius: 16, padding: 16 },
  heatmapTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  heatmapSubtitle: { fontSize: 12, color: colors.textMuted, marginBottom: 12 },
  heatmapScroll: { marginHorizontal: -4 },
  heatmapInner: { minWidth: WEEKS * (CELL_SIZE + GAP) - GAP },
  monthRow: { position: 'relative', height: 18, marginBottom: 4 },
  monthLabelText: { fontSize: 12, color: colors.black, fontWeight: '500' },
  heatmapGrid: {},
  heatmapRow: { flexDirection: 'row', gap: GAP, marginBottom: GAP },
  heatmapCell: { width: CELL_SIZE, height: CELL_SIZE, borderRadius: 2 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 12 },
  legendLess: { fontSize: 11, color: colors.textMuted, marginRight: 4 },
  legendCell: { width: 10, height: 10, borderRadius: 2 },
  legendMore: { fontSize: 11, color: colors.textMuted, marginLeft: 4 },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  activityCardImage: { width: 80, height: 80, backgroundColor: colors.border },
  activityCardBody: { flex: 1, padding: 12 },
  activityCardTitle: { fontSize: 16, fontWeight: '700', color: colors.black, marginBottom: 2 },
  activityCardWho: { fontSize: 13, color: colors.textMuted, marginBottom: 2 },
  activityCardDate: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  activityCardRating: { fontSize: 14, color: colors.accent, marginBottom: 4 },
  activityCardDesc: { fontSize: 14, color: colors.black, marginBottom: 6 },
  activityCardTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  activityCardTag: { fontSize: 12, color: colors.textMuted, backgroundColor: colors.white, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
});
