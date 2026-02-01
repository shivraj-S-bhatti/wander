import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

type TabName = 'MakePost' | 'Explore' | 'Community' | 'Profile';

type Props = {
  showCityInput?: boolean;
  city?: string;
  onCityChange?: (city: string) => void;
};

const NAV: { label: string; tab: TabName }[] = [
  { label: 'make a post', tab: 'MakePost' },
  { label: 'explore', tab: 'Explore' },
  { label: 'community', tab: 'Community' },
  { label: 'profile', tab: 'Profile' },
];

export function AppHeader({ showCityInput, city = 'Boston', onCityChange }: Props) {
  const navigation = useNavigation();

  const jumpTo = (tab: TabName) => {
    (navigation as any).navigate(tab);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.title}>Wander</Text>
        {showCityInput ? (
          <TextInput
            style={styles.cityInput}
            value={city}
            onChangeText={onCityChange}
            placeholder="City"
            placeholderTextColor="#999"
          />
        ) : null}
        <View style={styles.nav}>
          {NAV.map(({ label, tab }) => (
            <Text key={tab} style={styles.navLink} onPress={() => jumpTo(tab)}>
              {label}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginRight: 16,
  },
  cityInput: {
    flex: 1,
    minWidth: 100,
    fontSize: 16,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    marginRight: 16,
  },
  nav: {
    flexDirection: 'row',
    gap: 12,
    marginLeft: 'auto',
  },
  navLink: {
    fontSize: 14,
    color: '#333',
  },
});
