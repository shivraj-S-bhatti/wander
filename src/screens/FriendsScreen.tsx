import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { AppHeader } from '../components/AppHeader';
import { FriendCard } from '../components/FriendCard';
import { DEMO_FRIENDS, DEMO_USERS } from '../data/demo';
import type { Friend } from '../data/demo';
import * as friendRequestsApi from '../services/friendRequests';
import type { FriendRequestReceived } from '../services/friendRequests';
import { useStore } from '../state/store';
import * as usersApi from '../services/users';
import type { ApiUser } from '../services/users';
import { colors } from '../theme';
import type { RootStackParamList } from '../../App';
import type { RootState } from '../state/reduxStore';

type FriendsNavProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

function apiUserToFriend(u: ApiUser): Friend {
  return {
    id: u.id,
    username: u.username,
    avatar: undefined,
    civicScore: u.civicPoints ?? 0,
    streak: u.streak ?? 0,
    rank: 0,
  };
}

/** Static profile images for friends list: index 0 = existing, then celina, clyde, elana, kim, megan (cycle). */
const FRIEND_AVATAR_BY_INDEX = ['celina', 'clyde', 'elana', 'kim', 'megan'] as const;

function toFriendWithDemo(u: ApiUser): Friend {
  const demoUser = DEMO_USERS.find((d) => d.id === u.id);
  const demoFriend = DEMO_FRIENDS.find((f) => f.id === u.id);
  return {
    id: u.id,
    username: u.username,
    avatar: demoUser?.avatar,
    civicScore: demoFriend?.civicScore ?? u.civicPoints ?? 0,
    streak: demoFriend?.streak ?? u.streak ?? 0,
    rank: demoFriend?.rank ?? 0,
  };
}

function toFriendWithAvatarByIndex(u: ApiUser, index: number): Friend {
  const friend = toFriendWithDemo(u);
  if (index > 0) {
    friend.avatar = FRIEND_AVATAR_BY_INDEX[(index - 1) % FRIEND_AVATAR_BY_INDEX.length];
  }
  return friend;
}

