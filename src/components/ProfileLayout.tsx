import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { CURRENT_USER_ID, DEMO_USERS } from '../data/demo';
import type { Post } from '../data/demo';
import { clearStoredAuth } from '../services/authStorage';
import * as friendRequestsApi from '../services/friendRequests';
import { useStore } from '../state/store';
import { useAppDispatch } from '../state/reduxStore';
import { logout } from '../state/authSlice';
import type { RootState } from '../state/reduxStore';
import { colors } from '../theme';
import { getFaceSource } from '../utils/avatarFaces';
import { ActivityHeatmap } from './ProfileFeed';

type Props = {
  userId: string;
  isOwnProfile: boolean;
  /** When viewing another user (e.g. from friends list), pass their display name for the header */
  displayName?: string;
};

function deriveHandle(name: string, id: string): string {
  if (id === CURRENT_USER_ID) return '@you';
  return '@' + name.toLowerCase().replace(/\s/g, '');
}

export function ProfileLayout({ userId, isOwnProfile, displayName }: Props) {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const token = useSelector((s: RootState) => s.auth.token);
  const authUser = useSelector((s: RootState) => s.auth.user);
  const myFriendIds = useSelector((s: RootState) => s.auth.user?.friends ?? []);
  const isAlreadyFriend = myFriendIds.includes(userId);
  const { state, getBadges, getLevel, getStreak, getNextBadgeProgress } = useStore();
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const handleSendFriendRequest = useCallback(async () => {
    if (!token) {
      Alert.alert('Log in', 'Log in to send a friend request.');
      return;
    }
    if (userId === CURRENT_USER_ID) return;
    setSendingRequest(true);
    try {
      await friendRequestsApi.sendFriendRequest(token, userId);
      setRequestSent(true);
    } catch (err) {
      Alert.alert('Could not send request', err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSendingRequest(false);
    }
  }, [token, userId]);

  const handleLogout = async () => {
    await clearStoredAuth();
    dispatch(logout());
    const stack = navigation.getParent();
    stack?.reset({ routes: [{ name: 'Login' }] });
  };

  const user = useMemo(() => {
    if (displayName != null) return { id: userId, name: displayName };
    if (isOwnProfile && authUser) return { id: userId, name: authUser.username };
    return DEMO_USERS.find((u) => u.id === userId) ?? { id: userId, name: 'Unknown' };
  }, [userId, displayName, isOwnProfile, authUser]);
  const posts = useMemo(() => state.posts.filter((p) => p.userId === userId), [state.posts, userId]);

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
            <Ionicons name="chevron-back" size={28} color={colors.black} />
          </TouchableOpacity>
          <Text style={styles.headerName} numberOfLines={1}>{user.name}</Text>
          {!isAlreadyFriend ? (
            <TouchableOpacity
              style={styles.headerPlusBtn}
              onPress={handleSendFriendRequest}
              disabled={sendingRequest || requestSent}
              accessibilityLabel={requestSent ? 'Request sent' : 'Send friend request'}
              accessibilityRole="button"
            >
              {sendingRequest ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : requestSent ? (
                <Ionicons name="checkmark" size={24} color={colors.white} />
              ) : (
                <Ionicons name="add" size={24} color={colors.white} />
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.headerFriendsBadge}>
              <Ionicons name="people" size={20} color={colors.textMuted} />
              <Text style={styles.headerFriendsBadgeText}>Friends</Text>
            </View>
          )}
        </View>
      )}
      <View style={styles.profileSection}>
        {(() => {
          const faceSrc = getFaceSource(user.avatar);
          if (faceSrc != null && typeof faceSrc === 'number') {
            return <Image source={faceSrc} style={styles.avatar} resizeMode="cover" />;
          }
          if (faceSrc != null && typeof faceSrc === 'object' && 'uri' in faceSrc) {
            return <Image source={faceSrc} style={styles.avatar} resizeMode="cover" />;
          }
          const initial = (user.name ?? '?').charAt(0).toUpperCase();
          return (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
          );
        })()}
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
            {b.unlocked ? (
              <Ionicons name="trophy" size={14} color="#C9A227" style={styles.badgeIcon} />
            ) : (
              <Ionicons name="lock-closed-outline" size={14} color={colors.textMuted} style={styles.badgeIcon} />
            )}
            <Text style={[styles.badgeText, b.unlocked && styles.badgeTextUnlocked]}>
              {b.label}
            </Text>
          </View>
        ))}
      </View>
      <ActivityHeatmap posts={posts} userId={userId} />
      {isOwnProfile && (
        <View style={styles.logoutRow}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            accessibilityLabel="Log out"
            accessibilityRole="button"
          >
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );

  return (
    <ScrollView contentContainerStyle={styles.list}>
      {ListHeader}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBack: { padding: 8, marginLeft: -8 },
  headerName: { flex: 1, fontSize: 18, fontWeight: '700', color: colors.black, textAlign: 'center' },
  headerPlusBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerFriendsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  headerFriendsBadgeText: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  list: { paddingBottom: 24, backgroundColor: colors.background },
  profileSection: {
    backgroundColor: colors.white,
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
    backgroundColor: colors.border,
    marginBottom: 12,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.textMuted,
  },
  handle: { fontSize: 16, fontWeight: '600', color: colors.black, marginBottom: 4 },
  memberSince: { fontSize: 12, color: colors.textMuted, marginBottom: 12 },
  actionBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  actionBtnText: { fontSize: 14, fontWeight: '600', color: colors.black },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-around',
  },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: colors.black },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  categoryIcon: { fontSize: 18, marginRight: 12 },
  categoryLabel: { flex: 1, fontSize: 15, color: colors.black, fontWeight: '500' },
  categoryCount: { fontSize: 14, color: colors.textMuted, marginRight: 8 },
  categoryChevron: { fontSize: 14, color: colors.textMuted },
  cardsRow: { flexDirection: 'row', gap: 12, marginHorizontal: 16, marginBottom: 16 },
  gamificationCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardIcon: { fontSize: 24, marginBottom: 8 },
  cardLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  cardValue: { fontSize: 18, fontWeight: '700', color: colors.black },
  progressBlock: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressTitle: { fontSize: 14, fontWeight: '600', color: colors.black, marginBottom: 8 },
  progressValue: { fontSize: 13, color: colors.textMuted, marginBottom: 12 },
  progressBarBg: { height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 4 },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginHorizontal: 16, marginBottom: 16 },
  badgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
  },
  badgeChipUnlocked: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: '#C9A227',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  badgeIcon: { marginRight: 6 },
  badgeText: { fontSize: 12, color: colors.textMuted },
  badgeTextUnlocked: { color: colors.black, fontWeight: '700' },
  logoutRow: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 32, alignItems: 'center' },
  logoutButton: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: colors.white },
});
