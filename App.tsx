import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { StoreProvider } from './src/state/store';
import { FeedScreen } from './src/screens/FeedScreen';
import { MapScreen } from './src/screens/MapScreen';
import { CommunityScreen } from './src/screens/CommunityScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { PlaceDetailScreen } from './src/screens/PlaceDetailScreen';

export type RootStackParamList = {
  MainTabs: undefined;
  PlaceDetail: { placeId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
      }}
    >
      <Tab.Screen name="Feed" component={FeedScreen} options={{ tabBarLabel: 'Feed' }} />
      <Tab.Screen name="Map" component={MapScreen} options={{ tabBarLabel: 'Map' }} />
      <Tab.Screen name="Community" component={CommunityScreen} options={{ tabBarLabel: 'Community' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: true }}>
          <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen
            name="PlaceDetail"
            component={PlaceDetailScreen}
            options={{ title: 'Place' }}
          />
        </Stack.Navigator>
        <StatusBar style="dark" />
      </NavigationContainer>
    </StoreProvider>
  );
}
