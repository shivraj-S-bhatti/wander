import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { AppHeader } from '../components/AppHeader';
import { PlanHeaderButton } from '../components/PlanHeaderButton';
import { ProfileLayout } from '../components/ProfileLayout';
import { CURRENT_USER_ID } from '../data/demo';
import { useStore } from '../state/store';
import { colors } from '../theme';
import type { RootState } from '../state/reduxStore';

export function ProfileScreen() {
  const { state, setOpenPlanModal } = useStore();
  const currentUserId = useSelector((s: RootState) => s.auth.user?.id) ?? CURRENT_USER_ID;
  const hasActivePlan = state.plan.activePlan != null;
  const onPlanHeaderPress = useCallback(() => setOpenPlanModal(true), [setOpenPlanModal]);
  return (
    <View style={styles.container}>
      <AppHeader centerElement={<PlanHeaderButton hasActivePlan={hasActivePlan} onPress={onPlanHeaderPress} />} />
      <ProfileLayout userId={currentUserId} isOwnProfile />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});