export function FriendsScreen() {
  const navigation = useNavigation<FriendsNavProp>();
  const { state } = useStore();
  const token = useSelector((s: RootState) => s.auth.token);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [requests, setRequests] = useState<FriendRequestReceived[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);

  const [apiFriends, setApiFriends] = useState<ApiUser[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<ApiUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [sentRequestIds, setSentRequestIds] = useState<Set<string>>(new Set());
  const [sendingId, setSendingId] = useState<string | null>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const demoFriendsAsApiUsers: ApiUser[] = useMemo(() => {
    const ids = state?.demoFriendIds ?? [];
    return ids
      .map((id) => DEMO_USERS.find((u) => u.id === id))
      .filter((u): u is (typeof DEMO_USERS)[0] => !!u)
      .map((u) => ({ id: u.id, username: u.name, email: '' }));
  }, [state?.demoFriendIds]);

  const friends: ApiUser[] = useMemo(() => {
    const byId = new Map<string, ApiUser>();
    demoFriendsAsApiUsers.forEach((u) => byId.set(u.id, u));
    apiFriends.forEach((u) => byId.set(u.id, u));
    return Array.from(byId.values());
  }, [apiFriends, demoFriendsAsApiUsers]);

  const loadFriends = useCallback(async () => {
    if (!token) {
      setApiFriends([]);
      setFriendsLoading(false);
      return;
    }
    setFriendsLoading(true);
    try {
      const list = await usersApi.getMyFriends(token);
      setApiFriends(list);
    } catch {
      setApiFriends([]);
    } finally {
      setFriendsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setSearchLoading(false);
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = null;
      }
      return;
    }
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(async () => {
      searchDebounceRef.current = null;
      setSearchLoading(true);
      try {
        const list = await usersApi.searchUsers(searchQuery.trim(), 20);
        setSearchResults(list);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery]);

  const loadRequests = useCallback(async () => {
    if (!token) {
      setRequests([]);
      setRequestsLoading(false);
      return;
    }
    setRequestsLoading(true);
    try {
      const list = await friendRequestsApi.listReceived(token);
      setRequests(list);
    } catch {
      setRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  }, [token]);

  const openDropdown = useCallback(() => {
    setDropdownVisible(true);
    loadRequests();
  }, [loadRequests]);

  const accept = useCallback(
    async (id: string) => {
      if (!token) return;
      setActingId(id);
      try {
        await friendRequestsApi.acceptRequest(token, id);
        setRequests((prev) => prev.filter((r) => r.id !== id));
        loadFriends();
      } finally {
        setActingId(null);
      }
    },
    [token, loadFriends]
  );

  const decline = useCallback(
    async (id: string) => {
      if (!token) return;
      setActingId(id);
      try {
        await friendRequestsApi.declineRequest(token, id);
        setRequests((prev) => prev.filter((r) => r.id !== id));
      } finally {
        setActingId(null);
      }
    },
    [token]
  );

  const sendRequest = useCallback(
    async (toUserId: string) => {
      if (!token) return;
      setSendingId(toUserId);
      try {
        await friendRequestsApi.sendFriendRequest(token, toUserId);
        setSentRequestIds((prev) => new Set(prev).add(toUserId));
      } finally {
        setSendingId(null);
      }
    },
    [token]
  );

  const friendIds = useMemo(() => new Set(friends.map((f) => f.id)), [friends]);
  const isSearchMode = searchQuery.trim().length > 0;
  const listData: Friend[] = isSearchMode
    ? searchResults.map((u, i) => toFriendWithAvatarByIndex(u, i))
    : friends.map((u, i) => toFriendWithAvatarByIndex(u, i));

  const bellBadgeCount = token ? requests.length : 1;

  return (
    <View style={styles.container}>
      <AppHeader
        rightElement={
          <TouchableOpacity
            onPress={openDropdown}
            style={styles.bellWrap}
            accessibilityLabel="Friend requests"
            accessibilityRole="button"
          >
            <Ionicons name="notifications-outline" size={24} color={colors.black} />
            {bellBadgeCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{bellBadgeCount > 99 ? '99+' : bellBadgeCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        }
      />
      <Modal
        visible={dropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setDropdownVisible(false)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
          <View style={styles.dropdown}>
            <Text style={styles.dropdownTitle}>Friend requests</Text>
            {requestsLoading ? (
              <ActivityIndicator style={styles.dropdownLoader} color={colors.accent} />
            ) : requests.length === 0 ? (
              <Text style={styles.dropdownEmpty}>No pending requests</Text>
            ) : (
              requests.map((r) => (
                <View key={r.id} style={styles.requestRow}>
                  <Text style={styles.requestUsername} numberOfLines={1}>
                    {r.fromUsername ?? 'Unknown'}
                  </Text>
                  <View style={styles.requestActions}>
                    <TouchableOpacity
                      onPress={() => accept(r.id)}
                      disabled={actingId !== null}
                      style={styles.actionBtn}
                      accessibilityLabel="Accept"
                      accessibilityRole="button"
                    >
                      <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => decline(r.id)}
                      disabled={actingId !== null}
                      style={styles.actionBtn}
                      accessibilityLabel="Decline"
                      accessibilityRole="button"
                    >
                      <Ionicons name="close-circle" size={24} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </Modal>
      <TextInput
        style={styles.searchInput}
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={isSearchMode ? 'Search users by username...' : 'Search friends or find new users...'}
        placeholderTextColor={colors.placeholder}
      />
      <Text style={styles.title}>{isSearchMode ? 'Search results' : 'My Friends'}</Text>
      {friendsLoading && !isSearchMode ? (
        <ActivityIndicator style={styles.loader} color={colors.accent} />
      ) : searchLoading && isSearchMode ? (
        <ActivityIndicator style={styles.loader} color={colors.accent} />
      ) : listData.length === 0 ? (
        <Text style={styles.empty}>
          {isSearchMode
            ? searchQuery.trim()
              ? 'No users found'
              : 'Type to search for users'
            : 'No friends yet. Search above to add friends!'}
        </Text>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isFriend = friendIds.has(item.id);
            const requestSent = sentRequestIds.has(item.id);
            const rightEl =
              isSearchMode && !isFriend ? (
                requestSent ? (
                  <Text style={styles.requestSentLabel}>Request sent</Text>
                ) : (
                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => sendRequest(item.id)}
                    disabled={sendingId !== null}
                    accessibilityLabel="Add friend"
                    accessibilityRole="button"
                  >
                    {sendingId === item.id ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <Text style={styles.addBtnText}>Add friend</Text>
                    )}
                  </TouchableOpacity>
                )
              ) : undefined;
            return (
              <FriendCard
                friend={item}
                onPress={() => navigation.navigate('ProfileDetail', { userId: item.id, username: item.username })}
                rightElement={rightEl}
              />
            );
          }}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  bellWrap: {
    padding: 4,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    paddingTop: 56,
    paddingRight: 16,
    alignItems: 'flex-end',
  },
  dropdown: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 280,
    maxWidth: 320,
    paddingVertical: 12,
    paddingHorizontal: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  dropdownLoader: { marginVertical: 16 },
  dropdownEmpty: {
    fontSize: 14,
    color: colors.textMuted,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  requestUsername: {
    fontSize: 15,
    color: colors.black,
    flex: 1,
    marginRight: 12,
  },
  requestActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtn: {
    padding: 4,
  },
  searchInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  title: { fontSize: 22, fontWeight: '700', paddingHorizontal: 16, paddingBottom: 12, color: colors.black },
  list: { paddingBottom: 24 },
  loader: { marginTop: 24 },
  empty: {
    fontSize: 15,
    color: colors.textMuted,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  addBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 88,
    alignItems: 'center',
  },
  addBtnText: { fontSize: 13, fontWeight: '600', color: colors.white },
  requestSentLabel: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
});
