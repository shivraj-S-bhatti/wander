import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

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
};

export function AppHeader({ viewMode, onViewModeChange, subtitle, rightElement, centerElement }: Props) {
  const insets = useSafeAreaInsets();
  const showToggle = viewMode != null && onViewModeChange != null;

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 8) }]}>
      <View style={styles.row}>
        <Image source={logoSource} style={styles.logo} resizeMode="contain" accessibilityLabel="Wander" />
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
    marginRight: 16,
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
