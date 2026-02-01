import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { setCredentials } from './authSlice';
import { getStoredAuth } from '../services/authStorage';
import type { AppDispatch } from './reduxStore';
import { colors } from '../theme';

type Props = { children: React.ReactNode };

const HYDRATE_TIMEOUT_MS = 3000;

export function AuthHydration({ children }: Props) {
  const [hydrated, setHydrated] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const done = () => {
      if (!cancelled) setHydrated(true);
    };
    timeoutRef.current = setTimeout(done, HYDRATE_TIMEOUT_MS);

    getStoredAuth()
      .then((auth) => {
        if (!cancelled && auth) dispatch(setCredentials({ user: auth.user, token: auth.token }));
      })
      .catch(() => {})
      .finally(() => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        done();
      });

    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [dispatch]);

  if (!hydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }
  return <>{children}</>;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
