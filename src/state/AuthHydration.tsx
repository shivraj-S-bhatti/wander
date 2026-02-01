import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials } from './authSlice';
import { getStoredAuth } from '../services/authStorage';
import type { AppDispatch } from './reduxStore';

type Props = { children: React.ReactNode };

export function AuthHydration({ children }: Props) {
  const [hydrated, setHydrated] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    getStoredAuth()
      .then((auth) => {
        if (auth) dispatch(setCredentials({ user: auth.user, token: auth.token }));
      })
      .finally(() => setHydrated(true));
  }, [dispatch]);

  if (!hydrated) return null;
  return <>{children}</>;
}
