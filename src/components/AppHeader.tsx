import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { CITIES } from '../data/cities';

const logoSource = require('../assets/wander-high-resolution-logo-transparent.png');

type ViewMode = 'list' | 'map';

type Props = {
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  /** Optional text shown next to the logo (e.g. "Join events, earn civic points") */
  subtitle?: string;
  /** Optional element on the right side of the header (e.g. bell icon for friend requests) */
  rightElement?: React.ReactNode;
  /** Optional element in the center of the header (e.g. plan star button) */
  centerElement?: React.ReactNode;
  /** Selected city id for "Wander [City]" — when set, shows location dropdown next to logo */
  selectedCityId?: string;
  onCityChange?: (cityId: string) => void;
};

export function AppHeader({ viewMode, onViewModeChange, subtitle, rightElement, centerElement, selectedCityId, onCityChange }: Props) {
  const insets = useSafeAreaInsets();
  const showToggle = viewMode != null && onViewModeChange != null;
  const showLocation = selectedCityId != null && onCityChange != null;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const currentCity = CITIES.find((c) => c.id === selectedCityId) ?? CITIES[0];

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 8) }]}>
      <View style={styles.row}>
        <Image source={logoSource} style={styles.logo} resizeMode="contain" accessibilityLabel="Wander" />
        {showLocation && (
          <TouchableOpacity
            style={styles.locationChip}
            onPress={() => setDropdownOpen((o) => !o)}
            accessibilityLabel={`Wander ${currentCity.displayName}. Change location`}
            accessibilityRole="button"
          >
            <Text style={styles.locationChipText} numberOfLines={1}>
              {currentCity.displayName}
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
        {showLocation && dropdownOpen && (
          <View style={styles.dropdown}>
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
        {subtitle != null && centerElement == null ? (
          <View style={styles.subtitleWrap}>
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>
        ) : null}
        {centerElement != null ? (
          <View style={styles.centerWrap}>{centerElement}</View>
        ) : null}
        {rightElement != null ? (
          <View style={styles.rightElement}>{rightElement}</View>
        ) : null}
        {showToggle && (
          <View style={styles.toggle}>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
              onPress={() => onViewModeChange('list')}
              accessibilityLabel="List view"
              accessibilityRole="button"
            >
              <Ionicons
                name="list-outline"
                size={18}
                color={viewMode === 'list' ? colors.white : colors.textMuted}
              />
              <Text style={[styles.toggleLabel, viewMode === 'list' && styles.toggleLabelActive]}>
                List
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'map' && styles.toggleBtnActive]}
              onPress={() => onViewModeChange('map')}
              accessibilityLabel="Map view"
              accessibilityRole="button"
            >
              <Ionicons
                name="map-outline"
                size={18}
                color={viewMode === 'map' ? colors.white : colors.textMuted}
              />
              <Text style={[styles.toggleLabel, viewMode === 'map' && styles.toggleLabelActive]}>
                Map
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  logo: {
    height: 32,
    width: 120,
    marginRight: 8,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: colors.border,
    maxWidth: 140,
  },
  locationChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  dropdown: {
    position: 'absolute',
    top: 44,
    left: 136,
    minWidth: 160,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1001,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownItemActive: {
    backgroundColor: colors.border,
  },
  dropdownItemText: {
    fontSize: 15,
    color: colors.black,
  },
  dropdownItemTextActive: {
    fontWeight: '600',
    color: colors.accent,
  },
  subtitleWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 0,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
  },
  rightElement: {
    marginLeft: 'auto',
  },
  toggle: {
    flexDirection: 'row',
    marginLeft: 'auto',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  toggleBtnActive: {
    backgroundColor: colors.accent,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  toggleLabelActive: {
    color: colors.white,
  },
});
