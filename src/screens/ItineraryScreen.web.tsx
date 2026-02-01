import { useNavigation } from '@react-navigation/native';
import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { DEMO_PLACES } from '../data/demo';
import { useStore } from '../state/store';
import { colors } from '../theme';

export function ItineraryScreen() {
  const navigation = useNavigation();
  const { state, setOpenPlanModal, setActivePlan } = useStore();
  const plan = state.plan.activePlan;

  const places = useMemo(() => {
    if (!plan?.placeIds?.length) return [];
    return plan.placeIds
      .map((id) => DEMO_PLACES.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => p != null);
  }, [plan?.placeIds]);

  const handleCreatePlan = () => {
    setOpenPlanModal(true);
    (navigation.getParent() as { navigate: (name: string, params?: { screen: string }) => void } | undefined)?.navigate('MainTabs', { screen: 'Explore' });
  };

  if (!plan || places.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No active plan</Text>
          <Text style={styles.emptySub}>Generate an itinerary from Explore to see your route here.</Text>
          <TouchableOpacity style={styles.createBtn} onPress={handleCreatePlan}>
            <Text style={styles.createBtnText}>Create plan</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const endPlan = () => setActivePlan(null);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.stepsScroll} contentContainerStyle={styles.stepsContent}>
        <Text style={styles.sheetTitle}>{plan.name || 'Your route'}</Text>
        {places.map((place, index) => (
          <View key={place.id} style={styles.stepRow}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>{index + 1}</Text>
            </View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepName}>{place.name}</Text>
              <Text style={styles.stepCategory}>{place.category}</Text>
            </View>
          </View>
        ))}
        <TouchableOpacity style={styles.endPlanBtn} onPress={endPlan}>
          <Text style={styles.endPlanBtnText}>End plan</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.black, marginBottom: 8, textAlign: 'center' },
  emptySub: { fontSize: 15, color: colors.textMuted, textAlign: 'center', marginBottom: 24 },
  createBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  createBtnText: { fontSize: 16, fontWeight: '600', color: colors.white },
  mapPlaceholder: {
    minHeight: 180,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  mapPlaceholderText: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  stepsScroll: { flex: 1 },
  stepsSheet: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: colors.black, marginBottom: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumText: { fontSize: 14, fontWeight: '700', color: colors.white },
  stepInfo: { flex: 1 },
  stepName: { fontSize: 16, fontWeight: '600', color: colors.black },
  stepCategory: { fontSize: 13, color: colors.textMuted },
  endPlanBtn: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.border,
  },
  endPlanBtnText: { fontSize: 16, fontWeight: '600', color: colors.black },
});
