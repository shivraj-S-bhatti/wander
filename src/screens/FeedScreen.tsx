import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { ActivityCard } from '../components/ActivityCard';
import { DEMO_CHECKINS, DEMO_PLACES } from '../data/demo';

const checkins = [...DEMO_CHECKINS].sort((a, b) => b.ts - a.ts);

export function FeedScreen() {
  const nav = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What friends are up to</Text>
      <FlatList
        data={checkins}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const place = DEMO_PLACES.find((p) => p.id === item.placeId);
          return (
            <ActivityCard
              checkin={item}
              onPress={() => place && nav.navigate('PlaceDetail' as never, { placeId: place.id } as never)}
            />
          );
        }}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: '700', padding: 16, paddingBottom: 8 },
  list: { paddingBottom: 24 },
});
