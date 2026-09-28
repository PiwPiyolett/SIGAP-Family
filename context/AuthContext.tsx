// context/AuthContext.tsx — provider status auth global.
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { auth } from '@/services/firebase';

interface AuthState {
  user: FirebaseUser | null;
  initializing: boolean;
}

const AuthContext = createContext<AuthState>({ user: null, initializing: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setInitializing(false);
    });
    return unsub;
  }, []);

  return <AuthContext.Provider value={{ user, initializing }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
