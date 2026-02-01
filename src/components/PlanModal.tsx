import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCityById } from '../data/cities';
import { GEMINI_API_KEY } from '../config';
import { fetchItineraryOptions, type ItineraryOption } from '../services/gemini';
import { useStore } from '../state/store';
import { colors } from '../theme';

const FEELING_OPTIONS = ['chill', 'party', 'quiet', 'outdoors'] as const;
const BUDGET_OPTIONS = ['low', 'med', 'high'] as const;

export function PlanModal() {
  const { state, setOpenPlanModal, setActivePlan, setPendingEventId } = useStore();
  const visible = state.plan.openPlanModal;
  const city = getCityById(state.city.selectedCityId) ?? getCityById('san_francisco')!;

  const [planModalMode, setPlanModalMode] = useState<'form' | 'results' | 'viewPlan'>('form');
  const [startLocation, setStartLocation] = useState('');
  const [feeling, setFeeling] = useState<string | null>(null);
  const [budget, setBudget] = useState<string | null>(null);
  const [hoursOutside, setHoursOutside] = useState(3);
  const [generating, setGenerating] = useState(false);
  const [generatedOptions, setGeneratedOptions] = useState<ItineraryOption[] | null>(null);
  const [crossedOutIndices, setCrossedOutIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (visible) {
      setPlanModalMode(state.plan.activePlan ? 'viewPlan' : 'form');
      setGeneratedOptions(null);
      setCrossedOutIndices(new Set());
    }
  }, [visible, state.plan.activePlan]);

  const closePlanModal = () => {
    setOpenPlanModal(false);
    setPendingEventId(null);
    setPlanModalMode('form');
    setGeneratedOptions(null);
    setCrossedOutIndices(new Set());
  };

  const fallbackOptions: ItineraryOption[] = [
    { name: 'Quick route', placeIds: city.places.slice(0, 3).map((p) => p.id) },
  ];

  const onGenerate = async () => {
    setGenerating(true);
    setGeneratedOptions(null);
    const placesSummary = city.places
      .map((p) => `${p.id} | ${p.name} | ${p.category} | ${p.tags.join(', ')} | ${p.priceTier}`)
      .join('\n');
    try {
      const { options } = await fetchItineraryOptions(
        GEMINI_API_KEY,
        {
          startLocation: startLocation || undefined,
          vibe: feeling || undefined,
          budget: budget || undefined,
          hoursOutside,
        },
        placesSummary
      );
      setGeneratedOptions(options?.length ? options : fallbackOptions);
    } catch {
      setGeneratedOptions(fallbackOptions);
    } finally {
      setGenerating(false);
    }
  };

  const toggleCrossOut = (index: number) => {
    setCrossedOutIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const visibleOptions = generatedOptions
    ? generatedOptions
        .map((opt, index) => ({ option: opt, index }))
        .filter(({ index }) => !crossedOutIndices.has(index))
    : [];

  const onAcceptPlan = () => {
    const first = visibleOptions[0]?.option;
    if (first?.placeIds?.length) {
      const eventIds = state.plan.pendingEventId ? [state.plan.pendingEventId] : undefined;
      setActivePlan({ placeIds: first.placeIds, name: first.name, eventIds });
      setPendingEventId(null);
      closePlanModal();
    }
  };

  const onTryAgain = () => {
    setGeneratedOptions(null);
    setCrossedOutIndices(new Set());
  };

  const endPlanFromModal = () => {
    setActivePlan(null);
    closePlanModal();
  };

  const planPlaces = useMemo(() => {
    const plan = state.plan.activePlan;
    if (!plan?.placeIds?.length) return [];
    return plan.placeIds
      .map((id) => city.places.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => p != null);
  }, [state.plan.activePlan, city.places]);

  const planEvents = useMemo(() => {
    const plan = state.plan.activePlan;
    const ids = plan?.eventIds;
    if (!ids?.length) return [];
    return ids
      .map((id) => state.events.find((e) => e.id === id))
      .filter((e): e is NonNullable<typeof e> => e != null);
  }, [state.plan.activePlan?.eventIds, state.events]);

  const pendingEvent = useMemo(() => {
    const id = state.plan.pendingEventId;
    if (!id) return null;
    return state.events.find((e) => e.id === id) ?? null;
  }, [state.plan.pendingEventId, state.events]);

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade">
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closePlanModal}>
        <TouchableOpacity style={styles.modalCard} activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {planModalMode === 'viewPlan' ? 'Your plan' : generatedOptions ? 'Choose a plan' : 'Plan your day'}
            </Text>
            <TouchableOpacity onPress={closePlanModal} style={styles.modalClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={colors.black} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            {planModalMode === 'viewPlan' ? (
              <>
                <Text style={styles.sheetTitle}>{state.plan.activePlan?.name || 'Your route'}</Text>
                {planPlaces.map((place, index) => (
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
                {planEvents.map((ev, index) => (
                  <View key={ev.id} style={styles.stepRow}>
                    <View style={[styles.stepNum, styles.stepNumEvent]}>
                      <Text style={styles.stepNumText}>{planPlaces.length + index + 1}</Text>
                    </View>
                    <View style={styles.stepInfo}>
                      <Text style={styles.stepName}>{ev.title}</Text>
                      <Text style={styles.stepCategory}>Volunteer</Text>
                    </View>
                  </View>
                ))}
                <TouchableOpacity style={styles.endPlanBtn} onPress={endPlanFromModal}>
                  <Text style={styles.endPlanBtnText}>End plan</Text>
                </TouchableOpacity>
              </>
            ) : generatedOptions ? (
              <>
                {pendingEvent ? (
                  <View style={styles.includedChip}>
                    <Ionicons name="heart" size={14} color="#166534" />
                    <Text style={styles.includedChipText} numberOfLines={1}>{pendingEvent.title} included</Text>
                  </View>
                ) : null}
                <Text style={styles.modalRowLabel}>Cross out options you don't want, then Accept</Text>
                {generatedOptions.map((option, index) => {
                  const crossedOut = crossedOutIndices.has(index);
                  const placeNames = (option.placeIds || [])
                    .map((id) => city.places.find((p) => p.id === id)?.name)
                    .filter(Boolean)
                    .join(' → ');
                  return (
                    <View key={index} style={[styles.optionRow, crossedOut && styles.optionRowCrossedOut]}>
                      <View style={styles.optionRowLeft}>
                        <View style={styles.optionCircle} />
                        <View style={styles.optionRowText}>
                          <Text style={[styles.optionName, crossedOut && styles.optionTextCrossedOut]} numberOfLines={1}>
                            {option.name || `Option ${index + 1}`}
                          </Text>
                          <Text style={[styles.optionStops, crossedOut && styles.optionTextCrossedOut]} numberOfLines={1}>
                            {option.placeIds?.length ?? 0} stops{placeNames ? ` · ${placeNames}` : ''}
                          </Text>
                          {option.priceBreakdown ? (
                            <Text style={[styles.optionPrice, crossedOut && styles.optionTextCrossedOut]} numberOfLines={1}>
                              {option.priceBreakdown}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => toggleCrossOut(index)}
                        style={styles.optionCrossOut}
                        hitSlop={12}
                        accessibilityLabel={crossedOut ? 'Restore option' : 'Cross out option'}
                      >
                        <Ionicons name="close-circle" size={24} color={crossedOut ? colors.textMuted : colors.black} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
                <TouchableOpacity
                  style={[styles.generateBtn, visibleOptions.length === 0 && styles.acceptDisabled]}
                  onPress={onAcceptPlan}
                  disabled={visibleOptions.length === 0}
                >
                  <Text style={styles.generateBtnText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tryAgainBtn} onPress={onTryAgain}>
                  <Text style={styles.tryAgainBtnText}>Try again</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelPlanBtn} onPress={closePlanModal}>
                  <Text style={styles.cancelPlanBtnText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {pendingEvent ? (
                  <View style={styles.includedBanner}>
                    <View style={styles.includedBannerContent}>
                      <View style={styles.includedIconWrap}>
                        <Ionicons name="heart" size={18} color={colors.white} />
                      </View>
                      <View style={styles.includedTextWrap}>
                        <Text style={styles.includedLabel}>Included in your plan</Text>
                        <Text style={styles.includedTitle} numberOfLines={1}>{pendingEvent.title}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => setPendingEventId(null)}
                      style={styles.includedRemove}
                      hitSlop={8}
                      accessibilityLabel="Remove from plan"
                    >
                      <Ionicons name="close" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                ) : null}
                <Text style={styles.modalRowLabel}>Starting location</Text>
                <TextInput
                  style={styles.input}
                  value={startLocation}
                  onChangeText={setStartLocation}
                  placeholder="e.g. Home"
                  placeholderTextColor={colors.placeholder}
                />
                <Text style={styles.modalRowLabel}>Vibe</Text>
                <View style={styles.chipRow}>
                  {FEELING_OPTIONS.map((f) => (
                    <TouchableOpacity
                      key={f}
                      style={[styles.chip, feeling === f && styles.chipActive]}
                      onPress={() => setFeeling(feeling === f ? null : f)}
                    >
                      <Text style={[styles.chipText, feeling === f && styles.chipTextActive]}>{f}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.modalRowLabel}>Budget</Text>
                <View style={styles.chipRow}>
                  {BUDGET_OPTIONS.map((b) => (
                    <TouchableOpacity
                      key={b}
                      style={[styles.chip, budget === b && styles.chipActive]}
                      onPress={() => setBudget(budget === b ? null : b)}
                    >
                      <Text style={[styles.chipText, budget === b && styles.chipTextActive]}>{b}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.modalRowLabel}>Hours outside: {hoursOutside}</Text>
                <View style={styles.sliderRow}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                    <TouchableOpacity
                      key={h}
                      style={[styles.sliderDot, hoursOutside === h && styles.sliderDotActive]}
                      onPress={() => setHoursOutside(h)}
                    />
                  ))}
                </View>
                <TouchableOpacity style={styles.generateBtn} onPress={onGenerate} disabled={generating}>
                  {generating ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.generateBtnText}>Generate</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.black },
  modalClose: { padding: 4 },
  modalScroll: { maxHeight: 400 },
  modalContent: { padding: 20, paddingBottom: 28 },
  modalRowLabel: { fontSize: 14, fontWeight: '600', color: colors.black, marginBottom: 8, marginTop: 12 },
  includedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  includedBannerContent: { flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0 },
  includedIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  includedTextWrap: { flex: 1, minWidth: 0 },
  includedLabel: { fontSize: 12, fontWeight: '600', color: '#166534', marginBottom: 2 },
  includedTitle: { fontSize: 15, fontWeight: '600', color: colors.black },
  includedRemove: { padding: 4, marginLeft: 8 },
  includedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#f0fdf4',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginBottom: 12,
    gap: 6,
  },
  includedChipText: { fontSize: 13, fontWeight: '600', color: '#166534' },
  input: {
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 4,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.border },
  chipActive: { backgroundColor: colors.accent },
  chipText: { fontSize: 14, color: colors.black },
  chipTextActive: { fontSize: 14, color: colors.white, fontWeight: '600' },
  sliderRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  sliderDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
  sliderDotActive: { backgroundColor: colors.accent },
  generateBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  generateBtnText: { fontSize: 18, fontWeight: '700', color: colors.white },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionRowCrossedOut: { opacity: 0.5 },
  optionRowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0 },
  optionCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.accent,
    marginRight: 12,
  },
  optionRowText: { flex: 1, minWidth: 0 },
  optionName: { fontSize: 16, fontWeight: '700', color: colors.black, marginBottom: 2 },
  optionStops: { fontSize: 13, color: colors.textMuted },
  optionPrice: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  optionTextCrossedOut: { textDecorationLine: 'line-through', color: colors.textMuted },
  optionCrossOut: { padding: 4 },
  acceptDisabled: { opacity: 0.5 },
  tryAgainBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  tryAgainBtnText: { fontSize: 16, fontWeight: '600', color: colors.accent },
  cancelPlanBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  cancelPlanBtnText: { fontSize: 15, color: colors.textMuted },
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
  stepNumEvent: { backgroundColor: '#22c55e' },
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
