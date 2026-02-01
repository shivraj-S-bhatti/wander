import React from 'react';
import { Image, StyleSheet, TextInput, View } from 'react-native';
import { colors } from '../theme';

const logoSource = require('../assets/wander-high-resolution-logo-transparent.png');

type Props = {
  showCityInput?: boolean;
  city?: string;
  onCityChange?: (city: string) => void;
};

export function AppHeader({ showCityInput, city = 'Boston', onCityChange }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Image source={logoSource} style={styles.logo} resizeMode="contain" accessibilityLabel="Wander" />
        {showCityInput ? (
          <TextInput
            style={styles.cityInput}
            value={city}
            onChangeText={onCityChange}
            placeholder="City"
            placeholderTextColor={colors.placeholder}
          />
        ) : null}
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
  cityInput: {
    flex: 1,
    minWidth: 100,
    fontSize: 16,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.black,
    marginRight: 16,
  },
});
