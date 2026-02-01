import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { AppHeader } from '../components/AppHeader';
import { PlanHeaderButton } from '../components/PlanHeaderButton';
import { MonthCalendar } from '../components/MonthCalendar';
import { DEMO_USERS } from '../data/demo';
import * as usersApi from '../services/users';
import type { ApiUser } from '../services/users';
import { useStore } from '../state/store';
import { POINTS_POST } from '../state/store';
import type { RootState } from '../state/reduxStore';
import { colors } from '../theme';

const WIDE_BREAKPOINT = 600;

const RATING_OPTIONS = [1, 2, 3, 4, 5];
const TAG_OPTIONS = ['food', 'coffee', 'outdoors', 'volunteer', 'chill', 'party', 'quiet', 'local'];
const MAX_TAG_LENGTH = 24;

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

type SelectedFriend = { id: string; username: string };

export function MakePostScreen() {
  const { addPost, state, setOpenPlanModal } = useStore();
  const token = useSelector((s: RootState) => s.auth.token);
  const hasActivePlan = state.plan.activePlan != null;
  const onPlanHeaderPress = useCallback(() => setOpenPlanModal(true), [setOpenPlanModal]);
  const [what, setWhat] = useState('');
  const [whoWith, setWhoWith] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<SelectedFriend[]>([]);
  const [apiFriends, setApiFriends] = useState<ApiUser[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [whoDropdownOpen, setWhoDropdownOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [experience, setExperience] = useState('');
  const [hoursSpent, setHoursSpent] = useState<number>(1);
  const [tags, setTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [selectedDateTs, setSelectedDateTs] = useState(startOfDay(Date.now()));
  const [saved, setSaved] = useState(false);
  const [pointsToast, setPointsToast] = useState(false);

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

  const addFriendToWho = useCallback((user: ApiUser) => {
    setSelectedFriends((prev) =>
      prev.some((f) => f.id === user.id) ? prev : [...prev, { id: user.id, username: user.username }]
    );
    setWhoDropdownOpen(false);
  }, []);

  const removeFriendFromWho = useCallback((id: string) => {
    setSelectedFriends((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const selectedIds = new Set(selectedFriends.map((f) => f.id));
  const availableFriends = friends.filter((f) => !selectedIds.has(f.id));

  const HOURS_OPTIONS = [0.5, 1, 2, 3, 4];

  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const addCustomTag = () => {
    const t = customTagInput.trim().slice(0, MAX_TAG_LENGTH);
    if (!t || tags.includes(t)) return;
    setTags((prev) => [...prev, t]);
    setCustomTagInput('');
  };

  const handleSave = () => {
    if (!what.trim()) return;
    const whoWithValue =
      token && selectedFriends.length > 0
        ? selectedFriends.map((f) => f.username).join(', ')
        : whoWith.trim();
    const noonOnSelected = selectedDateTs + 12 * 60 * 60 * 1000;
    addPost(
      {
        what: what.trim(),
        whoWith: whoWithValue,
        rating: rating || 0,
        experience: experience.trim(),
        imageUris: [],
        tags,
        hoursSpent,
      },
      noonOnSelected
    );
    setSaved(true);
    setPointsToast(true);
    setWhat('');
    setWhoWith('');
    setSelectedFriends([]);
    setRating(0);
    setExperience('');
    setHoursSpent(1);
    setTags([]);
    setSelectedDateTs(startOfDay(Date.now()));
    setTimeout(() => setSaved(false), 2000);
    setTimeout(() => setPointsToast(false), 2500);
  };

  const { width } = useWindowDimensions();
  const isWide = width >= WIDE_BREAKPOINT;

  const formContent = (
    <>
      <View style={styles.section}>
        <Text style={styles.label}>What did you do?</Text>
        <TextInput
          style={styles.input}
          value={what}
          onChangeText={setWhat}
          placeholder="e.g. Coffee at The Hive"
          placeholderTextColor={colors.placeholder}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Who with?</Text>
        {token ? (
          <>
            <TouchableOpacity
              style={styles.whoDropdownTrigger}
              onPress={() => setWhoDropdownOpen((o) => !o)}
              activeOpacity={0.7}
            >
              <Text style={styles.whoDropdownTriggerText}>
                {whoDropdownOpen ? 'Tap a friend to add' : 'Add from friends'}
              </Text>
              <Ionicons
                name={whoDropdownOpen ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>
            {whoDropdownOpen && (
              <View style={styles.whoDropdown}>
                {friendsLoading ? (
                  <ActivityIndicator style={styles.whoDropdownLoader} color={colors.accent} />
                ) : availableFriends.length === 0 ? (
                  <Text style={styles.whoDropdownEmpty}>
                    {friends.length === 0 ? 'No friends yet' : 'All friends added'}
                  </Text>
                ) : (
                  <ScrollView
                    style={styles.whoDropdownList}
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="handled"
                  >
                    {availableFriends.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.whoDropdownItem}
                        onPress={() => addFriendToWho(item)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.whoDropdownItemText}>{item.username}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}
            {selectedFriends.length > 0 && (
              <View style={styles.whoChipsRow}>
                {selectedFriends.map((f) => (
                  <TouchableOpacity
                    key={f.id}
                    style={styles.whoChip}
                    onPress={() => removeFriendFromWho(f.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.whoChipText}>{f.username}</Text>
                    <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        ) : (
          <TextInput
            style={styles.input}
            value={whoWith}
            onChangeText={setWhoWith}
            placeholder="e.g. Alex, Sam (log in to pick from friends)"
            placeholderTextColor={colors.placeholder}
          />
        )}
      </View>
      {!isWide && (
        <View style={styles.section}>
          <Text style={styles.label}>Date</Text>
          <MonthCalendar value={selectedDateTs} onChange={setSelectedDateTs} />
        </View>
      )}
        <View style={styles.section}>
          <Text style={styles.label}>Hours spent</Text>
          <View style={styles.ratingRow}>
            {HOURS_OPTIONS.map((h) => (
              <TouchableOpacity
                key={h}
                style={[styles.ratingBtn, hoursSpent === h && styles.ratingBtnActive]}
                onPress={() => setHoursSpent(h)}
              >
                <Text style={[styles.ratingText, hoursSpent === h && styles.ratingTextActive]}>
                  {h === 4 ? '4+' : String(h)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Rating (1–5)</Text>
          <View style={styles.ratingRow}>
            {RATING_OPTIONS.map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.ratingBtn, rating === r && styles.ratingBtnActive]}
                onPress={() => setRating(r)}
              >
                <Text style={[styles.ratingText, rating === r && styles.ratingTextActive]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Experience</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={experience}
            onChangeText={setExperience}
            placeholder="How was it?"
            placeholderTextColor={colors.placeholder}
            multiline
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Tags</Text>
          <View style={styles.tagRow}>
            {TAG_OPTIONS.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[styles.tagChip, tags.includes(tag) && styles.tagChipActive]}
                onPress={() => toggleTag(tag)}
              >
                <Text style={[styles.tagChipText, tags.includes(tag) && styles.tagChipTextActive]}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.customTagRow}>
            <TextInput
              style={styles.customTagInput}
              value={customTagInput}
              onChangeText={(v) => setCustomTagInput(v.slice(0, MAX_TAG_LENGTH))}
              placeholder="Add your own tag"
              placeholderTextColor={colors.placeholder}
              onSubmitEditing={addCustomTag}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.addTagBtn} onPress={addCustomTag} disabled={!customTagInput.trim()}>
              <Text style={[styles.addTagBtnText, !customTagInput.trim() && styles.addTagBtnTextDisabled]}>Add</Text>
            </TouchableOpacity>
          </View>
          {tags.some((t) => !TAG_OPTIONS.includes(t)) ? (
            <View style={styles.tagRow}>
              {tags.filter((t) => !TAG_OPTIONS.includes(t)).map((tag) => (
                <TouchableOpacity key={tag} style={styles.tagChipCustom} onPress={() => toggleTag(tag)}>
                  <Text style={styles.tagChipCustomText}>{tag} ×</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>
        <TouchableOpacity style={styles.uploadBtn}>
          <Text style={styles.uploadBtnText}>Upload pictures</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveBtn, !what.trim() && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!what.trim()}
        >
          <Text style={styles.saveBtnText}>{saved ? 'Saved!' : 'Save'}</Text>
        </TouchableOpacity>
    </>
  );

  return (
    <View style={styles.container}>
      <AppHeader centerElement={<PlanHeaderButton hasActivePlan={hasActivePlan} onPress={onPlanHeaderPress} />} />
      {isWide ? (
        <View style={styles.wideRow}>
          <ScrollView style={styles.formScroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {formContent}
          </ScrollView>
          <View style={styles.calendarPanel}>
            <Text style={styles.calendarPanelLabel}>Date</Text>
            <MonthCalendar value={selectedDateTs} onChange={setSelectedDateTs} />
          </View>
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {formContent}
        </ScrollView>
      )}
      {pointsToast && (
        <View style={styles.pointsToast}>
          <Text style={styles.pointsToastText}>+{POINTS_POST} civic points!</Text>
        </View>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  wideRow: { flex: 1, flexDirection: 'row' },
  formScroll: { flex: 1, minWidth: 280 },
  calendarPanel: {
    width: 320,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    backgroundColor: colors.white,
  },
  calendarPanelLabel: { fontSize: 14, fontWeight: '600', color: colors.black, marginBottom: 12 },
  content: { padding: 16, paddingBottom: 32 },
  section: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: colors.black, marginBottom: 8 },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  whoDropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  whoDropdownTriggerText: { fontSize: 16, color: colors.textMuted },
  whoDropdown: {
    marginTop: 8,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: 200,
  },
  whoDropdownLoader: { marginVertical: 16 },
  whoDropdownEmpty: { fontSize: 14, color: colors.textMuted, padding: 16 },
  whoDropdownList: { maxHeight: 196 },
  whoDropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  whoDropdownItemText: { fontSize: 16, color: colors.black },
  whoChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  whoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  whoChipText: { fontSize: 14, color: colors.accent, fontWeight: '600' },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  ratingRow: { flexDirection: 'row', gap: 8, width: '100%' },
  ratingBtn: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  ratingText: { fontSize: 16, fontWeight: '600', color: colors.black },
  ratingTextActive: { color: colors.white },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagChipActive: { backgroundColor: colors.black },
  tagChipText: { fontSize: 14, color: colors.black },
  tagChipTextActive: { fontSize: 14, color: colors.white, fontWeight: '600' },
  customTagRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  customTagInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addTagBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addTagBtnText: { fontSize: 14, fontWeight: '700', color: colors.white },
  addTagBtnTextDisabled: { color: colors.textMuted },
  tagChipCustom: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  tagChipCustomText: { fontSize: 14, color: colors.accent },
  pointsToast: {
    position: 'absolute',
    bottom: 32,
    left: 16,
    right: 16,
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  pointsToastText: { fontSize: 16, fontWeight: '700', color: colors.white },
  uploadBtn: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadBtnText: { fontSize: 16, color: colors.textMuted, fontWeight: '500' },
  saveBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnDisabled: { backgroundColor: colors.textMuted, opacity: 0.8 },
  saveBtnText: { fontSize: 18, fontWeight: '700', color: colors.white },
});
