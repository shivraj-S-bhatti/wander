import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CITIES } from '../data/cities';
import { colors } from '../theme';

type Props = {
  selectedCityId: string;
  onCityChange: (cityId: string) => void;
};

export function CityChips({ selectedCityId, onCityChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.wrap}
      style={styles.scroll}
    >
      {CITIES.map((city) => {
        const selected = city.id === selectedCityId;
        return (
          <TouchableOpacity
            key={city.id}
            style={[styles.chip, selected && styles.chipSelected]}
            onPress={() => onCityChange(city.id)}
            accessibilityLabel={selected ? `${city.name} selected` : `Select ${city.name}`}
            accessibilityRole="button"
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]} numberOfLines={1}>
              {city.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
  wrap: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 12,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  chipSelected: {
    backgroundColor: colors.accent,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  chipTextSelected: {
    color: colors.white,
  },
});
