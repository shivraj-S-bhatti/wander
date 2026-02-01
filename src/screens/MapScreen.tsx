import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { RouteSheet } from '../components/RouteSheet';
import { DEMO_EVENTS, DEMO_PLACES } from '../data/demo';

const SF_REGION = {
  latitude: 37.7849,
  longitude: -122.4094,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

// Demo: "your" location for route origin
const MY_LOCATION = { lat: 37.7812, lng: -122.4112 };

export function MapScreen() {
  const nav = useNavigation();
  const [routeDestination, setRouteDestination] = useState<{ lat: number; lng: number } | null>(null);

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={SF_REGION}
        mapType="standard"
      >
        {DEMO_PLACES.map((place) => (
          <Marker
            key={place.id}
            coordinate={{ latitude: place.lat, longitude: place.lng }}
            title={place.name}
            description={place.category}
            onCalloutPress={() => nav.navigate('PlaceDetail' as never, { placeId: place.id } as never)}
            onPress={() => setRouteDestination({ lat: place.lat, lng: place.lng })}
          />
        ))}
        {DEMO_EVENTS.map((ev) => (
          <Marker
            key={ev.id}
            coordinate={{ latitude: ev.lat, longitude: ev.lng }}
            title={ev.title}
            pinColor="green"
          />
        ))}
      </MapView>
      {routeDestination && (
        <View style={styles.sheetWrap}>
          <RouteSheet
            origin={MY_LOCATION}
            destination={routeDestination}
            onClose={() => setRouteDestination(null)}
          />
          <Text style={styles.dismiss} onPress={() => setRouteDestination(null)}>Close</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sheetWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '40%',
  },
  dismiss: { color: '#6366f1', textAlign: 'center', marginTop: 8, fontWeight: '600' },
});
