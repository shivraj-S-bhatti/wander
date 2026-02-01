import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { getDirections, type DirectionsResult } from '../services/directions';

import { GOOGLE_MAPS_API_KEY } from '../config';

const DIRECTIONS_API_KEY = GOOGLE_MAPS_API_KEY;

type Props = {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  onClose?: () => void;
};

export function RouteSheet({ origin, destination, onClose }: Props) {
  const [result, setResult] = useState<DirectionsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const key = DIRECTIONS_API_KEY || 'no-key';
    getDirections(origin, destination, key)
      .then(setResult)
      .catch(() => setError('Could not load routes'))
      .finally(() => setLoading(false));
  }, [origin.lat, origin.lng, destination.lat, destination.lng]);

  if (loading) {
    return (
      <View style={styles.sheet}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Getting routes…</Text>
      </View>
    );
  }
  if (error || !result) {
    return (
      <View style={styles.sheet}>
        <Text style={styles.error}>{error || 'No routes'}</Text>
      </View>
    );
  }

  const drive = result.driving;
  const transit = result.transit;

  return (
    <View style={styles.sheet}>
      <Text style={styles.title}>Get there</Text>
      {drive && (
        <View style={styles.row}>
          <Text style={styles.mode}>🚗 Driving</Text>
          <Text style={styles.detail}>
            {Math.round(drive.durationSeconds / 60)} min · {Math.round(drive.distanceMeters / 1609.34 * 10) / 10} mi
            {drive.costRideshare != null && ` · ~$${drive.costRideshare.toFixed(2)}`}
          </Text>
        </View>
      )}
      {transit && (
        <View style={styles.row}>
          <Text style={styles.mode}>🚌 Transit</Text>
          <Text style={styles.detail}>
            {Math.round(transit.durationSeconds / 60)} min · ~$2.90
          </Text>
        </View>
      )}
      {!transit && drive && (
        <Text style={styles.footnote}>Transit not available for this route</Text>
      )}
      {result.fallback && (
        <Text style={styles.footnote}>Estimate based on distance (no API key)</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontWeight: '700', fontSize: 18, marginBottom: 16 },
  row: { alignSelf: 'stretch', marginBottom: 12 },
  mode: { fontWeight: '600', fontSize: 15, marginBottom: 4 },
  detail: { fontSize: 14, color: '#555' },
  loadingText: { marginTop: 8, color: '#666' },
  error: { color: '#dc2626' },
  footnote: { fontSize: 11, color: '#999', marginTop: 12 },
});
