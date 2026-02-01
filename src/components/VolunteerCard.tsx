import React from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

const EVENT_IMAGES: Record<string, number> = {
  e_1: require('../assets/pics/cleanup.jpg'),
  e_2: require('../assets/pics/kitchen.jpeg'),
  e_3: require('../assets/pics/clothing.jpeg'),
};

const COIN_COLOR = '#D4AF37';

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

export function VolunteerCard({ event, joined, onJoin }: Props) {
  const imageSource = EVENT_IMAGES[event.id] ?? EVENT_IMAGES.e_1;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={joined ? undefined : onJoin}
      activeOpacity={joined ? 1 : 0.85}
      disabled={joined}
    >
      <ImageBackground source={imageSource} style={styles.image} resizeMode="cover">
        <View style={styles.overlay} />
        {joined && (
          <View style={styles.joinedBadge}>
            <Text style={styles.joinedLabel}>Joined</Text>
          </View>
        )}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {event.title}
          </Text>
          <View style={styles.pointsRow}>
            <Ionicons name="cash-outline" size={18} color={COIN_COLOR} />
            <Text style={styles.points}>+{event.pointsReward} pts</Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    height: 160,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 6,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  points: {
    fontSize: 13,
    fontWeight: '600',
    color: COIN_COLOR,
  },
  joinedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  joinedLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
});
