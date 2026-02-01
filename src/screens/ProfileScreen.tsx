import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { DEMO_PLACES } from '../data/demo';
import { PlaceCard } from '../components/PlaceCard';
import { useStore } from '../state/store';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_KEY || ''; // .env; empty = fallback

export function ProfileScreen() {
  const { state, setPrefs, refreshRecs, getBadges } = useStore();
  const { civicPoints, prefs, lastGeminiRecs, loadingRecs, recsError } = state.profile;
  const badges = getBadges();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Civic points</Text>
        <Text style={styles.points}>{civicPoints}</Text>
        <View style={styles.badges}>
          {badges.map((b) => (
            <Text key={b.label} style={[styles.badge, b.unlocked && styles.badgeUnlocked]}>
              {b.label} {b.unlocked ? '✓' : `(${b.label})`}
            </Text>
          ))}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Vibe</Text>
          <View style={styles.chips}>
            {(['chill', 'party', 'quiet', 'outdoors'] as const).map((v) => (
              <TouchableOpacity
                key={v}
                style={[styles.chip, prefs.vibe === v && styles.chipActive]}
                onPress={() => setPrefs({ vibe: prefs.vibe === v ? undefined : v })}
              >
                <Text style={prefs.vibe === v ? styles.chipTextActive : styles.chipText}>{v}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Budget</Text>
          <View style={styles.chips}>
            {(['low', 'med', 'high'] as const).map((b) => (
              <TouchableOpacity
                key={b}
                style={[styles.chip, prefs.budget === b && styles.chipActive]}
                onPress={() => setPrefs({ budget: prefs.budget === b ? undefined : b })}
              >
                <Text style={prefs.budget === b ? styles.chipTextActive : styles.chipText}>{b}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tonight's recommendations</Text>
        {loadingRecs && <ActivityIndicator style={styles.loader} />}
        {recsError && <Text style={styles.error}>{recsError}</Text>}
        <TouchableOpacity style={styles.refreshBtn} onPress={() => refreshRecs(GEMINI_API_KEY)} disabled={loadingRecs}>
          <Text style={styles.refreshBtnText}>{lastGeminiRecs ? 'Refresh' : 'Get recommendations'}</Text>
        </TouchableOpacity>
        {lastGeminiRecs?.map((rec) => {
          const place = DEMO_PLACES.find((p) => p.id === rec.placeId);
          if (!place) return null;
          return (
            <View key={rec.placeId} style={styles.rec}>
              <PlaceCard place={place} />
              <Text style={styles.recReason}>{rec.reason}</Text>
              <Text style={styles.recTime}>{rec.suggestedTime}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingBottom: 24 },
  title: { fontSize: 22, fontWeight: '700', padding: 16, paddingBottom: 8 },
  section: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 16, borderRadius: 12, padding: 16 },
  sectionTitle: { fontWeight: '700', fontSize: 16, marginBottom: 12 },
  points: { fontSize: 28, fontWeight: '800', color: '#1a1a2e', marginBottom: 8 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: { fontSize: 12, color: '#999', marginRight: 8 },
  badgeUnlocked: { color: '#059669', fontWeight: '600' },
  row: { marginBottom: 12 },
  label: { fontSize: 12, color: '#666', marginBottom: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#eee' },
  chipActive: { backgroundColor: '#1a1a2e' },
  chipText: { fontSize: 14, color: '#333' },
  chipTextActive: { fontSize: 14, color: '#fff', fontWeight: '600' },
  loader: { marginVertical: 12 },
  error: { fontSize: 12, color: '#dc2626', marginBottom: 8 },
  refreshBtn: { backgroundColor: '#6366f1', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  refreshBtnText: { color: '#fff', fontWeight: '600' },
  rec: { marginTop: 12, marginBottom: 8 },
  recReason: { fontSize: 13, color: '#555', marginTop: 4, fontStyle: 'italic' },
  recTime: { fontSize: 12, color: '#059669', marginTop: 2 },
});
