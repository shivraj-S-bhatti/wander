import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppHeader } from '../components/AppHeader';
import { FriendCard } from '../components/FriendCard';
import { DEMO_FRIENDS } from '../data/demo';
import { colors } from '../theme';
import type { RootStackParamList } from '../../App';

type FriendsNavProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export function FriendsScreen() {
  const navigation = useNavigation<FriendsNavProp>();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFriends = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return DEMO_FRIENDS;
    return DEMO_FRIENDS.filter((f) => f.username.toLowerCase().includes(q));
  }, [searchQuery]);

  return (
    <View style={styles.container}>
      <AppHeader />
      <TextInput
        style={styles.searchInput}
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search friends..."
        placeholderTextColor={colors.placeholder}
      />
      <Text style={styles.title}>My Friends</Text>
      <FlatList
        data={filteredFriends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FriendCard
            friend={item}
            onPress={() => navigation.navigate('ProfileDetail', { userId: item.id })}
          />
        )}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
});
