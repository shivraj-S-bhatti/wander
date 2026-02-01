import { useRoute } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ProfileLayout } from '../components/ProfileLayout';
import { colors } from '../theme';

type ProfileDetailParams = { userId: string; username?: string };

export function ProfileDetailScreen() {
  const route = useRoute<{ params: ProfileDetailParams }>();
  const userId = route.params?.userId ?? 'u_1';
  const username = route.params?.username;

  return (
    <View style={styles.container}>
      <ProfileLayout userId={userId} isOwnProfile={false} displayName={username} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});
