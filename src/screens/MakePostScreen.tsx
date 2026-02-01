import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { useStore } from '../state/store';
import { POINTS_POST } from '../state/store';

const RATING_OPTIONS = [1, 2, 3, 4, 5];
const TAG_OPTIONS = ['food', 'coffee', 'outdoors', 'volunteer', 'chill', 'party', 'quiet', 'local'];
const MAX_TAG_LENGTH = 24;

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function MakePostScreen() {
  const { addPost } = useStore();
  const [what, setWhat] = useState('');
  const [whoWith, setWhoWith] = useState('');
  const [rating, setRating] = useState(0);
  const [experience, setExperience] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [selectedDateTs, setSelectedDateTs] = useState(startOfDay(Date.now()));
  const [saved, setSaved] = useState(false);
  const [pointsToast, setPointsToast] = useState(false);

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
    const noonOnSelected = selectedDateTs + 12 * 60 * 60 * 1000;
    addPost(
      {
        what: what.trim(),
        whoWith: whoWith.trim(),
        rating: rating || 0,
        experience: experience.trim(),
        imageUris: [],
        tags,
      },
      noonOnSelected
    );
    setSaved(true);
    setPointsToast(true);
    setWhat('');
    setWhoWith('');
    setRating(0);
    setExperience('');
    setTags([]);
    setSelectedDateTs(startOfDay(Date.now()));
    setTimeout(() => setSaved(false), 2000);
    setTimeout(() => setPointsToast(false), 2500);
  };

  const days = Array.from({ length: 14 }, (_, i) => {
    const t = startOfDay(Date.now()) - i * 24 * 60 * 60 * 1000;
    return t;
  });

  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>What did you do?</Text>
          <TextInput
            style={styles.input}
            value={what}
            onChangeText={setWhat}
            placeholder="e.g. Coffee at The Hive"
            placeholderTextColor="#999"
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Who with?</Text>
          <TextInput
            style={styles.input}
            value={whoWith}
            onChangeText={setWhoWith}
            placeholder="e.g. Alex, Sam"
            placeholderTextColor="#999"
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.calendarStrip}>
            {days.map((ts) => {
              const d = new Date(ts);
              const dayNum = d.getDate();
              const dayName = d.toLocaleDateString([], { weekday: 'short' });
              const isSelected = ts === selectedDateTs;
              return (
                <TouchableOpacity
                  key={ts}
                  style={[styles.calendarDay, isSelected && styles.calendarDaySelected]}
                  onPress={() => setSelectedDateTs(ts)}
                >
                  <Text style={[styles.calendarDayName, isSelected && styles.calendarDayTextSelected]}>{dayName}</Text>
                  <Text style={[styles.calendarDayNum, isSelected && styles.calendarDayTextSelected]}>{dayNum}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
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
            placeholderTextColor="#999"
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
              placeholderTextColor="#999"
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
      </ScrollView>
      {pointsToast && (
        <View style={styles.pointsToast}>
          <Text style={styles.pointsToastText}>+{POINTS_POST} civic points!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  section: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  calendarStrip: { marginHorizontal: -4 },
  calendarDay: {
    width: 52,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  calendarDaySelected: { backgroundColor: '#facc15', borderColor: '#eab308' },
  calendarDayName: { fontSize: 11, color: '#666' },
  calendarDayNum: { fontSize: 18, fontWeight: '700', color: '#333', marginTop: 2 },
  calendarDayTextSelected: { color: '#1a1a2e' },
  ratingRow: { flexDirection: 'row', gap: 8 },
  ratingBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingBtnActive: { backgroundColor: '#facc15', borderColor: '#eab308' },
  ratingText: { fontSize: 16, fontWeight: '600', color: '#333' },
  ratingTextActive: { color: '#1a1a2e' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  tagChipActive: { backgroundColor: '#1a1a2e' },
  tagChipText: { fontSize: 14, color: '#333' },
  tagChipTextActive: { fontSize: 14, color: '#fff', fontWeight: '600' },
  customTagRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  customTagInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  addTagBtn: {
    backgroundColor: '#facc15',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addTagBtnText: { fontSize: 14, fontWeight: '700', color: '#1a1a2e' },
  addTagBtnTextDisabled: { color: '#999' },
  tagChipCustom: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    borderWidth: 1,
    borderColor: '#a5b4fc',
  },
  tagChipCustomText: { fontSize: 14, color: '#4338ca' },
  pointsToast: {
    position: 'absolute',
    bottom: 32,
    left: 16,
    right: 16,
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  pointsToastText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  uploadBtn: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e5e5e5',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadBtnText: { fontSize: 16, color: '#666', fontWeight: '500' },
  saveBtn: {
    backgroundColor: '#facc15',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnDisabled: { backgroundColor: '#d4d4d4', opacity: 0.8 },
  saveBtnText: { fontSize: 18, fontWeight: '700', color: '#1a1a2e' },
});
