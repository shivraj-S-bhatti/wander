import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { ProfileLayout } from '../components/ProfileLayout';
import { CURRENT_USER_ID } from '../data/demo';
import { colors } from '../theme';

export function ProfileScreen() {
  return (
    <View style={styles.container}>
      <AppHeader />
      <ProfileLayout userId={CURRENT_USER_ID} isOwnProfile />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});
