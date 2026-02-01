import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { AppHeader } from '../components/AppHeader';
import { ProfileLayout } from '../components/ProfileLayout';
import { CURRENT_USER_ID } from '../data/demo';
import { colors } from '../theme';
import type { RootState } from '../state/reduxStore';

export function ProfileScreen() {
  const currentUserId = useSelector((s: RootState) => s.auth.user?.id) ?? CURRENT_USER_ID;
  return (
    <View style={styles.container}>
      <AppHeader />
      <ProfileLayout userId={currentUserId} isOwnProfile />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});
