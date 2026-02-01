import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatDate, formatTime } from '../utils/time';

type Event = {
  id: string;
  title: string;
  description: string;
  startTs: number;
  endTs: number;
  pointsReward: number;
  joinedUserIds: string[];
};

type Props = {
  event: Event;
  joined: boolean;
  onJoin: () => void;
};

export function EventCard({ event, joined, onJoin }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.desc}>{event.description}</Text>
      <Text style={styles.meta}>
        {formatDate(event.startTs)} · {formatTime(event.startTs)} – {formatTime(event.endTs)}
      </Text>
      <View style={styles.row}>
        <Text style={styles.points}>+{event.pointsReward} civic points</Text>
        {!joined && (
          <TouchableOpacity style={styles.btn} onPress={onJoin}>
            <Text style={styles.btnText}>Join</Text>
          </TouchableOpacity>
        )}
        {joined && <Text style={styles.joined}>Joined</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  title: { fontWeight: '700', fontSize: 16, marginBottom: 6 },
  desc: { fontSize: 14, color: '#555', marginBottom: 8 },
  meta: { fontSize: 12, color: '#666', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  points: { fontSize: 12, color: '#059669', fontWeight: '600' },
  btn: { backgroundColor: '#facc15', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  btnText: { color: '#1a1a2e', fontWeight: '600' },
  joined: { fontSize: 12, color: '#059669', fontWeight: '600' },
});
