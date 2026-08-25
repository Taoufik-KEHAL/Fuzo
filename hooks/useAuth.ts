import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';

import { auth, ensureAnonymousSession } from '../lib/firebase';

interface AuthState {
  user: User | null;
  uid: string | null;
  isLoading: boolean;
}

/** Tracks the current (anonymous) Firebase session, starting one if none exists. */
export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(auth.currentUser);

  useEffect(() => {
    ensureAnonymousSession().catch((error) => {
      console.warn('[auth] failed to start anonymous session', error);
    });
    return onAuthStateChanged(auth, setUser);
  }, []);

  return { user, uid: user?.uid ?? null, isLoading: user === null };
}
