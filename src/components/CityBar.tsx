import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CITIES } from '../data/cities';
import { colors } from '../theme';

type Props = {
  selectedCityId: string;
  onCityChange: (cityId: string) => void;
  /** When true, full-width bar for list view (no absolute overlay) */
  fullWidth?: boolean;
};

export function CityBar({ selectedCityId, onCityChange, fullWidth }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const currentCity = CITIES.find((c) => c.id === selectedCityId) ?? CITIES[0];

  return (
    <View style={fullWidth ? styles.wrapFullWidth : styles.wrap}>
      <TouchableOpacity
        style={fullWidth ? styles.barFullWidth : styles.bar}
        onPress={() => setDropdownOpen((o) => !o)}
        accessibilityLabel={`City: ${currentCity.name}. Change location`}
        accessibilityRole="button"
      >
        <Text style={styles.barText} numberOfLines={1}>
          {currentCity.name}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
      </TouchableOpacity>
      {dropdownOpen && (
        <View style={fullWidth ? styles.dropdownFullWidth : styles.dropdown}>
          {CITIES.map((city) => (
            <TouchableOpacity
              key={city.id}
              style={[styles.dropdownItem, city.id === selectedCityId && styles.dropdownItemActive]}
              onPress={() => {
                onCityChange(city.id);
                setDropdownOpen(false);
              }}
            >
              <Text style={[styles.dropdownItemText, city.id === selectedCityId && styles.dropdownItemTextActive]}>
                {city.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    zIndex: 10,
    alignItems: 'center',
  },
  wrapFullWidth: {
    width: '100%',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 28,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  barFullWidth: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#E5E7EB',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  barText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
  },
  dropdown: {
    marginTop: 8,
    alignSelf: 'stretch',
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownFullWidth: {
    width: '100%',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  dropdownItemActive: {
    backgroundColor: colors.border,
  },
  dropdownItemText: {
    fontSize: 16,
    color: colors.black,
  },
  dropdownItemTextActive: {
    fontWeight: '600',
    color: colors.accent,
  },
});
